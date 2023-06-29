import {forwardRef, HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common'
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {ImageDto} from '../dto/image-dto';
import {ImageDao} from '../dao/image.dao';
import {ImageCreateDto} from '../dto/image-create.dto';
import {ListOfImagesDto} from '../dto/image-result.dto';
import {ClusterService} from '../../cluster/services/cluster.service';
import {ImageScanResultScannerDto} from '../dto/image-scan-result-scanner.dto';
import {ImageTrawlerResultDto} from '../dto/image-trawler-result.dto';
import {MessagingService} from '../../shared/services/messaging-service';
import { ConfigService } from '@nestjs/config';
import {ImageScanResultsDto, ImageScanResultWithIssuesDto, TotalSeverityResultsDto} from '../dto/image-scan-results.dto';
import {ImageScanCountDto} from '../dto/Image-scan-count.dto';
import {ImageDetailsDto} from '../open-api-schema/images-schema';
import {ClusterEventService} from '../../cluster-event/services/cluster-event.service';
import {isDefined} from 'class-validator';
import {MineLoggerService} from '../../shared/services/mine-logger.service';

@Injectable()
export class ImageService {
    constructor(private readonly imageDao: ImageDao,
                @Inject(forwardRef(() => ClusterService))
                private readonly clusterService: ClusterService,
                private readonly messagingService: MessagingService,
                private readonly configurationService: ConfigService,
                private readonly clusterEventService: ClusterEventService,
                private logger: MineLoggerService,
    ) {
    }

    async getAllImagesByClusterId(clusterId: number): Promise<{total: number, listOfImages: ListOfImagesDto[]}> {
        const images = {
            total: undefined,
            listOfImages: undefined
        }
        const checkClusterById = await this.clusterService.getClusterById(clusterId);
        if (checkClusterById) {
            const listOfImages = await this.imageDao.loadImage({'i.deleted_at': null, 'i.cluster_id': clusterId});
            const total = await this.imageDao.countImage({'i.deleted_at': null, 'i.cluster_id': clusterId});
            images.total = listOfImages;
            images.listOfImages = total;
            return images;
        }
    }

    async getAllRunningImagesByClusterId(clusterId: number):
      Promise<{total: string, listOfImages: ListOfImagesDto[]}> {
        const images = {
            total: undefined,
            listOfImages: undefined
        }
        const checkClusterById = await this.clusterService.getClusterById(clusterId);
        const imageSearchClauses = {'i.deleted_at': null, 'i.cluster_id': clusterId, 'i.running_in_cluster': true};
        if (checkClusterById) {
            const listOfImages = await this.imageDao.loadImage(imageSearchClauses);
            images.total = await this.imageDao.countImage(imageSearchClauses);
            images.listOfImages = listOfImages;
            return images;
        }
    }

    async checkIfImageAlreadyExists(imageDto: ImageDto, clusterId: number): Promise<boolean> {
      const imageAsString = imageDto.image = imageDto.url + '/' + imageDto.name + ':' + imageDto.tag;
      const listOfImages = await this.imageDao.loadImage({'i.image': imageAsString, 'i.cluster_id': clusterId, 'i.docker_image_id': imageDto.dockerImageId});
      return !!listOfImages?.length;
    }

    async createImage(image: ImageDto, clusterId: number, skipImageScan?: boolean): Promise<ListOfImagesDto> {
        const cluster = await this.clusterService.getClusterById(clusterId)
          .catch(e => {
            this.logger.warn({label: 'Cluster could not be retrieved by id', data: {clusterId, e}}, e);
            throw e;
          });
        if (!cluster) {
            this.logger.log({ label: 'Cluster could not be retrieved by id', data: {clusterId} });
            throw new HttpException('Cluster could not be retrieved by id.', HttpStatus.BAD_REQUEST);
        }
        if (await this.checkIfImageAlreadyExists(image, clusterId)) {
            this.logger.debug({ label: 'Image already exists; not created', data: {image, clusterId} });
            throw new HttpException('Image already exists; not created', HttpStatus.BAD_REQUEST);
        }
        const createdImageIds: Array<{ id: number }> = await this.imageDao.createImage(instanceToPlain(image), clusterId)
          .catch(e => {
            this.logger.warn({label: 'Image could not be created', data: {image, clusterId, e}}, e);
            throw e;
          });
        if (!createdImageIds || !Array.isArray(createdImageIds) || createdImageIds.length <= 0) {
            this.logger.log({ label: 'Image could not be created', data: {image, clusterId} });
            throw new HttpException('Image could not be created', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (!skipImageScan) {
            await this.createImageScanByImageId(createdImageIds, clusterId);
        }
        return this.getImageById(createdImageIds[0].id);
    }

    async deleteImageById(clusterId: number, imageId: number): Promise<number> {
        const checkClusterById = await this.clusterService.getClusterById(clusterId);
        if (checkClusterById) {
            return await this.imageDao.deleteImageById({
                'i.deleted_at': null,
                'i.id': imageId,
                'i.cluster_id': clusterId
            });
        }
    }

    async updateImageById(updateImageData: ImageCreateDto, clusterId: number, imageId: number): Promise<ListOfImagesDto> {

        const checkImageByImageId = await this.imageDao.loadImage({'i.id': imageId, 'i.cluster_id': clusterId, 'i.deleted_at': null});
        if (checkImageByImageId && checkImageByImageId.length > 0) {
            const result = await this.imageDao.updateImage(updateImageData, {'id': imageId, 'deleted_at': null, 'cluster_id': clusterId});
            const getUpdatedImageInfo = await this.imageDao.loadImage({'i.id': result, 'i.deleted_at': null, 'i.cluster_id': clusterId});
            return getUpdatedImageInfo[0];
        }
        throw new HttpException({message: 'Invalid Image/Cluster id'}, HttpStatus.NOT_FOUND)
    }

    async getImageByImageId(clusterId: number, imageId: number): Promise<ImageDto> {
        const checkClusterById = await this.clusterService.getClusterById(clusterId);
        if (checkClusterById) {
            const result = await this.imageDao.loadImageWithId(imageId, clusterId)
            if (result && result.length > 0) {
                return result[0];
            }
            throw new HttpException({message: 'Invalid image id'}, HttpStatus.NOT_FOUND)
        }
    }

    async getImageByImageName(clusterId: number, imageUrl: string, imageName: string, imageTag: string)
        : Promise<ImageDetailsDto> {
        const checkClusterById = await this.clusterService.getClusterById(clusterId);
        if (checkClusterById) {
            const result = await this.imageDao.loadImage({
                'i.url': imageUrl,
                'i.name': imageName,
                'i.tag': imageTag,
                'i.deleted_at': null,
                'i.cluster_id': clusterId
            });
            if (result && result.length > 0) {
                return plainToInstance(ImageDetailsDto, result[0], {excludeExtraneousValues: true});
            }
        }
    }

    async getImageByImageHash(clusterId: number, imageHash: string): Promise<ListOfImagesDto> {
        const checkClusterById = await this.clusterService.getClusterById(clusterId);
        if (checkClusterById) {
            const result = await this.imageDao.loadImage({
                'i.docker_image_id': imageHash,
                'i.deleted_at': null,
                'i.cluster_id': clusterId
            });
            if (result && result.length > 0) {
                return result[0];
            }
            throw new HttpException({message: 'Invalid image hash'}, HttpStatus.NOT_FOUND)
        }
    }

    async getImagesByClusterHostNameTag(clusterId: number, imageHostname: string, imageName: string, imageTag: string)
        : Promise<ListOfImagesDto[]> {
        const checkClusterById = await this.clusterService.getClusterById(clusterId);
        if (checkClusterById) {
            return this.imageDao.loadImage({
                'i.cluster_id': clusterId,
                'i.url': imageHostname,
                'i.name': imageName,
                'i.tag': imageTag
            });
        }
    }

    async getImageByClusterHostNameTag(clusterId: number, imageHostname: string, imageName: string, imageTag: string)
        : Promise<ListOfImagesDto> {
        const result = await this.getImagesByClusterHostNameTag(clusterId, imageHostname, imageName, imageTag);
        if (result && result.length > 0) {
            return result[0];
        }
    }

    async getImageById(imageId: number): Promise<ListOfImagesDto> {
        const result = await this.imageDao.loadImage({
            'i.id': imageId,
            'i.deleted_at': null,
        });
        if (result && result.length > 0) {
            return result[0];
        }
        throw new HttpException({message: 'Invalid image id'}, HttpStatus.NOT_FOUND)
    }

    async createImageScanByImageId(imageIds: Array<{ id: number }>, clusterId: number): Promise<boolean> {
        const checkClusterById = await this.clusterService.getClusterById(clusterId);
        if (checkClusterById) {
            const createScanImageResponseData = [];
            let commonErrorMessage = '';
            for (let i = 0; i < imageIds.length; i++) {

                const getImageDetailsForScanImage = await this.imageDao.getImageDetailsForScanImage({
                    'i.id': imageIds[i].id,
                    'i.deleted_at': null,
                    'i.cluster_id': clusterId
                });
                const excludedGlobalPolicies = await this.imageDao.countGlobalPoliciesNotIncludedInPolicyCluster(clusterId);
                if (getImageDetailsForScanImage?.length) {
                    if ((+getImageDetailsForScanImage[0].policyCount) + (+excludedGlobalPolicies.globalPolicyCount) > 0) {
                        getImageDetailsForScanImage[0].image.path = null;
                        const queueName = this.configurationService.get('messageQueue.imageScannerQueueName');
                        const sendRes = await this.messagingService.send(queueName, getImageDetailsForScanImage[0]);
                        createScanImageResponseData.push(sendRes);

                        if (sendRes) {
                            // set scan_queued to true
                            this.imageDao.setImageScanQueueStatus(imageIds[i].id, true);
                        }
                    } else {
                        commonErrorMessage = `No policy is found for "${getImageDetailsForScanImage[0].image.name}:${getImageDetailsForScanImage[0].image.tag}"`;
                    }
                } else {
                    commonErrorMessage = 'Invalid image id'
                }
            }

            if (createScanImageResponseData && createScanImageResponseData.length > 0) {
                return true
            }
            throw new HttpException({message: commonErrorMessage}, HttpStatus.NOT_FOUND)
        }
    }

    async saveImageScanDataByImageId(clusterId: number,
                                     imageId: number,
                                     imageTrawlerResultDto: ImageTrawlerResultDto,
                                     createdAt: number): Promise<number[]> {

        const getImageByImageId = await this.getImageByImageId(clusterId, imageId);

        if (getImageByImageId) {
            const plainImageScanResults: any = instanceToPlain(imageTrawlerResultDto);
            plainImageScanResults.image_id = imageId;
            plainImageScanResults.issues = JSON.stringify(plainImageScanResults.issues);
            plainImageScanResults.created_at = createdAt;
            const saveImageScan = await this.imageDao.saveImageScanByImageId(plainImageScanResults);
            const clusterEventObject = this.clusterEventService.createClusterEventObject(0, 'Image Scan', 'Create', 'Info', `${getImageByImageId.name} has been scanned.`, plainImageScanResults);
            await this.clusterEventService.createClusterEvent(clusterEventObject, clusterId);
            const imagesByHash = await this.getK8sImageByDockerImageHash(getImageByImageId.dockerImageId);
            if (imagesByHash.length > 0) {
                const image = imagesByHash.shift();
                const namespace = image.namespace;
                const imageName = image.image;
                const message = `Scan Result of image: ${imageName} has been saved`;

                await this.clusterEventService.createK8sClusterEvent('ImageScanned', 'Normal',
                    'Pod', imageName, message, clusterId, namespace);
            }
            return saveImageScan;
        } else {
            throw new Error('Invalid image id');
        }
    }

    async getImageScanDataByImageId(imageId: number, scanDate: number, page = 0, limit = 10,
                                    sort: { field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<{ totalCount: number, list: ImageScanResultsDto[] }> {

        const getImageById = await this.getImageById(imageId);
        if (getImageById) {
            const totalCount = await this.imageDao.getCountOfImageScanDataWithScanDate(imageId, scanDate);
            const list = await this.imageDao.getImageScanDataByImageId(imageId, scanDate, page, limit, sort);
            return {totalCount: +totalCount, list: list}
        }
    }

    async getLatestImageScanDataByImageId(imageId: number, policyId: number, scannerId: number): Promise<ImageScanResultsDto[]> {
        const getImageById = await this.getImageById(imageId);
        if (getImageById) {
            return this.imageDao.getLatestImageScanDataByImageId(imageId, policyId, scannerId);
        }
    }

    async getLatestImageScanDataByPolicy(imageId: number, policyId: number): Promise<ImageScanResultWithIssuesDto>{
        const getImageById = await this.getImageById(imageId);
        if (getImageById) {
            const results = await this.imageDao.getLatestImageScanDataByPolicy(imageId, policyId);
            if (results) {
                return results[0];
            }
        }

        return null;
    }

    async getCountOfImageScanData(imageId: number): Promise<number> {
        return this.imageDao.getCountOfImageScanData(imageId);
    }

    async totalVulnerabilitySeverityByCluster(clusterId: number,
                                              sort: { field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<TotalSeverityResultsDto[]> {
        return await this.imageDao.totalVulnerabilitySeverityByCluster(clusterId, sort);
    }

    async getCountOfTotalImagesRunningCount(filters: any): Promise<number> {
        const fields = {
            'clusterId': 'cluster_id',
            'runningInCluster': 'running_in_cluster',
        }

        const searchParams = {};

        Object.keys(fields).forEach(key => {
            if (filters.hasOwnProperty(key)) {
                searchParams[fields[key]] = filters[key];
            }
        });
        const images = await this.imageDao.getCountOfTotalImagesRunningCount(searchParams);
        return images[0].count;
    }

    async getCountOfFilteredImagesVulnerabilities(filters: any, groupBy: string): Promise<any> {
        return await this.imageDao.getCountOfFilteredImagesVulnerabilities(filters, groupBy);
    }


    async searchImageUnderClusterId(clusterId: number, searchTerm: string, cve = '', onlyRunning = false,
                                    page = 0,
                                    limit = 10,
                                    sort: { field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<{ totalCount: number, list: ImageDto[] }> {
        return this.imageDao.searchImageUnderClusterId(clusterId, searchTerm, page, limit, sort, {cve, onlyRunning});
    }

    async getScanImageScannerDetails(clusterId: number, imageId: number, scannerId: number): Promise<ImageScanResultScannerDto> {
        const checkClusterIdAndImageId = await this.getImageByImageId(clusterId, imageId);
        if (checkClusterIdAndImageId) {
            const result = await this.imageDao.getScanImageScannerDetails({
                'scan.id': scannerId,
                'scan.deleted_at': null,
                'scan.image_id': imageId
            });
            if (result && result.length > 0) {
                return result[0];
            }
            throw new HttpException({message: 'Invalid scanner id'}, HttpStatus.NOT_FOUND)
        }
    }

    async getTotalVulnerabilities(clusterId: number, filters: any): Promise<number> {
        const totalVulnerabilitiesArray = await this.imageDao.getTotalVulnerabilities(clusterId, filters);
        return (totalVulnerabilitiesArray && totalVulnerabilitiesArray.length > 0 && totalVulnerabilitiesArray[0].totalVulnerabilities) ? totalVulnerabilitiesArray[0].totalVulnerabilities : 0;
    }

    async getPolicyViolationCount(clusterId: number): Promise<{count: number}[]> {
        return await this.imageDao.getPolicyViolationCount(clusterId);
    }

    plaintToImage(imageCreateDto: ImageCreateDto): ImageDto {
        if (imageCreateDto instanceof ImageCreateDto) {
            const imageDto = new ImageDto();
            imageDto.name = imageCreateDto.name;
            imageDto.url = imageCreateDto.url;
            imageDto.tag = imageCreateDto.tag;
            imageDto.dockerImageId = 'TMP_' + Math.random().toString(36).slice(-8);
            imageDto.criticalIssues = 0;
            imageDto.majorIssues = 0;
            imageDto.mediumIssues = 0;
            imageDto.lowIssues = 0;
            imageDto.negligibleIssues = 0;
            imageDto.summary = '';
            // If the DTO specifies if the image is running in the cluster, use that value.
            // Otherwise, assume it is (for backwards compatibility reasons)
            imageDto.runningInCluster = isDefined(imageCreateDto.runningInCluster)
              ? imageCreateDto.runningInCluster
              : true;
            return imageDto;
        }
    }

    async getCountOfImageScan(clusterIds: any): Promise<ImageScanCountDto[]> {
        const fields = {
            'clusterId': 'cluster_id',
        }
        const searchParams = {};

        Object.keys(fields).forEach(key => {
            if (clusterIds && clusterIds.hasOwnProperty(key)) {
                searchParams[fields[key]] = clusterIds[key];
            }
        });
        return await this.imageDao.getCountOfImageScan(searchParams);
    }

    async getDistinctDatesForImageScan(imageId: number): Promise<Array<{created_at: number}[]>> {
        return this.imageDao.getDistinctDatesForImageScan(imageId);
    }

    async getImageSanQueueStatus(imageId: number): Promise<boolean> {
        // await this.imageDao.setImageScanQueueStatus(imageId, true);
        return await this.imageDao.getImageSanQueueStatus(imageId);
    }

    async getAllRunningImagesByPodId(
      clusterId: number, namespace: string, podId: number,
      page?: number, limit?: number,
      sort: {field: string; direction: string; } = {field: 'id', direction: 'desc'},
    ): Promise<{total: number, listOfImages: ListOfImagesDto[]}> {
        const images = await this.imageDao.getAllRunningImagesByPodId(clusterId, namespace, podId, page, limit, sort);
        return {
            total: images.length,
            listOfImages: images,
        };
    }

    async getAllRunningImagesByPodName(
      clusterId: number, namespace: string, podName: string,
      page?: number, limit?: number,
      sort: {field: string; direction: string; } = {field: 'id', direction: 'desc'},
    ): Promise<{total: number, listOfImages: ListOfImagesDto[]}> {
        const images = await this.imageDao.getAllRunningImagesByPodName(clusterId, namespace, podName, page, limit, sort);
        return {
            total: images.length,
            listOfImages: images,
        };
    }

    async getHistoricalImagesByPodIdAndDate(
      clusterId: number, namespace: string, podId: number,
      startTime: string, endTime: string,
      page?: number, limit?: number,
      sort: {field: string; direction: string; } = {field: 'id', direction: 'desc'},
    ): Promise<{total: number, listOfImages: ListOfImagesDto[]}> {
        const images = await this.imageDao.getHistoricalImagesByPodIdAndDAte(
          clusterId, namespace, podId,
          startTime, endTime,
          page, limit, sort,
        );
        return {
            total: images.length,
            listOfImages: images,
        };
    }

    async getHistoricalImagesByPodNameAndDate(
      clusterId: number, namespace: string, podName: string,
      startTime: string, endTime: string,
      page?: number, limit?: number,
      sort: {field: string; direction: string; } = {field: 'id', direction: 'desc'},
    ): Promise<{total: number, listOfImages: ListOfImagesDto[]}> {
        const images = await this.imageDao.getHistoricalImagesByPodNameAndDAte(
          clusterId, namespace, podName,
          startTime, endTime,
          page, limit, sort,
        );
        return {
            total: images.length,
            listOfImages: images,
        };
    }

    async setImageScanQueueStatus(imageId: number, b: boolean): Promise<void> {
        await this.imageDao.setImageScanQueueStatus(imageId, b);
    }

    async updateImageScanDateByImageId(imageId: number, result: string,
                                       critical_issues: number,
                                       major_issues: number,
                                       medium_issues: number,
                                       low_issues: number,
                                       negligible_issues: number,
                                       imageHash?: string): Promise<void> {
        await this.imageDao.updateImageScanDateByImageId(imageId, result,
          critical_issues, major_issues, medium_issues, low_issues, negligible_issues, imageHash);
    }

    async getK8sImageByDockerImageHash(imageHash: string): Promise<any> {
        return this.imageDao.getK8sImageByDockerImageHash(imageHash);
    }

    async getNamespaceByImageHash(imageHash: string): Promise<{ name: string }[]> {
        return this.imageDao.getNamespaceByImageHash(imageHash);
    }

    async getAllImagesByCompliance(complianceType: string): Promise<any>{
        return await this.imageDao.getAllImagesByCompliance(complianceType);
    }
}
