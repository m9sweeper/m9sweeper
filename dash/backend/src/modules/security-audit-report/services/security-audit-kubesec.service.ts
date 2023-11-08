import {Injectable} from '@nestjs/common';
import {NamespaceService} from '../../namespace/services/namespace.service';
import {Content, ContentTable, TableCell} from 'pdfmake/interfaces';
import {SecurityAuditReportPdfHelpersService} from './security-audit-report-pdf-helpers.service';
import {IAuditReportSectionService} from '../interfaces/IAuditReportSectionService';
import {ClusterObjectSummary} from '../../cluster/dto/cluster-object-summary';
import {KubesecService} from '../../kubesec/services/kubesec.service';
import {KubesecItem, KubesecScanResults} from '../../kubesec/interfaces/kubesec-response';
import {KubesecSummary} from '../interfaces/kubesec-summary';

@Injectable()
export class SecurityAuditKubesecService implements IAuditReportSectionService {

  constructor(
    protected readonly namespaceService: NamespaceService,
    protected readonly pdfHelpers: SecurityAuditReportPdfHelpersService,
    protected readonly kubesecService: KubesecService
  ) {}

  async buildClusterContent(cluster: ClusterObjectSummary): Promise<{ content: Content; summaryRow: TableCell[] }> {
    const namespaceTables: Content[] = [];
    const summaries: Record<string, KubesecSummary> = {};
    let overallTotal = 0;
    let overallPassed = 0;
    let overallFailed = 0;

    for (const namespace of cluster.namespaces) {
      const namespaceContent: Content[] = [
        this.pdfHelpers.buildSubHeader(`namespace ${namespace.name}`, { skipToc: true })
      ];
      let total = 0;
      let passed = 0;
      let failed = 0;
      // Runs kubesec on each pod, and build its table
      for (const pod of namespace.pods) {
        total++;
        const podResults = await this.runKubesecAndBuildTable(cluster.id, namespace.name, pod.name);
        namespaceContent.push(podResults.content);
        if (podResults.passed) {
          passed++;
        } else {
          failed++;
        }
      }

      overallTotal += total;
      overallFailed += failed;
      overallPassed += passed;
      summaries[namespace.name] = { passed, failed, total };
      if (total === 0) {
        namespaceContent.push({ text: 'No pods present', style: ['italics', 'body'] });
      }
      namespaceTables.push(namespaceContent);
    }

    return {
      content: [this.buildKubesecClusterIntro(summaries), namespaceTables],
      summaryRow: [cluster.name, overallTotal, overallPassed, overallFailed]
    }
  }

  buildSummaryContent(summaries: TableCell[][]): Content {
    const summaryTable: ContentTable = {
      marginBottom: 10,
      style: 'body',
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto'],
        body: [
          ['Cluster', 'Total Pods', 'Passed', 'Failed'],
          ...summaries
        ]
      },
      layout: this.pdfHelpers.coloredTableHeaderLayout()
    }

    return [
      this.pdfHelpers.buildSubHeader('Workload Security with Kubesec'),
      {
        style: 'body',
        text: [
          'Kubesec analyzes your pods and warns you if any of your applications are being deployed in an insecure way, ',
          'such as running with escalated privileges, not limiting resources, or mounting folders from the host machine. ',
          'Its output should be used to coach developers to improve how they are configuring applications in Kubernetes.',
          '\n\n',
          {text: 'Summary of kubesec results by cluster:', style: 'tableLabel' }
        ]
      },
      summaryTable
    ]
  }

  protected async runKubesecAndBuildTable(clusterId: number, namespace: string, podName: string): Promise<{ content: Content, passed: boolean }> {
    return this.kubesecService.runKubesecByPod(podName, namespace, clusterId)
      .then((kubesecResponse: { data: KubesecScanResults }) => {
        const results = kubesecResponse?.data[0];
        return {
          content: this.buildKubesecTableForPod(podName, results),
          passed: results?.score > 0
        };
      })
      .catch(() => {
        return {
          passed: false,
          content: { text: `Pod ${podName} failed to scan`, style: [ 'alert', 'italics' ] }
        }
      });
  }

  buildKubesecTableForPod(podName: string, results: KubesecScanResults): Content {
    const scoring = results?.scoring;
    let rows: TableCell[][] = []
    scoring.passed?.forEach((item: KubesecItem) => {
      rows.push([item.id, item.points, 'Passed', item.reason]);
    });

    scoring.advise?.forEach((item: KubesecItem) => {
      rows.push([item.id, item.points, 'Advise', item.reason]);
    });

    scoring.critical?.forEach((item: KubesecItem) => {
      rows.push([item.id, item.points, 'Critical', item.reason]);
    });

    if (!rows?.length) {
      rows = [[{text: 'No items found', style: 'italics', colSpan: 3 }, {}, {}]];
    }
    const table: ContentTable = {
      marginBottom: 10,
      style: 'body',
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', 'auto', '*'],
        body: [
          ['ID', 'Points', 'Category', 'Reason'],
          ...rows
        ]
      },
      layout: this.pdfHelpers.coloredTableHeaderLayout()
    }

    return [
      {
        style: 'tableLabel',
        text: [
          `Pod ${podName} (Score: ${results?.score})`
        ]
      },
      table
    ]

  }

  buildKubesecClusterIntro(namespacesSummaries: Record<string, KubesecSummary>): Content {
    const keys = Object.keys(namespacesSummaries);
    const rows: TableCell[][] = []
    for (const key of keys) {
      const ns = namespacesSummaries[key];
      rows.push([key, ns.total, ns.passed, ns.failed]);
    }

    const summaryTable: ContentTable = {
      marginBottom: 10,
      style: 'body',
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto'],
        body: [
          ['Namespace', 'Total Pods', 'Passed', 'Failed'],
          ...rows
        ]
      },
      layout: this.pdfHelpers.coloredTableHeaderLayout()
    }

    return [
      this.pdfHelpers.buildSubHeader('Workload Security with Kubesec'),
      {
        style: 'body',
        text: [
          'Kubesec analyzes your pods and warns you if any of your applications are being deployed in an insecure way, ',
          'such as running with escalated privileges, not limiting resources, or mounting folders from the host machine. ',
          'Its output should be used to coach developers to improve how they are configuring applications in Kubernetes.',
          '\n\n',
          {text: 'Summary of kubesec results by namespace:', style: 'tableLabel' }
        ]
      },
      summaryTable
    ]
  }
}