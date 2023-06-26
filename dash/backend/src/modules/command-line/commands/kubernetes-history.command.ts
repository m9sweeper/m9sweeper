import { Injectable } from '@nestjs/common';
import { MineLoggerService } from '../../shared/services/mine-logger.service';
import { ClusterDao } from '../../cluster/dao/cluster.dao';
import { KubernetesHistoryService } from '../services/kubernetes-history.service';
import { PodComplianceService } from '../../pod/services/pod-compliance.service';
import { yesterdaysDateAsStr } from '../../../util/date_util';
import { ImageRescanningService } from '../services/image-rescanning.service';
import { NamespaceComplianceService } from '../../namespace/services/namespace_compliance.service';


/**
 * These commands are used to scrape and populate the history of what was running on the Kubernetes Cluster each day.
 */
@Injectable()
export class KubernetesHistoryCommand {

    constructor(private readonly loggerService: MineLoggerService,
                private readonly kubernetesHistoryService: KubernetesHistoryService,
                private readonly clusterDao: ClusterDao,
                private readonly podComplianceService: PodComplianceService,
                private readonly imageRescanningService: ImageRescanningService,
                private readonly historyNamespaceComplianceService: NamespaceComplianceService) {
    }

    async get(): Promise<boolean> {
        let dayStr = yesterdaysDateAsStr();

        await this.kubernetesHistoryService.saveK8sClustersHistory(dayStr);
        await this.kubernetesHistoryService.saveK8sNamespacesHistory(dayStr);
        await this.kubernetesHistoryService.saveK8sDeploymentsHistory(dayStr);
        await this.kubernetesHistoryService.saveK8sImagesHistory(dayStr);
        await this.kubernetesHistoryService.saveK8sPodHistory(dayStr);


        await this.podComplianceService.calculateHistoricalPodNamespaceCompliance(dayStr);

        await this.imageRescanningService.rescanIfNeeded();

        await this.historyNamespaceComplianceService.calculateHistoricalNameSpaceCompliance(dayStr);
        return true;
    }
}
