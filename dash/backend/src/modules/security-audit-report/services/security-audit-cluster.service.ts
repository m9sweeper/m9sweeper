import {Injectable} from '@nestjs/common';
import {PrCluster} from '../../reports/interfaces/printable-report-cluster';
import {SecurityAuditTrivyService} from './security-audit-trivy.service';
import {Content, ContentTable} from 'pdfmake/interfaces';
import {SecurityAuditReportPdfHelpersService} from './security-audit-report-pdf-helpers.service';

@Injectable()
export class SecurityAuditClusterService {
  constructor(
    protected readonly reportTrivyService: SecurityAuditTrivyService,
    protected readonly pdfHelpers: SecurityAuditReportPdfHelpersService
  ) {}

  async getClusterReportData(clusterId: number, clusterName: string): Promise<PrCluster> {
    const report: PrCluster = {
      id: clusterId,
      name: clusterName,
      trivy: null
    };

    report.trivy = await this.reportTrivyService.buildClusterTrivyReport(clusterId);
    return report;
  }

  buildClusterSummary(clusters: PrCluster[]): Content[] {
    // Main section header
    const content: Content[] = [
      this.pdfHelpers.buildHeader('Clusters Summary'),
    ];

    /******
     TRIVY
     ******/
    // @TODO: allow disable/enable of Trivy section
    // Add trivy intro
    content.push(this.buildClusterSummaryTrivySection(clusters));

    return content;
  }

  buildClusterSummaryTrivySection(clusters: PrCluster[]): Content[] {

    const trivyTable: ContentTable = {
      marginBottom: 10,
      table: {
        widths: ['*', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          ['Cluster', 'Total Images', 'Crt', 'Maj', 'Med', 'Low', 'Ngl', 'No', 'Not Scanned'],
          ...clusters.map(c => {
            const overview = c.trivy.clusterOverview
            return [c.name, overview.total, overview.critical, overview.major, overview.medium, overview.low, overview.negligible, overview.clean, overview.unscanned]
          })
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
          'Summary of worst CVE by workload by image running in the cluster:\n'
        ]
      },
      trivyTable
    ]
  }

  buildClusterContent(cluster: PrCluster): Content[] {
    const content: Content[] = [
      this.pdfHelpers.buildHeader(`Cluster ${cluster.name}`)
    ];
    content.push(this.reportTrivyService.buildClusterTrivyDetails(cluster.trivy));
    return content;
  }

}