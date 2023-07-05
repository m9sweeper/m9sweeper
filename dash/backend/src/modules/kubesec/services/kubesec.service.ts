import { Injectable } from '@nestjs/common';
import { HttpService } from "@nestjs/axios";
import {KubernetesApiService} from "../../command-line/services/kubernetes-api.service";
import {instanceToPlain} from "class-transformer";
import {take} from "rxjs/operators";
import {PodService} from "../../pod/services/pod.service";
import {ClusterService} from "../../cluster/services/cluster.service";
import {Express} from 'express';
import {V1PodList} from "@kubernetes/client-node";
import {V1NamespaceList} from "@kubernetes/client-node/dist/gen/model/v1NamespaceList";
import {ConfigService} from '@nestjs/config';


@Injectable()
export class KubesecService {
    constructor(
        private readonly podService: PodService,
        private readonly clusterService: ClusterService,
        private readonly kubernetesApiService: KubernetesApiService,
        private readonly httpService: HttpService,
        protected readonly configService: ConfigService
    ) {}

    async listNamespaces(clusterId: number): Promise<V1NamespaceList> {
        const cluster = await this.clusterService.getClusterById(clusterId);
        const namespaceList = await this.kubernetesApiService.listNamespaces(cluster.kubeConfig);
        return namespaceList;
    }
    async listPods(clusterId: number, namespaces: string[]): Promise<V1PodList[]> {
        const podList = [];
        const cluster = await this.clusterService.getClusterById(clusterId);
        for(let i = 0; i < namespaces.length; i++) {
            podList.push(await this.kubernetesApiService.listPods(cluster.kubeConfig, namespaces[i]));
        }
        return podList;
    }

    async runKubesecByPod(podName: string, namespace: string, clusterId: number): Promise<any> {
        const cluster = await this.clusterService.getClusterById(clusterId);
        if (cluster) {
            try {
                const v1Pod = await this.kubernetesApiService.getNamespacedPod(podName, namespace, cluster.kubeConfig);
                const plainV1Pod = instanceToPlain(v1Pod);
                const url = this.configService.get('kubesec.url') + '/scan';
                return this.httpService.post(url, plainV1Pod).pipe(take(1)).toPromise();
            } catch (err) {
                return await new Promise(reject => reject('Pod couldn\'t be reached'));
            }
        }
    }

    async runKubesecByPodFile(podFile: Express.Multer.File): Promise<any> {
        if(podFile){
            try {
                const podFileContents = podFile.buffer.toString();
                const url = this.configService.get('kubesec.url') + '/scan';
                return this.httpService.post(url, podFileContents).pipe(take(1)).toPromise();
            } catch (err) {
                return await new Promise(reject => reject('Pod file couldn\'t be scanned'));
            }
        }
    }
}
