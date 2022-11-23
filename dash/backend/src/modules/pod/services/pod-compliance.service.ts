import { Injectable } from '@nestjs/common';
import { PodDao } from '../dao/pod.dao';
import { ImageComplianceFacadeService } from '../../policy/services/image-compliance-facade-service';
import { PolicyService } from '../../policy/services/policy-service';
import { ImageService } from '../../image/services/image.service';
import { ImageScanResultWithIssuesDto } from '../../image/dto/image-scan-results.dto';
import { PoliciesByClusterIdDto } from '../../policy/dto/policy-dto';
import { ScanImageIssue } from '../../image/dto/image-result.dto';
import { ImageScanResultPerPolicyFacadeDto } from '../../policy/dto/image-scan-results-perpolicy-dto';
import { PodComplianceDto } from '../dto/pod-history-compliance-dto';
import { PodComplianceResultDto } from '../dto/pod-compliance-result-dto';

@Injectable()
export class PodComplianceService {
    constructor(private readonly podDao:PodDao, private complianceFacadeService: ImageComplianceFacadeService, 
        private policyService: PolicyService, private imageService: ImageService) {}

    async calculateHistoricalPodNamespaceCompliance(dayStr: string): Promise<void> {
        const pods = await this.podDao.getAllHistoricalK8RunningPodsForNamespaceCompliance(dayStr);
        const podComplianceResults = await this.calculatePodNamespaceCompliance(pods);

        await this.podDao.updateBatchHistoryk8PodCompliance(
            podComplianceResults.filter(p => p.compliant).map(p => p.id), true);
        await this.podDao.updateBatchHistoryk8PodCompliance(
            podComplianceResults.filter(p => p.compliant === false).map(p => p.id), false);

    }

    async calculatePodNamespaceCompliance(pods: PodComplianceDto[]): Promise<PodComplianceResultDto[]> {
        const podComplianceResults: PodComplianceResultDto[] = [];

        if (pods) {
            const globalPolicies = await this.policyService.getGlobalPolicies();

            for (const pod of pods) {
                const complianceResult = await this.calculatePodCompliance(pod, globalPolicies);

                podComplianceResults.push({
                    id: pod.id,
                    compliant: complianceResult.compliant,
                    namespace: pod.namespace,
                    reason: complianceResult.noncompliantImages.join(", ")
                });
            }
        }

        return podComplianceResults;
    }

    async calculatePodCompliance(pod: PodComplianceDto, globalPolicies: PoliciesByClusterIdDto[] = null
    ): Promise<{ compliant: boolean, noncompliantImages: string[], compliantImages: string[], issues: string[] }> {
        // get relevant global policies, if not specified
        if (globalPolicies === undefined || globalPolicies === null) {
            globalPolicies = await this.policyService.getGlobalPolicies();
        }

        // check each image is compliant
        let isCompliant = true;
        const issueSet = new Set<string>();
        const compliantImages = [];
        const noncompliantImages = [];
        for (const image of pod.images) {
            const results: ImageScanResultWithIssuesDto[] = [];

            // get policies
            const polices: PoliciesByClusterIdDto[] = [];

            if (globalPolicies) {
                polices.push(...globalPolicies);
            }

            const clusterPolicies = await this.policyService.getPoliciesByCluster(pod.clusterId);
            if (clusterPolicies) {
                polices.push(...clusterPolicies);
            }

            // get image scan results
            for (const policy of polices) {
                const result = await this.imageService.getLatestImageScanDataByPolicy(image.id, policy.id);
                if (result) {
                    results.push(result);
                }
            }

            const facadeResults = results.map(result => {
                const facadeDto = new ImageScanResultPerPolicyFacadeDto();
                facadeDto.policyId = result.policyId;
                facadeDto.encounteredError = result.encounterError;
                facadeDto.issues = result.issues.map(issue => {
                    const scanImageIssue = new ScanImageIssue();
                    scanImageIssue.scannerId = issue.scannerId;
                    scanImageIssue.type = issue.type;
                    scanImageIssue.severity = issue.severity;
                    scanImageIssue.isFixable = issue.isFixable;

                    return scanImageIssue;
                })

                return facadeDto;
            })

            const calculationResult = await this.complianceFacadeService.isImageNamespaceCompliant(
              pod.clusterId, image, pod.namespace, facadeResults);

            if (calculationResult.compliant === false) {
                noncompliantImages.push(image.name);
                isCompliant = false;
                calculationResult.complianceMap.getAllIssues()?.forEach(issue => issueSet.add(issue.cve));
            } else {
                compliantImages.push(image.name);
            }
        }

        return {
            compliant: isCompliant,
            compliantImages,
            noncompliantImages,
            issues: Array.from(issueSet)
        };
    }
}
