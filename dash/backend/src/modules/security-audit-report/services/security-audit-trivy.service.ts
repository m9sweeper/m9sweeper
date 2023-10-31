import {Injectable} from '@nestjs/common';
import {PrTrivyNamespaceReport, PrTrivyReport} from '../../reports/interfaces/printable-report-cluster';
import {ReportsService} from '../../reports/services/reports.service';
import {NamespaceService} from '../../namespace/services/namespace.service';
import {Content, ContentTable, TableCell} from 'pdfmake/interfaces';
import {SecurityAuditReportPdfHelpersService} from './security-audit-report-pdf-helpers.service';
import {ImageScanResultsIssueService} from '../../image-scan-results-issue/services/image-scan-results.service';
import {PodIssueSummaryDto} from '../../image-scan-results-issue/dto/pod-issue-summary.dto';

@Injectable()
export class SecurityAuditTrivyService {

  constructor(
    protected readonly reportService: ReportsService,
    protected readonly namespaceService: NamespaceService,
    protected readonly pdfHelpers: SecurityAuditReportPdfHelpersService,
    protected readonly scanIssuesService: ImageScanResultsIssueService
  ) {

  }

  async buildClusterTrivyReport(clusterId: number): Promise<PrTrivyReport> {
    const report: PrTrivyReport = {
      clusterOverview: null,
      namespaces: {},
      vulnerabilities: []
    };

    report.clusterOverview = await this.reportService.getCurrentWorstImage(clusterId)
      .then(data => {
        return {
          total: data.totalImages,
          critical: data.criticalImages,
          major: data.majorImages,
          medium: data.mediumImages,
          low: data.lowImages,
          negligible: data.negligibleImages,
          unscanned: data.unscannedImages,
          clean: data.safeImages
        }
      });

    const namespaces = await this.namespaceService.getNamespacesByClusterId(clusterId);
    for (const namespace of namespaces) {
      const worstImageReport = await this.reportService.getCurrentWorstImage(clusterId, { namespaces: [namespace.name]});
      report.namespaces[namespace.name] = {
        overview: {
          total: worstImageReport.totalImages,
          critical: worstImageReport.criticalImages,
          major: worstImageReport.majorImages,
          medium: worstImageReport.mediumImages,
          low: worstImageReport.lowImages,
          negligible: worstImageReport.negligibleImages,
          unscanned: worstImageReport.unscannedImages,
          clean: worstImageReport.safeImages
        },
        pods: {}
      }
      const podData = await this.reportService.getRunningVulnerabilitiesInPodsByNamespace(clusterId, namespace.name);
      const pods = podData;
      for(const pod of pods) {
        const issues = await this.scanIssuesService.getAllIssuesForKubernetesPod(pod.id);
        report.namespaces[namespace.name].pods[pod.name] = {
          issues,
          overview: {
            critical: pod.criticalIssues,
            low: pod.lowIssues,
            major: pod.majorIssues,
            medium: pod.mediumIssues,
            negligible: pod.negligibleIssues,
          },
        }
      }
    }

    return report;
  }


  buildClusterTrivyDetails(trivyReport: PrTrivyReport): Content[] {
    const rows = Object.keys(trivyReport.namespaces).map((key: string) => {
      const overview = trivyReport.namespaces[key]?.overview;
      return [key, overview.total, overview.critical, overview.major, overview.medium, overview.low, overview.negligible, overview.clean, overview.unscanned];
    })
    const trivyTable: ContentTable = {
      marginBottom: 10,
      table: {
        widths: ['*', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          ['Cluster', 'Total Images', 'Crt', 'Maj', 'Med', 'Low', 'Ngl', 'No', 'Not Scanned'],
          ...rows
        ]
      },
      layout: this.pdfHelpers.coloredTableHeaderLayout()
    }


    const content = [
      this.pdfHelpers.buildSubHeader('Image Scanning with Trivy'),
      {
        style: 'body',
        text: [
          'Trivy scans the software running in your cluster for common vulnerabilities and exposures (CVEs). ',
          'CVEs are publicly disclosed security flaws that (generally) can be fixed by upgrading to the latest package that has a fix available. ',
          '\n\n',
          'Summary of worst CVE by workload by image running in the namespace:\n'
        ]
      },
      trivyTable
    ];

    for(const nsName in trivyReport.namespaces) {
      const ns = trivyReport.namespaces[nsName];
      content.push(this.buildNamespaceTable(nsName, ns));
      for (const podName in ns.pods) {
        content.push(this.buildPodIssueTable(podName, ns.pods[podName]?.issues));
      }
    }

    return content;
  }

  buildNamespaceTable(namespaceName:string, namespaceReport: PrTrivyNamespaceReport): Content[] {
    let rows: TableCell[][] = Object.keys(namespaceReport.pods).map((key: string) => {
      const overview = namespaceReport.pods[key].overview;
      return [key, overview.critical, overview.major, overview.medium, overview.low, overview.negligible];
    });
    if (!rows?.length) {
      rows = [[{text: 'No workloads', style: 'italics', colSpan: 6 },{},{},{},{},{}]];
    }
    const table: ContentTable = {
      marginBottom: 10,
      table: {
        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          ['Workload', 'Crt', 'Maj', 'Med', 'Low', 'Ngl'],
          ...rows
        ]
      },
      layout: this.pdfHelpers.coloredTableHeaderLayout()
    }

    return [
      {
        style: 'body',
        text: [
          `namespace ${namespaceName}`
        ]
      },
      table
    ]
  }

  buildPodIssueTable(podName:string, issues: PodIssueSummaryDto[]): Content[] {
    let rows: TableCell[][] = issues.map((issue: PodIssueSummaryDto) => {
      return [issue.image, issue.cve, issue.severity];
    });
    if (!rows?.length) {
      rows = [[{text: 'No issues', style: 'italics', colSpan: 3 }, {}, {}]];
    }
    const table: ContentTable = {
      marginBottom: 10,
      table: {
        widths: ['*', 'auto', 'auto'],
        body: [
          ['Image', 'CVE', 'Severity'],
          ...rows
        ]
      },
      layout: this.pdfHelpers.coloredTableHeaderLayout()
    }

    return [
      {
        style: 'body',
        text: [
          `Pod ${podName}\n`
        ]
      },
      table
    ]
  }

}