import {Injectable} from '@nestjs/common';
import {AdmissionReviewDto} from '../dto/admission-review.dto';
import {AdmissionReviewReplyDto, AdmissionReviewReplyResponseStatus} from '../dto/admission-review-reply.dto';
import {PolicyService} from '../../policy/services/policy-service';
import {ImageService} from '../../image/services/image.service';
import {ImageScanResultsIssueService} from '../../image-scan-results-issue/services/image-scan-results.service';
import {ConfigService} from '@nestjs/config';
import {V1Pod} from '@kubernetes/client-node/dist/gen/model/v1Pod';
import {K8sImageService} from '../../k8s-image/services/k8s-image.service';
import {ExceptionsService} from '../../exceptions/services/exceptions.service';
import {ClusterService} from '../../cluster/services/cluster.service';
import {ClusterDto} from '../../cluster/dto/cluster-dto';
import {LicensingPortalService} from '../../../integrations/licensing-portal/licensing-portal.service';
import {AppSettingsService} from '../../settings/services/app-settings.service';
import { PodComplianceService } from '../../pod/services/pod-compliance.service';
import { PodComplianceDto } from '../../pod/dto/pod-history-compliance-dto';
import { ListOfImagesDto } from '../../image/dto/image-result.dto';
import { PodComplianceResultDto } from '../../pod/dto/pod-compliance-result-dto';
import { ImageDto } from '../../image/dto/image-dto';
import {DockerRegistriesService} from '../../docker-registries/services/docker-registries.service';

@Injectable()
export class ClusterValidationService {
    constructor(private readonly policyService: PolicyService,
                private readonly imageService: ImageService,
                private readonly imageScanResultsIssueService: ImageScanResultsIssueService,
                private readonly configService: ConfigService,
                private readonly exceptionService: ExceptionsService,
                private readonly k8sImageService: K8sImageService,
                private readonly licensingPortalService: LicensingPortalService,
                private readonly appSettingsService: AppSettingsService,
                private readonly clusterService: ClusterService,
                private readonly podComplianceService: PodComplianceService,
                private readonly dockerRegistriesService: DockerRegistriesService,
                ) {
    }

    /**
     * Validate the webhook request from Kubernetes clusters. This evaluates the deployment or pod and determines if
     * it fits within the policies defined. If it does, this should reply with the allowed field set to true, if it
     * does not pass a policy it should return a reply with the allowed field set to false. Refer to the link below
     * for more information on Kubernetes Webhook requests and responses.
     *
     * @see https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-request-and-response
     *
     * @param clusterId             the id of the cluster this request is for
     * @param validationRequest     the parsed request from the k8s webhook
     */
    async validateRequest(clusterId: number, validationRequest: AdmissionReviewDto): Promise<AdmissionReviewReplyDto> {
        // parse request
        const response = new AdmissionReviewReplyDto();
        response.apiVersion = validationRequest.apiVersion;
        response.kind = validationRequest.kind;
        response.response.uid = validationRequest.request.uid;

        // get associated cluster and check whether enforcement is enabled
        const cluster: ClusterDto = await this.clusterService.getClusterById(clusterId);

        // validate license and only enforce if license is valid
        const checkLicenseValidity = await this.licensingPortalService.checkLicenseValidityFromDash();

        // If enforcement isn't supported or enforced, skip validation
        /*if (checkLicenseValidity.isLicenseSetup === false) {
            // is license is not setup, let everything through, no need to validate the image.
            response.response.allowed = true;
            response.licenseStatusMessage = `${validationRequest.request.name} in ${validationRequest.request.namespace} was allowed without scanning because license was not setup.`;
            return response;
        } else if (!checkLicenseValidity.validity) { // its NO LONGER valid (it expired)
            response.response.allowed = true;
            response.licenseStatusMessage = `${validationRequest.request.name} in ${validationRequest.request.namespace} was allowed without scanning because license has been expired.`;
            return response;
        } else if (await this.appSettingsService.doesLicenseHaveImageScanningEnforcement() === false) {
            response.response.allowed = true;
            response.licenseStatusMessage = `${validationRequest.request.name} in ${validationRequest.request.namespace} was allowed without scanning because license does not have image scanning feature.`;
            return response;
        } else */
        
        if (!cluster.isEnforcementEnabled) {
            response.response.allowed = true;
            response.enforcementMessage = 'Webhook Enforcement has been disabled. Thus Image Validation is being skipped.';
            return response;
        }

        // This variable will store whether or not we will allow the pod to be deployed
        let allowed = true;

        // Used if a policy is failed, this can return a message.
        let message = "";

        // build request to calculate compliance
        const pod: V1Pod = validationRequest.request.object;

        const listOfImages: ListOfImagesDto[] = [];

        for (const container of pod.spec?.containers) {
            const imageInfo = this.k8sImageService.parseDockerImageUrl(container.image);
            // The parse docker image url sometimes puts the image name in the path and has the image name empty due to how it matches.
            // This will join them with a slash if both are defined, otherwise it will only use the non-empty one.
            const imageName = imageInfo.path && imageInfo.imageName
              ? `${imageInfo.path}/${imageInfo.imageName}`
              : imageInfo.imageName || imageInfo.path;

            const image = await this.findOrCreateImage(clusterId, imageInfo.host, imageName, imageInfo.tag);

            if (image.isNew) {
                allowed = false;
                message = `Blocked by m9sweeper: pod contains an unscanned image: ${imageName}`;
                response.response.status = new AdmissionReviewReplyResponseStatus();
                response.response.status.message = message
                response.response.allowed = allowed;
                return response;
            }

            listOfImages.push(image.image);
        }

        const podComplianceDto: PodComplianceDto = Object.assign(new PodComplianceDto(), {
            id: null, // not known
            name: pod.metadata.name,
            selfLink: pod.metadata.selfLink,
            uid: pod.metadata.uid,
            resourceVersion: pod.metadata.resourceVersion,
            namespace: pod.metadata.namespace,
            generateName: pod.metadata.generateName,
            creationTimestamp: pod.metadata.creationTimestamp,
            compliant: null, // not known
            clusterId: clusterId,
            podStatus: null, // not known
            savedDate: null, // not known
            images: listOfImages
        });

        const complianceResult: PodComplianceResultDto =
          (await this.podComplianceService.calculatePodNamespaceCompliance([podComplianceDto]))[0];

        if (!complianceResult.compliant) {
            allowed = false;
            message = 'Blocked by m9sweeper: contains a non-compliant or unscanned image: ' +
              complianceResult.reason;
        }

        // Set if the deployment or pod should be allowed to continue.
        response.response.allowed = allowed;

        // If it fails a policy, set the status code and message for more verbose
        // output in Kubernetes logs.
        if (!allowed) {
            response.response.status = new AdmissionReviewReplyResponseStatus();
            response.response.status.message = message;
        }

        // Return the response
        return response;
    }

    protected async findOrCreateImage(clusterId: number, host: string, imageName: string, tag: string): Promise<{image: ListOfImagesDto, isNew: boolean}> {
        // Get all aliases of the docker registry to check against
        let hostsToCheck: string[];
        const registryIds = await this.dockerRegistriesService.getDockerRegistryIds({urls: [host]});
        if (registryIds.length) {
            const dockerRegistry = await this.dockerRegistriesService.getDockerRegistryById(registryIds[0]);
            hostsToCheck = dockerRegistry.aliases ?
                [dockerRegistry.hostname].concat(dockerRegistry.aliases) : [dockerRegistry.hostname];
        } else {
            // if the docker registry does not exist in the cluster, search against the image's hostname
            hostsToCheck = [host];
        }

        if (!tag) {
            tag = 'latest'; // if no tag was provided, assume it is latest
        }

        // Find and return the data related to the existing image if it exists
        for (const hostname of hostsToCheck ) {
            const existingImage = await this.imageService.getImageByClusterHostNameTag(clusterId, hostname, imageName, tag);
            if (!!existingImage) {
                return {image: existingImage, isNew: false};
            }
        }

        // If we didn't find an existing image above, create the image
        const createImageDto = new ImageDto();

        // Configure the new image
        createImageDto.url = host;
        createImageDto.name = imageName;
        createImageDto.tag = tag;
        createImageDto.dockerImageId = '';
        createImageDto.summary = '';

        await this.imageService.createImage(createImageDto, clusterId);
        const newImage = await this.imageService.getImageByClusterHostNameTag(clusterId, host, imageName, tag);
        return { image: newImage, isNew: true };
    }
}
