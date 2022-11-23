import { Injectable } from "@nestjs/common";
import { PodDao } from "../../pod/dao/pod.dao";
import { PodComplianceService } from "../../pod/services/pod-compliance.service";
import { ClusterDao } from "../../cluster/dao/cluster.dao";
import { NamespaceDao } from "../dao/namespace.dao";
import { NamespaceComplianceDto, NamespaceComplianceResultDto } from "../dto/namespace-compliance-dto";
import { MineLoggerService } from "../../shared/services/mine-logger.service";
import {ClusterDto} from "../../cluster/dto/cluster-dto";

@Injectable()
export class NamespaceComplianceService {
    constructor(private readonly podDao: PodDao,
                private readonly clusterDao: ClusterDao,
                private readonly nameSpaceDao: NamespaceDao,
                private readonly podComplianceService: PodComplianceService) {}

    async calculateNamespaceCompliance(namespaces: NamespaceComplianceDto[]) : Promise<NamespaceComplianceResultDto[]> {
        let namespaceComplianceResults: NamespaceComplianceResultDto[] = [];

        if (namespaces) {
            for (const namespace of namespaces) {
                if (namespace.pods.every(p => p.compliant)) {
                    namespaceComplianceResults.push({id: namespace.id, compliant: true})
                    continue;
                }

                namespaceComplianceResults.push({id: namespace.id, compliant: false})
            }
        }

        return namespaceComplianceResults;
    }

    async calculateHistoricalNameSpaceCompliance(dayStr: string) {
        const namespaces = await this.nameSpaceDao.getAllNamespacesHistoryByDate(dayStr);

        if (namespaces) {
            const namespaceComplianceResults = await this.calculateNamespaceCompliance(namespaces);

            await this.nameSpaceDao.updateBatchHistoryk8NamespaceCompliance(
                namespaceComplianceResults.filter(p => p.compliant).map(p => p.id), true);
            await this.nameSpaceDao.updateBatchHistoryk8NamespaceCompliance(
                namespaceComplianceResults.filter(p => p.compliant === false).map(p => p.id), false);
        }

    }

    async calculateNamespaceComplianceForClusterPods(clustersToCheck: ClusterDto[] = []): Promise<void> {
      let clusters: ClusterDto[] = clustersToCheck;
      if (!clusters.length) {
        clusters = await this.clusterDao.getAllClusters();
      }

      for (const cluster of clusters) {
        const pods = await this.podDao.getAllPodsInClusterForNamespaceCompliance(cluster.id);
        if (pods) {
          const podComplianceResults = await this.podComplianceService.calculatePodNamespaceCompliance(pods);

          await this.podDao.updateBatchk8PodCompliance(podComplianceResults.filter(p => p.compliant).map(p => p.id), true);
          await this.podDao.updateBatchk8PodCompliance(podComplianceResults.filter(p => p.compliant === false).map(p => p.id), false);

          const namespaces = await this.nameSpaceDao.getNamespacesByClusterIdWithPods(cluster.id);

          const namespaceComplianceResults = await this.calculateNamespaceCompliance(namespaces);

          await this.nameSpaceDao.updateBatchk8NamespaceCompliance(
            namespaceComplianceResults.filter(p => p.compliant).map(p => p.id), true);
          await this.nameSpaceDao.updateBatchk8NamespaceCompliance(
            namespaceComplianceResults.filter(p => p.compliant === false).map(p => p.id), false);
        }
      }
      return;

    }
}
