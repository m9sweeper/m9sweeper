import { Injectable } from '@nestjs/common';
import { K8sImageDao } from '../dao/k8s-image.dao';
import { K8sImageDto } from '../dto/k8s-image-dto';
import { ClusterEventService } from '../../cluster-event/services/cluster-event.service';
import {ImageService} from '../../image/services/image.service';
import {V1ContainerStatus, V1Pod} from '@kubernetes/client-node';
import {ListOfImagesDto} from '../../image/dto/image-result.dto';
import {ImageDto} from '../../image/dto/image-dto';
import {ImageDao} from '../../image/dao/image.dao';
import {V1Container} from '@kubernetes/client-node/dist/gen/model/v1Container';
import {DockerRegistriesDao} from '../../docker-registries/dao/docker-registries.dao';
import {ImageIdInClusterMap} from "../classes/imageIdInClusterMap";
import {UtilitiesService} from "../../shared/services/utilities.service";

@Injectable()
export class K8sImageService {
    DEFAULT_DOCKER_REGISTRY = 'docker.io';

    constructor(private readonly k8sImageDao:K8sImageDao,
                private readonly imageDao: ImageDao,
                private readonly clusterEventService: ClusterEventService,
                private readonly imageService: ImageService,
                private readonly dockerRegistriesDao: DockerRegistriesDao,
                protected readonly utilities: UtilitiesService
                ) {}

    async getAllK8sImages(clusterId: number, namespace: string, deployment: string, page: number = 0,
                          limit: number  = 10, sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<K8sImageDto[]> {
        return await this.k8sImageDao.getAllK8sImages(clusterId, namespace, deployment, page,limit, sort);
    }

    async getAllK8sImagesBySelectedDate(clusterId: number,
                                        namespace: string,
                                        deployment: string,
                                        startTime: string,
                                        endTime: string,
                                        page: number = 0,
                                        limit: number = 10,
                                        sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<K8sImageDto[]> {
        return await this.k8sImageDao.getAllK8sImagesBySelectedDate(clusterId, namespace, deployment, startTime, endTime, page, limit, sort);
    }

    async getCountOfCurrentImages(clusterId: number, namespace: string, deployment: string): Promise<number> {
        const totalK8sImages = await this.k8sImageDao.getCountOfCurrentImages(clusterId, namespace, deployment);
        return totalK8sImages[0].count;
    }

    async getCountOfImages(clusterId: number, namespace: string, deployment: string, startTime: string, endTime: string): Promise<number> {
        const totalK8sImages = await this.k8sImageDao.getCountOfImages(clusterId, namespace, deployment, startTime, endTime);
        return totalK8sImages[0].count;
    }

    async saveK8sImages(clusterId, images: Map<string, Array<V1Pod>>): Promise<{allImagesSavedSuccessfully: boolean, imageIdMapRunningInCluster: ImageIdInClusterMap}> {
        // Loop over all images and save them
        const imageIdMapRunningInCluster: ImageIdInClusterMap = new ImageIdInClusterMap();
        const namesOfImagesCurrentlyRunning: string[] = [];
        const kubernetesImageIds = [];
        images.forEach((pod, name) => namesOfImagesCurrentlyRunning.push(name));

        let allImagesSavedSuccessfully = true;

        for (const imageName of namesOfImagesCurrentlyRunning) {
            // save image
            console.log("Saving image details: " + imageName);

            // Loop over all the pods for each image
            const name = imageName;
            const pods = images.get(name);

            for (const pod of pods) {
               // Parse relevant data
                const container: V1Container = pod.spec.containers
                  .concat(pod.spec.initContainers ?? [])
                  .concat(pod.spec.ephemeralContainers ?? [])
                  .filter(container => container.image === name)
                  .shift();
                const containerStatus: V1ContainerStatus = pod.status.containerStatuses
                  .concat(pod.status.initContainerStatuses ?? [])
                  .concat(pod.status.ephemeralContainerStatuses ?? [])
                  .filter(status => status.name === container.name)
                  .shift();

                const formattedImageName = this.formatDockerImageUrl(name);
                const dockerImageDetails: {
                    host: string;
                    path: string;
                    imageName: string;
                    tag: string;
                } = this.parseDockerImageUrl(formattedImageName);

                const imageHash = this.utilities.extractImageHash(containerStatus.imageID);

                // Create ImageDTO
                const image = new ImageDto();

                image.dockerImageId = imageHash;
                image.url = dockerImageDetails.host;
                image.name = dockerImageDetails.path !== '' ? dockerImageDetails.path + '/' + dockerImageDetails.imageName : dockerImageDetails.imageName;
                image.tag = dockerImageDetails.tag;
                image.runningInCluster = !!(containerStatus.state?.running);
                image.summary = '';

                // Create K8sImageDTO
                const k8sImageDto = new K8sImageDto();
                k8sImageDto.clusterId = clusterId;
                k8sImageDto.compliant = false;
                k8sImageDto.name = name;
                k8sImageDto.imageHash = imageHash;
                k8sImageDto.namespace = pod.metadata.namespace;
                //k8sImageDto.imageId; // set later
                k8sImageDto.image = this.formatDockerImageUrl(name);

                // Persist to SQL DB (with de-duplication)
                try {
                    // Get all aliases of the docker registry to check against
                    const registryIds = await this.dockerRegistriesDao.getDockerRegistryIds({urls: [dockerImageDetails.host]})
                        .then(response => response.map(registry => registry.id));
                    let existingImageDtos = new Array<ListOfImagesDto>();
                    if (registryIds.length) {
                        const dockerRegistry = await this.dockerRegistriesDao.getDockerRegistryById(registryIds[0]);
                        const hostsToCheck = dockerRegistry.aliases ?
                            [dockerRegistry.hostname].concat(dockerRegistry.aliases) : [dockerRegistry.hostname];

                        // check against all aliases of the given hostname when searching for existing images
                        for (const hostname of hostsToCheck) {
                            const images = await this.imageService.getImagesByClusterHostNameTag(
                                k8sImageDto.clusterId, hostname, image.name, dockerImageDetails.tag);
                            if (images) {
                                existingImageDtos = existingImageDtos.concat(images);
                            }
                        }
                    } else {
                        // if an image has no associated docker registry, search images using the target images hostname
                        existingImageDtos = await this.imageService.getImagesByClusterHostNameTag(
                            k8sImageDto.clusterId, dockerImageDetails.host, image.name, dockerImageDetails.tag);
                    }

                    // Persist ImageDto (only if new)
                    const existingImageDto = existingImageDtos?.find(image => {
                        return image.id && k8sImageDto.imageHash === image.dockerImageId;
                    });
                    if (existingImageDto) {
                        // already exists!
                        imageIdMapRunningInCluster.setIdRunning(name, k8sImageDto.imageHash, existingImageDto.id);
                        k8sImageDto.imageId = existingImageDto.id;
                        // console.log("Image already exists in index: " + name);
                    } else {
                        // new! create it!
                        const savedImage = await this.imageService.createImage(image, clusterId, false);
                        if (savedImage && savedImage.id) {
                            imageIdMapRunningInCluster.setIdRunning(name, k8sImageDto.imageHash, existingImageDto.id);
                            k8sImageDto.imageId = savedImage.id;
                            console.log("New image added to index and scan queued: " + name);
                        }
                    }
                    // persist K8sImageDto (saving one instance per namespace to support summary tables)
                    const existingK8sImages = await this.k8sImageDao.checkK8sImage({
                        'cluster_id': clusterId,
                        'namespace': k8sImageDto.namespace, // one instance of image per cluster per namespace in this table
                        'image_hash': k8sImageDto.imageHash
                    });

                    if (existingK8sImages.length === 0) {
                        // create it!
                        let clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Batch Job', 'Create', 'Info', `${k8sImageDto.name} was found running in the cluster`, k8sImageDto);
                        try {
                            const newK8sImageId: number[] = await this.k8sImageDao.saveK8sImages(k8sImageDto);
                            kubernetesImageIds.push(...newK8sImageId);
                            console.log("New image saved to cluster: " + name + " for namespace " + k8sImageDto.namespace);
                        } catch (e) {
                            allImagesSavedSuccessfully = false;
                            console.log('K8s Image save error: ', e);
                            clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Batch Job', 'Create', 'Error', `Error while saving image ${k8sImageDto.name}`, k8sImageDto);
                        } finally {
                            await this.clusterEventService.createClusterEvent(clusterEventData, clusterId);
                        }
                    } else {
                        kubernetesImageIds.push(existingK8sImages[0].id);
                        // console.log(`Image ${k8sImageDto.image} under cluster ${k8sImageDto.clusterId} already exists.`);
                    }
                } catch (e) {
                    allImagesSavedSuccessfully = false;
                    console.log("Error writing image " + name, e);
                }
            }
        }

        // Mark old ones not running in cluster
        const imageIds = imageIdMapRunningInCluster.getAllIds();
        await this.imageDao.updateRunningImages(clusterId, imageIds, kubernetesImageIds);

        return { allImagesSavedSuccessfully, imageIdMapRunningInCluster };
    }


    /*async saveK8sImagesOLD(clusterId: number, deploymentContainerImageList: {
        deployment: V1Deployment;
        relevantPodContainers: V1ContainerStatus[];
    }): Promise<void> {

        const deploymentImages: K8sImageDto[] = [];
        const imagesRunningInCluster: number[] = [];

        deploymentContainerImageList.deployment.spec.template.spec.containers.forEach(deploymentContainer => {
            const deploymentImageDTO = new K8sImageDto();

            deploymentImageDTO.clusterId = clusterId;
            deploymentImageDTO.clusterName = deploymentContainerImageList.deployment.metadata.clusterName;
            deploymentImageDTO.compliant = false;
            deploymentImageDTO.deploymentName = deploymentContainerImageList.deployment.metadata.name;
            deploymentImageDTO.namespace = deploymentContainerImageList.deployment.metadata.namespace;
            deploymentImageDTO.name = deploymentContainer.name;

            const matchedImage: V1ContainerStatus = deploymentContainerImageList.relevantPodContainers.find(pc => pc.name === deploymentContainer.name && pc.image === deploymentContainer.image);
            deploymentImageDTO.imageHash = matchedImage && matchedImage.imageID.indexOf('sha256:') > -1 ? matchedImage.imageID.split('sha256:')[1] : '';

            deploymentImageDTO.image = this.formatDockerImageUrl(matchedImage ? matchedImage.image : deploymentContainer.image);

            deploymentImages.push(deploymentImageDTO);

        });

        for (const deploymentImage of deploymentImages) {
            const existingContainerImages = await this.k8sImageDao.checkK8sImage({
                'cluster_id': clusterId,
                'namespace': deploymentImage.namespace,
                'deployment_name': deploymentImage.deploymentName,
                'image': deploymentImage.image,
                'image_hash': deploymentImage.imageHash
            });

            console.log('*********************');
            console.log('existingContainerImages: ', existingContainerImages);
            console.log('*********************');

            if (existingContainerImages.length === 0) {
                let clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Batch Job', 'Create', 'Info', `${deploymentImage.name} is created`, null );
                try {
                    await this.k8sImageDao.saveK8sImages(deploymentImage);
                } catch (e) {
                    console.log('Container Image save error: ', e);
                    clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Batch Job', 'Create', 'Error', `Error while scanning ${deploymentImage.name}`, null );
                } finally {
                    await this.clusterEventService.createClusterEvent(clusterEventData, clusterId);
                }
            } else {
                console.log(`Image ${deploymentImage.image} in Deployment: ${deploymentImage.deploymentName} under cluster ${deploymentImage.clusterId} already exists.`);
            }

            let existingImageDto: ListOfImagesDto = null;
            try {
                existingImageDto = await this.imageService.getImageByImageHash(clusterId, deploymentImage.imageHash);
            } catch (e) {
                console.log('Image not found by hash: ', e.message);
            }

            if (existingImageDto === null) {
                console.log('Image needs to be created in image table.');
                const dockerImageDetails:{host: string; path: string; imageName: string; tag: string;} = this.parseDockerImageUrl(deploymentImage.image);
                const image: ImageDto = new ImageDto();
                image.dockerImageId = deploymentImage.imageHash;
                image.url = dockerImageDetails.host;
                image.name = dockerImageDetails.path !== '' ? dockerImageDetails.path + '/' + dockerImageDetails.imageName : dockerImageDetails.imageName;
                image.tag = dockerImageDetails.tag;
                image.runningInCluster = true;
                image.summary = '';
                try {
                    const createdImageDetails = await this.imageService.createImage(image, clusterId);
                    imagesRunningInCluster.push(+createdImageDetails.id);
                } catch (e) {
                    console.log('Image create error: ', e);
                }
            } else {
                imagesRunningInCluster.push(+existingImageDto.id);
                await this.enqueueScan(deploymentImage.imageHash, clusterId);
            }

        }

        const existingImages = await this.imageDao.loadImage({
            'i.cluster_id': +clusterId,
            'i.deleted_at': null,
            'i.running_in_cluster': true,
            'ki.namespace': deploymentContainerImageList.deployment.metadata.namespace
        });
        if (existingImages && existingImages.length > 0 && imagesRunningInCluster.length > 0 && existingImages.filter(filterImage => imagesRunningInCluster.indexOf(+filterImage.id) === -1).length > 0) {
            try {
                const imageDataToUpdate = {
                    running_in_cluster: false
                };

                const searchConditions = [{
                    field: 'cluster_id',
                    condition: '=',
                    value: +clusterId
                }, {
                    field: 'id',
                    condition: 'IN',
                    value: existingImages.filter(filterImage => imagesRunningInCluster.indexOf(+filterImage.id) === -1).map(mapImage => +mapImage.id)
                }];
                await this.imageDao.massUpdateImages(imageDataToUpdate, searchConditions);
            } catch (e) {
                console.log('Mass Image update error: ', e);
            }
        }
    }*/

    async saveK8sImagesHistory(dayStr: string): Promise<any> {
        // Get yesterday's date as a string formatted yyyy-mm-dd
        //const dayStr: string = yesterdaysDateAsStr();

        try {
            console.log("Clearing k8s image history for " + dayStr);
            await this.k8sImageDao.clearK8sImagesHistory(dayStr);
        } catch (e) {
            console.log('Error clearing K8s image history for', dayStr);
        }
        const currentK8sImages = await this.k8sImageDao.getCurrentK8sImages();

        if (currentK8sImages) {
            for (const k8sImage of currentK8sImages) {
                try {
                    console.log(`Saving kubernetes image ${k8sImage.name} of namespace ${k8sImage.namespace} of cluster ${k8sImage.clusterId}`);
                    await this.k8sImageDao.saveK8sImagesHistory(k8sImage, dayStr);
                    //const clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Kubernetes Image History', 'History', 'Info', `History of ${k8sImage.name}`, null );
                    //await this.clusterEventService.createClusterEvent(clusterEventData, k8sImage.clusterId);
                } catch (e) {
                    const clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Kubernetes Image History', 'History', 'Error', `Error saving ${k8sImage.name} to history - ${e.detail}`, k8sImage);
                    await this.clusterEventService.createClusterEvent(clusterEventData, k8sImage.clusterId);
                }
            }
        }
    }

    /**
     * Prefix with default image registry if required
     * @param image
     */
    formatDockerImageUrl(image: string) {
        const k8Image = image.split('/');
        if (k8Image.length > 0) {
            const url = k8Image[0];
            const urlMatch = url.match(/^([a-z0-9|-]+\.)*[a-z0-9|-]+\.[a-z]+/i);
            return urlMatch === null ? this.DEFAULT_DOCKER_REGISTRY + '/' + image : image;
        }
        return this.DEFAULT_DOCKER_REGISTRY + '/' + image;
    }

    async enqueueScan(imageHash: string, clusterId: number): Promise<void> {
        const imageDetails = await this.imageService.getImageByImageHash(clusterId, imageHash);
        if (imageDetails) {
            await this.imageService.createImageScanByImageId([{id: imageDetails.id}], clusterId);
        }
    }

    parseDockerImageUrl(url: string): {host: string; path: string; imageName: string; tag: string;} {
        let host = 'index.docker.io';
        let tag = '';
        let imageName = '';

        const t1 = url.split('/');

        if (t1.length > 1 && t1[0]) {
            const matches = t1[0].match(/^((?:https?:\/\/)?[^./]+(?:\.[^./]+)+(?:\/.*)?)/i);
            if (matches && matches[0]) {
                host = matches[0];
                t1.shift();
            }
        }

        if (t1[t1.length -1] && t1[t1.length -1].includes(':')) {
            const t2 = t1[t1.length -1].split(':');
            imageName = t2[0];
            if (t2[1]) {
                tag = t2[1];
            }
            t1.pop();
        }

        let path = t1.join('/');

        return {host, path, imageName, tag};
    }
}
