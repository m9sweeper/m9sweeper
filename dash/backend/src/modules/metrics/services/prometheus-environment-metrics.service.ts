import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {Counter, Gauge, Summary} from 'prom-client';
import {InjectMetric} from "@willsoto/nestjs-prometheus";
import * as client from "prom-client";
import { ClusterService } from "../../cluster/services/cluster.service";
import { ImageService } from "../../image/services/image.service";
import { ClusterDto } from 'src/modules/cluster/dto/cluster-dto';
import { ReportsService } from '../../reports/services/reports.service';
import { PodService } from '../../pod/services/pod.service';
import {MineLoggerService} from '../../shared/services/mine-logger.service';
import { KubeBenchService } from '../../kube-bench/services/kube-bench.service';
import { KubeHunterService } from '../../kube-hunter/service/kube-hunter.service';
import {
  IKubeHunterRawNodes,
  IKubeHunterRawServices,
  IKubeHunterRawVulnerabilities
} from '../../kube-hunter/dto/kube-hunter-raw.interface';

@Injectable()
export class PrometheusEnvironmentMetricsService {
  envMetricsCacheLength = 30 * 1000;  // 30s = 30,000ms
  envMetricsUpdatedTimestamp = 0;

  constructor(
    @InjectMetric('num_images_running') public numImagesRunning: Gauge<string>,
    @InjectMetric('num_images_with_vulnerabilities') public numImagesWithVulnerabilities: Gauge<string>,
    @InjectMetric('num_pods_compliant') public numPodsCompliant: Gauge<string>,
    @InjectMetric('num_pods_noncompliant') public numPodsNonCompliant: Gauge<string>,
    @InjectMetric('current_pod_compliance_percentage') public currentPodCompliancePercentage: Gauge<string>,

    @InjectMetric('total_cves') public totalCVEs: Gauge<string>,
    @InjectMetric('num_critical_cves') public numCriticalCVEs: Gauge<string>,
    @InjectMetric('num_fixable_critical_cves') public numFixableCriticalCVEs: Gauge<string>,
    @InjectMetric('num_major_cves') public numMajorCVEs: Gauge<string>,
    @InjectMetric('num_fixable_major_cves') public numFixableMajorCVEs: Gauge<string>,
    @InjectMetric('num_medium_cves') public numMediumCVEs: Gauge<string>,
    @InjectMetric('num_fixable_medium_cves') public numFixableMediumCVEs: Gauge<string>,
    @InjectMetric('num_low_cves') public numLowCVEs: Gauge<string>,
    @InjectMetric('num_fixable_low_cves') public numFixableLowCVEs: Gauge<string>,
    @InjectMetric('num_negligible_cves') public numNegligibleCVEs: Gauge<string>,
    @InjectMetric('num_fixable_negligible_cves') public numFixableNegligibleCVEs: Gauge<string>,

    @InjectMetric('kube_bench_passed_tests') public kubeBenchRecentResultsPassed: Gauge<string>,
    @InjectMetric('kube_bench_failed_tests') public kubeBenchRecentResultsFailed: Gauge<string>,
    @InjectMetric('kube_bench_tests_with_warnings') public kubeBenchRecentResultsWarning: Gauge<string>,
    @InjectMetric('kube_bench_tests_with_info_alerts') public kubeBenchRecentResultsInfo: Gauge<string>,

    @InjectMetric('kube_hunter_num_low_vulnerabilities') public kubeHunterRecentResultsLow: Gauge<string>,
    @InjectMetric('kube_hunter_num_medium_vulnerabilities') public kubeHunterRecentResultsMedium: Gauge<string>,
    @InjectMetric('kube_hunter_num_high_vulnerabilities') public kubeHunterRecentResultsHigh: Gauge<string>,
    @InjectMetric('kube_hunter_num_unknown_vulnerabilities') public kubeHunterRecentResultsUnknown: Gauge<string>,
    private clusterService: ClusterService,
    private imageService: ImageService,
    private kubeBenchService: KubeBenchService,
    private kubeHunterService: KubeHunterService,
    private reportsService: ReportsService,
    private podService: PodService,
    protected readonly logger: MineLoggerService,
  ) {}

  async environmentMetrics() {
    if ((Date.now() - this.envMetricsCacheLength) > this.envMetricsUpdatedTimestamp) {
      await this.updateEnvMetrics();
    }
    const envMetrics = [
      client.register.getSingleMetricAsString("num_images_running"),
      client.register.getSingleMetricAsString("num_images_with_vulnerabilities"),
      client.register.getSingleMetricAsString("num_pods_compliant"),
      client.register.getSingleMetricAsString("num_pods_noncompliant"),
      client.register.getSingleMetricAsString("current_pod_compliance_percentage"),

      client.register.getSingleMetricAsString("total_cves"),

      client.register.getSingleMetricAsString("num_critical_cves"),
      client.register.getSingleMetricAsString("num_fixable_critical_cves"),

      client.register.getSingleMetricAsString("num_major_cves"),
      client.register.getSingleMetricAsString("num_fixable_major_cves"),

      client.register.getSingleMetricAsString("num_medium_cves"),
      client.register.getSingleMetricAsString("num_fixable_medium_cves"),

      client.register.getSingleMetricAsString("num_low_cves"),
      client.register.getSingleMetricAsString("num_fixable_low_cves"),

      client.register.getSingleMetricAsString("num_negligible_cves"),
      client.register.getSingleMetricAsString("num_fixable_negligible_cves"),

      client.register.getSingleMetricAsString("kube_bench_passed_tests"),
      client.register.getSingleMetricAsString("kube_bench_failed_tests"),
      client.register.getSingleMetricAsString("kube_bench_tests_with_warnings"),
      client.register.getSingleMetricAsString("kube_bench_tests_with_info_alerts"),

      client.register.getSingleMetricAsString("kube_hunter_num_low_vulnerabilities"),
      client.register.getSingleMetricAsString("kube_hunter_num_medium_vulnerabilities"),
      client.register.getSingleMetricAsString("kube_hunter_num_high_vulnerabilities"),
      client.register.getSingleMetricAsString("kube_hunter_num_unknown_vulnerabilities"),
    ];

    return envMetrics.join('\n\n');
  }

  private async updateEnvMetrics(): Promise<void> {
    try {
      const allClusters = await this.clusterService.getAllClusters();
      for (const cluster of allClusters) {
        await this.updateNumImagesRunning(cluster);
        await this.updateNumVulnerabilitiesDetected(cluster);
        await this.updatePodCompliancePercentage(cluster);
        await this.updateCVEReports(cluster);
        await this.updateKubeBenchMetrics(cluster);
        await this.updateKubeHunterMetrics(cluster);
      }
      this.envMetricsUpdatedTimestamp = Date.now();
    } catch (e) {
      this.logger.error('Error updating metrics', e, 'PrometheusEnvironmentMetricsService.updateEnvMEtrics');
    }
  }

  private async updateNumImagesRunning(cluster: ClusterDto): Promise<void> {
    try {
      const imagesRunningInCluster = await this.imageService.getAllRunningImagesByClusterId(cluster.id);
      this.numImagesRunning.labels(cluster.name).set(imagesRunningInCluster.total);
      return;
    } catch (e) {
      return;
    }
  }

  private async updateNumVulnerabilitiesDetected(cluster: ClusterDto): Promise<void> {
    try {
      const runningVulnerabilities = await this.reportsService.getRunningVulnerabilitiesNoRequirements(cluster.id);
      this.numImagesWithVulnerabilities.labels(cluster.name).set(runningVulnerabilities.count);
      return;
    } catch (e) {
      return;
    }
  }

  private async updatePodCompliancePercentage(cluster): Promise<void> {
    try {
      const podComplianceSummaries = await this.podService.getCurrentPodsComplianceSummary(cluster.id);
      for (const summary of podComplianceSummaries) {
        try {
          this.numPodsCompliant.labels(summary.namespace, cluster.name).set(summary.numCompliantPods);
          this.numPodsNonCompliant.labels(summary.namespace, cluster.name).set(summary.numNoncompliantPods);
          this.currentPodCompliancePercentage.labels(summary.namespace, cluster.name).set(summary.numCompliantPods / summary.numPods * 100);
        } catch (e) {
          return;
        }
      }
    } catch (e) {
      return;
    }
  }

  private async updateCVEReports(cluster: ClusterDto): Promise<void> {
    try {
      const summary = await this.reportsService.getRunningVulnerabilitiesSummary(cluster.id);
      this.totalCVEs.labels(cluster.name).set(summary.totalCritical + summary.totalMajor + summary.totalMedium + summary.totalLow + summary.totalNegligible);

      this.numCriticalCVEs.labels(cluster.name).set(summary.totalCritical);
      this.numFixableCriticalCVEs.labels(cluster.name).set(summary.totalFixableCritical);

      this.numMajorCVEs.labels(cluster.name).set(summary.totalMajor);
      this.numFixableMajorCVEs.labels(cluster.name).set(summary.totalFixableMajor);

      this.numMediumCVEs.labels(cluster.name).set(summary.totalMedium);
      this.numFixableMediumCVEs.labels(cluster.name).set(summary.totalFixableMedium);

      this.numLowCVEs.labels(cluster.name).set(summary.totalLow);
      this.numFixableLowCVEs.labels(cluster.name).set(summary.totalFixableLow);

      this.numNegligibleCVEs.labels(cluster.name).set(summary.totalNegligible);
      this.numFixableNegligibleCVEs.labels(cluster.name).set(summary.totalFixableNegligible);
    } catch (e) {
      return;
    }
  }

  private async updateKubeBenchMetrics(cluster: ClusterDto): Promise<void> {
    await this.kubeBenchService.getLastBenchReportSummary(cluster.id).then(summary => {
      const totals = summary[0].resultsSummary;
      this.kubeBenchRecentResultsPassed.labels(cluster.name).set(totals.total_pass);
      this.kubeBenchRecentResultsFailed.labels(cluster.name).set(totals.total_fail);
      this.kubeBenchRecentResultsWarning.labels(cluster.name).set(totals.total_warn);
      this.kubeBenchRecentResultsInfo.labels(cluster.name).set(totals.total_info);
    });
  }

  private async updateKubeHunterMetrics(cluster: ClusterDto): Promise<void> {
    await this.kubeHunterService.getRecentKubeHunterReportForCluster(cluster.id).then(report => {
      const rawVulnerabilities = JSON.parse(report.vulnerabilities) as IKubeHunterRawVulnerabilities;
      const vulnerabilities = rawVulnerabilities.value.value
      let numLowSeverity = 0;
      let numMediumSeverity = 0;
      let numHighSeverity = 0;
      let numUnknownSeverity = 0;
      vulnerabilities.forEach(vulnerability => {
        switch(vulnerability.severity) {
          case "low":
            numLowSeverity++;
            break;
          case "medium":
            numMediumSeverity++;
            break;
          case "high":
            numHighSeverity++;
            break;
          default:
            numUnknownSeverity++;
            break;
        }
      });
      this.kubeHunterRecentResultsLow.labels(cluster.name).set(numLowSeverity);
      this.kubeHunterRecentResultsMedium.labels(cluster.name).set(numMediumSeverity);
      this.kubeHunterRecentResultsHigh.labels(cluster.name).set(numHighSeverity);
      this.kubeHunterRecentResultsUnknown.labels(cluster.name).set(numUnknownSeverity);
    });
  }
}
