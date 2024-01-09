import {Injectable} from '@nestjs/common';
import {Content, ContentTable, TableCell} from 'pdfmake/interfaces';
import {SecurityAuditReportPdfHelpersService} from './security-audit-report-pdf-helpers.service';
import {IAuditReportSectionService} from '../interfaces/IAuditReportSectionService';
import {ClusterObjectSummary} from '../../cluster/dto/cluster-object-summary';
import {KubeBenchService} from '../../kube-bench/services/kube-bench.service';
import {KubeBenchDto} from '../../kube-bench/dto/kube-bench-dto';

@Injectable()
export class SecurityAuditKubeBenchService implements IAuditReportSectionService {

  constructor(
    protected readonly pdfHelpers: SecurityAuditReportPdfHelpersService,
    protected readonly kubebenchService: KubeBenchService,
  ) {

  }

  async buildClusterContent(cluster: ClusterObjectSummary): Promise<{ content: Content; summaryRow: TableCell[] }> {
      const kbReport = await this.kubebenchService.getLastBenchReportSummary(cluster.id)
        .then(r => r?.length ? r[0] : undefined);



    const summaryRow = [
      cluster.name,
      kbReport?.resultsSummary?.total_pass ?? 'N/A',
      kbReport?.resultsSummary?.total_fail ?? 'N/A',
      kbReport?.resultsSummary?.total_warn ?? 'N/A',
    ];

    return {
      summaryRow,
      content: [
        this.buildClusterIntro(kbReport)
      ]
    };
  }

  buildSummaryContent(summaries: TableCell[][]): Content {
    const table: ContentTable = {
      marginBottom: 10,
      style: 'body',
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto'],
        body: [
          ['Cluster', 'Passed', 'Failed', 'Warnings'],
          ...summaries
        ]
      },
      layout: this.pdfHelpers.coloredTableHeaderLayout()
    };

    return [
      this.pdfHelpers.buildSubHeader('Security Benchmarks with kube-bench'),
      {
        style: 'body',
        text: [
          'Kube-Bench compares your cluster’s configuration against the Center for Internet Security’s ',
          'best practices for running a Kubernetes Cluster. It runs as an application with elevated privileges in your cluster ',
          'and then attempts to see whether the cluster is configured securely.',
        ]
      },
      table
    ];
  }

  buildClusterIntro(report: KubeBenchDto) {

    const body = [];
    let scannedMessage = '';
    if (report?.resultsJson) {
      const results = report.resultsJson; // convenience
      const total = results.Totals.total_pass + results.Totals.total_fail + results.Totals.total_warn;
      scannedMessage = `${results.Totals.total_pass}/${total} Tests Passed`;

      for (const section of results.Controls) {
        body.push(this.pdfHelpers.buildSubHeader(`${section.text} (${section.version} v${section.detected_version})`, { level: 2, style: 'h3' } ));
      }

    } else {
      scannedMessage = 'Unscanned';
    }


    const content = [
      this.pdfHelpers.buildSubHeader(`Security Benchmarks with kube-bench (${scannedMessage})`),
      {
        style: 'body',
        text: [
          'Kube-Bench compares your cluster\'s configuration against the Center for Internet Security\'s best practices for running a Kubernetes Cluster. ',
          'It runs as an application with elevated privileges in your cluster and then attempts to see whether the cluster is configured correctly. '
        ]
      },
      body
    ];

    return content;
  }




}