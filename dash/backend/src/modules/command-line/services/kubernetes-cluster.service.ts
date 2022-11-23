import {Injectable} from '@nestjs/common';
import {CoreV1Api} from '@kubernetes/client-node/dist/gen/api/coreV1Api';
import {MineLoggerService} from '../../shared/services/mine-logger.service';
import {ClusterDto} from '../../cluster/dto/cluster-dto';
import {DatabaseService} from '../../shared/services/database.service';
import {NamespaceService} from '../../namespace/services/namespace.service';
import {DeploymentService} from '../../deployment/services/deployment.service';
import {K8sImageService} from '../../k8s-image/services/k8s-image.service';
import {PodService} from '../../pod/services/pod.service';
import {V1NodeList} from '@kubernetes/client-node';
import {V1Container} from '@kubernetes/client-node/dist/gen/model/v1Container';
import {V1Pod} from '@kubernetes/client-node/dist/gen/model/v1Pod';
import {NamespaceDto} from '../../namespace/dto/namespace-dto';
import {KubernetesApiService} from "./kubernetes-api.service";
import {UtilitiesService} from "../../shared/services/utilities.service";
import {ClusterEventService} from "../../cluster-event/services/cluster-event.service";
import {ImageIdInClusterMap} from "../../k8s-image/classes/imageIdInClusterMap";


@Injectable()
export class KubernetesClusterService {

    constructor(
      private readonly loggerService: MineLoggerService,
      private readonly databaseService: DatabaseService,
      private readonly namespaceService: NamespaceService,
      private readonly deploymentService: DeploymentService,
      private readonly k8sImageService: K8sImageService,
      private readonly podService: PodService,
      private readonly k8sApiService: KubernetesApiService,
      private readonly utilitiesService: UtilitiesService,
      private readonly clusterEventService: ClusterEventService,
    ) {}

    async sync(cluster: ClusterDto): Promise<{everythingSuccessfullySynced: boolean, nodeSummary: {numNodes: number, numCPU: number, amountRAM: number}}> {
        try {
            // build api client with proper auth credentials
            const kubeConfig = this.k8sApiService.loadConfigFromBase64Json(cluster.kubeConfig);
            kubeConfig.setCurrentContext(cluster.context);
            const coreApi = this.k8sApiService.makeCoreV1ApiFromConfig(kubeConfig);

            if (!await this.testCoreAPI(cluster, coreApi)) {
              return {
                everythingSuccessfullySynced: false,
                nodeSummary: {numNodes: null, numCPU: null, amountRAM: null}
              }
            }

            // sync the things we care about: namespaces and pods
            const allNamespacesSuccessfullySynced = await this.syncNamespaces(cluster, coreApi);
            const allPodsSuccessfullySynced = await this.syncPods(cluster, coreApi);
            const nodeSummary = await this.getK8sNodeSummary(cluster?.id, coreApi);
            return {
              everythingSuccessfullySynced: allNamespacesSuccessfullySynced && allPodsSuccessfullySynced,
              nodeSummary,
            }
        } catch (e) {
            this.loggerService.log({label: 'Something went wrong with kube config file', clusterId: cluster.id, error: e}, 'KubernetesClusterService.sync()');
            return {
              everythingSuccessfullySynced: false,
              nodeSummary: {numNodes: null, numCPU: null, amountRAM: null}
            }
        }
    }
    private async testCoreAPI(cluster: ClusterDto, coreApi: CoreV1Api): Promise<boolean> {
      try {
        await coreApi.listNode();
      } catch (e) {
        this.loggerService.log(`Could not use the coreApi to retrieve information from cluster ${cluster.id}`);
        const clusterEventData = this.clusterEventService.createClusterEventObject(
          0,
          'Batch Job',
          'Get',
          'Error',
          `Could not use the coreApi to retrieve information from cluster ${cluster.id}`,
          'KubernetesClusterService.testCoreAPI()');
        await this.clusterEventService.createClusterEvent(clusterEventData, cluster.id);
        return false;
      }
      return true;
    }

    private async syncNamespaces(cluster: ClusterDto, coreApi: CoreV1Api): Promise<boolean> {
        try {
            const namespaceListRes = await coreApi.listNamespace();
            const namespaces: NamespaceDto[] = await this.namespaceService.setNamespacesContents(namespaceListRes, cluster.id);
            await Promise.all(namespaces.map(n => {
              this.namespaceService.saveK8sNamespaces(n, cluster.id);
            }));

            const currentNamespaces = await this.namespaceService.getNamespacesByClusterId(cluster.id);
            const getNames = currentNamespaces.map( n => n.name);
            const k8sNamespaceNames = namespaces.map(n => n.name);
            const namespacesToBeDeleted = getNames.filter(x => !k8sNamespaceNames.includes(x));
            if (namespacesToBeDeleted.length > 0) {
                await this.namespaceService.deleteDeadNamespaces(cluster.id, namespacesToBeDeleted);
            }
        } catch (err) {
            const clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Batch Job', 'Update', 'Error', `Error while syncing namespaces for ${cluster.id}`, cluster);
            await this.clusterEventService.createClusterEvent(clusterEventData, cluster.id);
            this.loggerService.log({label: 'Error when sync namespaces. ', error: {stack: err.stack, message: err.message}}, 'KubernetesClusterService.syncNamespaces()');
            return false;
        }
        return true;
    }

    /**
     * Syncs all of the Pods & images for the cluster
     */
    private async syncPods(cluster: ClusterDto, coreApi: CoreV1Api): Promise<boolean> {
        let everythingSavedSuccessfully = true;
        try {
            // Get every running Pod
            const allPods = await coreApi.listPodForAllNamespaces();
            const runningPods: V1Pod[] = allPods.body.items.filter(pod => pod.status.phase === 'Running');

            // map structure:
            //    < imageName: string, list of Pods running that image: [V1Pod, V1Pod, V1Pod] >
            const mapOfImagesAndThePodsRunningThem: Map<string, Array<V1Pod>> = new Map<string, Array<V1Pod>>();

            // Find all unique images running in all the pods
            runningPods.forEach((pod) => {
              const allContainers: V1Container[] = pod.spec.containers
                .concat(pod.spec.initContainers ?? [])
                .concat(pod.spec.ephemeralContainers ?? []);

              allContainers.forEach((container) => {
                const imageRunningInContainer: string = container.image;
                const existingPodsRunningThatImage: V1Pod[] = mapOfImagesAndThePodsRunningThem.has(imageRunningInContainer) ? mapOfImagesAndThePodsRunningThem.get(imageRunningInContainer) : [];
                // add our current pod to the list
                mapOfImagesAndThePodsRunningThem.set(imageRunningInContainer, existingPodsRunningThatImage.concat([pod]));
              });
            });

            // save images and pods (with imageIdMap for sake of optimization)
            const saveResult = await this.k8sImageService.saveK8sImages(cluster.id, mapOfImagesAndThePodsRunningThem);
            everythingSavedSuccessfully = everythingSavedSuccessfully && saveResult.allImagesSavedSuccessfully;
            const imageIdMap = saveResult.imageIdMapRunningInCluster;
            await this.saveK8sPods(cluster.id, runningPods, imageIdMap);
        } catch (e) {
          this.loggerService.log({label: `ERROR syncing pods for ${cluster.id}`, error: {stack: e.stack, message: e.message}}, 'KubernetesClusterService.syncPods()');
            const clusterEventData = this.clusterEventService.createClusterEventObject(
              0,
              'Batch Job',
              'Update',
              'Error',
              `Error while syncing pods for ${cluster.id}`,
              cluster
            );
            await this.clusterEventService.createClusterEvent(clusterEventData, cluster.id);
            return false;
        }
        return everythingSavedSuccessfully;
    }

    private async saveK8sPods(clusterId: number, runningPods: V1Pod[], imageIdMap: ImageIdInClusterMap) {
      let somePodsFailed = false;
      for (const pod of runningPods) {
        try {
          console.log("Saving pod " + pod.metadata.name + " of " + pod.metadata.namespace);
          await this.podService.savePod(pod, clusterId, imageIdMap);
        } catch (e) {
          somePodsFailed = true;
          this.loggerService.log({label: `ERROR saving pod ${pod.metadata.name}`, error: {stack: e.stack, message: e.message}}, 'KubernetesClusterService.saveK8sPods()');
        }
      }
      if (somePodsFailed) {
        const clusterEventData = this.clusterEventService.createClusterEventObject(
          0,
          'Batch Job',
          'Update',
          'Error',
          `Error while running KubernetesClusterService.saveK8sPods for ${clusterId} - not all pods saved properly`,
          clusterId
        );
        await this.clusterEventService.createClusterEvent(clusterEventData, clusterId);
      }
      await this.podService.deleteDeadPods(clusterId, runningPods.map(p => p.metadata.name));
    }

    async getK8sNodeSummary(clusterId: number, coreApi: CoreV1Api): Promise<{numNodes: number, numCPU: number, amountRAM: number}> {
        try {
            const nodeListResponse: V1NodeList = await coreApi.listNode().then(resolvedPromise => resolvedPromise.body);
            const numNodes = nodeListResponse.items.length;
            let numCPU = 0;
            let amountRAM = 0;
            for (const node of nodeListResponse.items) {
                numCPU += parseInt(node.status.capacity.cpu.toString(), 10);
                const ramWithPrefix = node.status.capacity.memory.toString();
                const prefix = ramWithPrefix.replace(/([0-9])/g, '');
                const ramWithoutPrefix = ramWithPrefix.replace(/([a-zA-Z])/g, '');
                amountRAM += parseInt(ramWithoutPrefix, 10) * this.utilitiesService.prefixesToMultipliers[prefix];
            }
            this.loggerService.log({label: `cluster ${clusterId} node summary successfully built`, numNodes, numCPU, amountRAM}, 'KubernetesClusterService.getK8sNodeSummary()');
            return {numNodes, numCPU, amountRAM};
        } catch (err) {
            this.loggerService.log({label: 'An error occurred while attempting to getK8sNodeSummary', error: {stack: err.stack, message: err.message}}, 'KubernetesClusterService.getK8sNodeSummary()');
            return {numNodes: null, numCPU: null, amountRAM: null};
        }
    }

    // @TODO: dead code, used as reference for syncPods
    /*private async syncDeployments(namespace: NamespaceDto, cluster: ClusterDto, coreApi: CoreV1Api, k8sApi: k8s.AppsV1Api): Promise<void> {
        try {
            const result = await k8sApi.listNamespacedDeployment(namespace.name);
            const deployments: V1Deployment[] = result.body.items;

            const resultPodList = await coreApi.listNamespacedPod(namespace.name);
            const pods: V1Pod[] = resultPodList.body.items.filter(p => ['Running'].includes(p.status.phase) && p.metadata.ownerReferences && p.metadata.ownerReferences.findIndex(pm => pm.kind !== 'Job') > -1);

            for (const deployment of deployments) {
                await this.deploymentService.saveK8sDeployments(deployment, cluster.id);

                const deploymentContainerImageList: {
                    deployment: V1Deployment;
                    relevantPodContainers: V1ContainerStatus[];
                } = {
                    deployment: deployment,
                    relevantPodContainers: (deployment.spec.template.spec.containers as V1Container[]).reduce((acc, dc) => {
                        pods.forEach(p => {
                            acc.push(...p.status.containerStatuses.filter(pc => pc.name === dc.name && pc.image === dc.image));
                        });
                        return acc;
                    }, [])
                };

                await this.k8sImageService.saveK8sImagesOLD(cluster.id, deploymentContainerImageList);
            }


            try {
                const existingPods: PodDto[] = await this.podService.getAllPods(cluster.id, namespace.name);
                if (existingPods && existingPods.length > 0) {
                    await Promise.all(existingPods.map(p => {
                        p.podStatus = null;
                        return this.podService.updatePod(p);
                    }));
                }
            } catch (err) {
                console.log('Error when updating all existing pod status to null. ', err);
            }

            try {
                await Promise.all(pods.map(p => this.podService.savePods(p, cluster.id)));
            } catch (err) {
                console.log('Error when saving new pods data. ', err);
            }

            try {
                await this.podService.deletePod({cluster_id: cluster.id, namespace: namespace.name, pod_status: null});
            } catch (err) {
                console.log('Error when deleting existing pods with status null. ', err);
            }
        } catch (err) {
            console.log('Error when sync deployments. ', err);
        }
    }*/
}
