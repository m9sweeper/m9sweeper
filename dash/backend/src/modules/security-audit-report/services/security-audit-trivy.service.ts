import {Injectable} from '@nestjs/common';
import {SecurityAuditTrivyNamespaceReport, SecurityAuditTrivyReport} from '../../reports/interfaces/security-audit-trivy-report';
import {ReportsService} from '../../reports/services/reports.service';
import {NamespaceService} from '../../namespace/services/namespace.service';
import {Content, ContentTable, TableCell} from 'pdfmake/interfaces';
import {SecurityAuditReportPdfHelpersService} from './security-audit-report-pdf-helpers.service';
import {ImageScanResultsIssueService} from '../../image-scan-results-issue/services/image-scan-results.service';
import {PodIssueSummaryDto} from '../../image-scan-results-issue/dto/pod-issue-summary.dto';
import {IAuditReportSectionService} from '../interfaces/IAuditReportSectionService';
import {ClusterObjectSummary} from '../../cluster/dto/cluster-object-summary';

@Injectable()
export class SecurityAuditTrivyService implements IAuditReportSectionService {

  constructor(
    protected readonly reportService: ReportsService,
    protected readonly namespaceService: NamespaceService,
    protected readonly pdfHelpers: SecurityAuditReportPdfHelpersService,
    protected readonly scanIssuesService: ImageScanResultsIssueService
  ) {

  }


  async buildClusterContent(cluster: ClusterObjectSummary): Promise<{ content: Content; summaryRow: TableCell[] }> {
    const trivyReport = await this.getClusterTrivyReportData(cluster);
    const content = this.buildClusterTrivyDetails(trivyReport);
    const overview = trivyReport.clusterOverview;
    const summaryRow = [cluster.name, overview.total, overview.critical, overview.major, overview.medium, overview.low, overview.negligible, overview.clean, overview.unscanned]
    return { content, summaryRow };
  }

  buildSummaryContent(summaries: TableCell[][]): Content {
    const trivyTable: ContentTable = {
      marginBottom: 10,
      table: {
        headerRows: 1,
        widths: ['*', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          ['Cluster', 'Total Images', 'Crt', 'Maj', 'Med', 'Low', 'Ngl', 'No', 'Not Scanned'],
          ...summaries
        ]
      },
      layout: this.pdfHelpers.coloredTableHeaderLayout()
    }

    return [
      this.pdfHelpers.buildSubHeader('Image Scanning with Trivy'),
      {
        style: 'body',
        text: [
          'Trivy scans the software running in your cluster for common vulnerabilities and exposures (CVEs). ',
          'CVEs are publicly disclosed security flaws that (generally) can be fixed by upgrading to the latest package that has a fix available. ',
          '\n\n',
          {text: 'Summary of worst CVE by workload by image running in the cluster:', style: 'tableLabel' }
        ]
      },
      trivyTable
    ]
  }

  /** Runs the queries to retrieve the necessary Trivy data for a cluster */
  async getClusterTrivyReportData(cluster: ClusterObjectSummary): Promise<SecurityAuditTrivyReport> {
    const report: SecurityAuditTrivyReport = {
      clusterOverview: null,
      namespaces: {},
      vulnerabilities: []
    };

    report.clusterOverview = await this.reportService.getCurrentWorstImage(cluster.id)
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

    const namespaces = cluster.namespaces
    for (const namespace of namespaces) {
      const worstImageReport = await this.reportService.getCurrentWorstImage(cluster.id, { namespaces: [namespace.name]});
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
      const pods = await this.reportService.getRunningVulnerabilitiesInPodsByNamespace(cluster.id, namespace.name);
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


  /** Builds the cluster specific section of a Trivy report */
  buildClusterTrivyDetails(trivyReport: SecurityAuditTrivyReport): Content[] {
    const rows = Object.keys(trivyReport.namespaces).map((key: string) => {
      const overview = trivyReport.namespaces[key]?.overview;
      return [key, overview.total, overview.critical, overview.major, overview.medium, overview.low, overview.negligible, overview.clean, overview.unscanned];
    })
    const trivyTable: ContentTable = {
      marginBottom: 10,
      table: {
        headerRows: 1,
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
          { text: 'Summary of worst CVE by workload by image running in the namespace:', style: 'tableLabel' }
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

  protected buildNamespaceTable(namespaceName:string, namespaceReport: SecurityAuditTrivyNamespaceReport): Content[] {
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
        headerRows: 1,
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
        style: 'tableLabel',
        text: [
          `namespace ${namespaceName}`
        ]
      },
      table
    ]
  }

  protected buildPodIssueTable(podName:string, issues: PodIssueSummaryDto[]): Content[] {
    let rows: TableCell[][] = issues.map((issue: PodIssueSummaryDto) => {
      return [issue.image, issue.cve, issue.severity];
    });
    if (!rows?.length) {
      rows = [[{text: 'No issues', style: 'italics', colSpan: 3 }, {}, {}]];
    }
    const table: ContentTable = {
      marginBottom: 10,
      table: {
        headerRows: 1,
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
        style: 'tableLabel',
        text: [
          `Pod ${podName}`
        ]
      },
      table
    ]
  }
}