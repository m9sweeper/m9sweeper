import {Injectable} from '@nestjs/common';
import {AdmissionReviewDto} from '../dto/admission-review.dto';
import {AdmissionReviewReplyDto, AdmissionReviewReplyResponseStatus} from '../dto/admission-review-reply.dto';
import {ImageService} from '../../image/services/image.service';
import {V1Pod} from '@kubernetes/client-node/dist/gen/model/v1Pod';
import {K8sImageService} from '../../k8s-image/services/k8s-image.service';
import {ExceptionsService} from '../../exceptions/services/exceptions.service';
import {ClusterService} from '../../cluster/services/cluster.service';
import {ClusterDto} from '../../cluster/dto/cluster-dto';
import { PodComplianceService } from '../../pod/services/pod-compliance.service';
import { PodComplianceDto } from '../../pod/dto/pod-history-compliance-dto';
import { ListOfImagesDto } from '../../image/dto/image-result.dto';
import { PodComplianceResultDto } from '../../pod/dto/pod-compliance-result-dto';
import { ImageDto } from '../../image/dto/image-dto';
import {DockerRegistriesService} from '../../docker-registries/services/docker-registries.service';

@Injectable()
export class ClusterValidationService {
    constructor(private readonly imageService: ImageService,
                private readonly exceptionService: ExceptionsService,
                private readonly k8sImageService: K8sImageService,
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
        const namespace = validationRequest.request?.namespace;

        // get associated cluster and check whether enforcement is enabled
        const cluster: ClusterDto = await this.clusterService.getClusterById(clusterId);

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

        const imagesToCheckCompliance: ListOfImagesDto[] = [];
        const unscannedImageNames: string[] = []

        for (const container of pod?.spec?.containers || []) {
            const imageInfo = this.k8sImageService.parseDockerImageUrl(container.image);
            // The parse docker image url sometimes puts the image name in the path and has the image name empty due to how it matches.
            // This will join them with a slash if both are defined, otherwise it will only use the non-empty one.
            const imageName = imageInfo.path && imageInfo.imageName
              ? `${imageInfo.path}/${imageInfo.imageName}`
              : imageInfo.imageName || imageInfo.path;

            const image = await this.findOrCreateImage(clusterId, imageInfo.host, imageName, imageInfo.tag);

            if (image.isNew) {
                // Gets the exceptions for the cluster & namespace that are not policy specific
                const exceptions = await this.exceptionService.getAllFilteredPolicyExceptions(clusterId, undefined, namespace);
                // Filter exceptions to only include ones that have a matching image name match, and are not for a specific scanner or CVE
                const relevantExceptions = this.exceptionService.filterExceptionsByImageName(imageName, exceptions)
                  .filter(ex => !ex.issueIdentifier && !ex.scannerId);

                // If the image is new, and has no applicable exceptions this will fail the container after we check for any other new images
                if (!relevantExceptions?.length) {
                    unscannedImageNames.push(imageName);
                }
            } else {
                // If the image is not new, add it to the list of images to check compliance
                imagesToCheckCompliance.push(image.image);
            }
        }

        // Fail the validation due to having one or more unscanned images.
        if (unscannedImageNames?.length) {
            allowed = false;
            message = `Blocked by m9sweeper: pod contains unscanned image(s): ${unscannedImageNames.join(', ')}`;
            response.response.status = new AdmissionReviewReplyResponseStatus();
            response.response.status.message = message
            response.response.allowed = allowed;
            return response;
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
            images: imagesToCheckCompliance
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
