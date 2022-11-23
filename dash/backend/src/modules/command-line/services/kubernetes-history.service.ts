import { Injectable } from '@nestjs/common';
import { MineLoggerService } from '../../shared/services/mine-logger.service';
import { DatabaseService } from '../../shared/services/database.service';
import { ClusterService } from '../../cluster/services/cluster.service';
import { NamespaceService } from '../../namespace/services/namespace.service';
import { DeploymentService } from '../../deployment/services/deployment.service';
import { K8sImageService } from '../../k8s-image/services/k8s-image.service';
import { PodService } from '../../pod/services/pod.service';



@Injectable()
export class KubernetesHistoryService {
    constructor(private readonly loggerService: MineLoggerService,
                private readonly databaseService: DatabaseService,
                private readonly podService: PodService,
                private readonly clusterService: ClusterService,
                private readonly namespaceService: NamespaceService,
                private readonly deploymentService: DeploymentService,
                private readonly k8sImageService: K8sImageService) {}

    async saveK8sClustersHistory(dayStr: string): Promise<number> {
        return await this.clusterService.saveK8sClustersHistory(dayStr);
    }

    async saveK8sPodHistory(dayStr: string): Promise<void> {
        return await this.podService.savePodHistory(dayStr);
    }

    async saveK8sNamespacesHistory(dayStr: string): Promise<any> {
        return await this.namespaceService.saveK8sNamespacesHistory(dayStr);
    }

    async saveK8sDeploymentsHistory(dayStr: string): Promise<any> {
        return await this.deploymentService.saveK8sDeploymentsHistory(dayStr);
    }

    async saveK8sImagesHistory(dayStr: string): Promise<any> {
        return await this.k8sImageService.saveK8sImagesHistory(dayStr);
    }
}
