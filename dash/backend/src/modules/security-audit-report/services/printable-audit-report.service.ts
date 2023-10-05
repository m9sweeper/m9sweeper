import {Injectable} from '@nestjs/common';
import * as fs from 'fs';
import {Content, ContentTable, StyleDictionary, TDocumentDefinitions} from 'pdfmake/interfaces';
import {ConfigService} from '@nestjs/config';
import {assetsConfig} from '../../../config/types/assets-config';
import {format} from 'date-fns';
import {ClusterService} from '../../cluster/services/cluster.service';
import {PrCluster, PrTrivyOverview, PrTrivyReport} from '../../reports/interfaces/printable-report-cluster';
import {PdfMakeService} from '../../shared/services/pdf-make.service';
import {NamespaceService} from '../../namespace/services/namespace.service';
import {ReportsService} from '../../reports/services/reports.service';

@Injectable()
export class PrintableAuditReportService {

  constructor(
    protected readonly config: ConfigService,
    protected readonly clusterService: ClusterService,
    protected readonly pdfService: PdfMakeService,
    protected readonly namespaceService: NamespaceService,
    protected readonly reportService: ReportsService,
  ) {

  }

  async generate() {
    const today = format(new Date(), 'PPP');

    const definition: TDocumentDefinitions = {
      footer: (page: number) => {

        return {
          margin: [45, 0, 45, 0],
          columns: [
            { text: today },
            { text: page, alignment: 'right' }
          ]
        }
      },
      content: [
        ...this.buildIntro()
      ],
      styles: this.buildStyles()
    };
    // @TODO make cluster configurable
    const clusters = await this.clusterService.getAllClusters()

    const reportsByCluster: PrCluster[] = [];
    for (const cluster of clusters) {
      reportsByCluster.push(await this.getClusterReportData(cluster.id, cluster.name));
    }

    (definition.content as Content[]).push(...this.buildClusterSummary(reportsByCluster));

    const pdf = this.pdfService.buildPdfStream(definition);
    const fname = Date.now() + '-test.pdf';

    pdf.pipe(fs.createWriteStream(`/Users/kyle/WebstormProjects/m9sweeper/dash/backend/dist/${fname}`));
    pdf.end();

    return null;
  }

  protected buildStyles(): StyleDictionary {
    const m9sweeperBlue = '#1155cc';
    return {
      title: {
        fontSize: 26,
        color: m9sweeperBlue,
        marginBottom: 26
      },
      h1: {
        fontSize: 20,
        color: m9sweeperBlue,
        marginBottom: 10
      },
      h2: {
        fontSize: 16,
      },
      body: {
        fontSize: 11
      },
      tocMain: {
        fontSize: 16
      },
      tocSub: {
        fontSize: 11
      }
    };
  }

  buildIntro(): Content[] {
    const assetsConfig = this.config.get<assetsConfig>('assets');
    return [
      { image: assetsConfig.imagesDirectory.concat('/m9sweeper-logo.png')},
      { text: 'Kubernetes Security Audit Report', style: 'title' },
      { text: 'Overview', style: 'h1' },
      {
        style: 'body',
          text: [
        'This security audit report was generated automatically m9sweeper. ',
        'M9sweeper has run a number of kubernetes security tools to produce this report. ',
        'Each tool will be given a section along with a description of the tool, ',
        'what element of security it covers, and the results reported by the tool.',
        '\n\n',
        'A separate report will be given for each of your clusters as well as a summary of all of your clusters, if you have multiple.\n'
      ]
      },
      {
        toc: {
          title: { text: 'Table of Contents', style: 'h1'},
        }
      }
    ];
  }

  buildClustersSummary(): Content[] {
    return [
      { text: 'Clusters Summary', style: 'h1', tocItem: true, tocStyle: 'tocMain' },
      { text: 'Image Scanning with Trivy', style: 'h2', ...this.tocSubItemSettings },
      {
        style: 'body',
        text: [
          'Trivy scans the software running in your cluster for common vulnerabilities and exposures (CVEs). ',
          'CVEs are publicly disclosed security flaws that (generally) can be fixed by upgrading to the latest package that has a fix available. ',
          '\n\n',
          'Summary of worst CVE by workload by image running in the cluster:\n'
        ]
      },
      {
        table: {
          widths: ['*', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['Cluster', 'Total Images', 'Crt', 'Maj', 'Med', 'Low', 'Ngl', 'No'],
            ['k8s-stg-tenant-01', 23, 1, 2, 3, 9, 7, 1],
            ['k8s-prd-tenant-01', 12, 0, 2, 4, 5, 1, 0],
          ]
        },
        layout: {
          // Makes header row have gray background
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#d9d9d9' : null
        }
      },
      { text: 'Workload Security with Kubesec', style: 'h2', ...this.tocSubItemSettings },
      {
        style: 'body',
        text: [
          'Kubesec analyzes your pods and warns you if any of your applications are being deployed in an insecure way, ',
          'such as running with escalated privileges, not limiting resources, or mounting folders from the host machine. ',
          'Its output should be used to coach developers to improve how they are configuring applications in Kubernetes.',
          '\n\n',
          'Summary of kubesec results by cluster:\n'
        ]
      },
      {
        table: {
          widths: ['*', '*', 'auto', 'auto'],
          body: [
            [ 'Cluster', 'Total Pods', 'Passed', 'Failed' ],
            [ 'k8s-stg-tenant-01', 153, 140, 13 ],
            [ 'k8s-prd-tenant-01', 123, 121, 2 ],
          ]
        },
        layout: {
          // Makes header row have gray background
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#d9d9d9' : null
        }
      },
    ]
  }

  buildClusterSummary(clusters: PrCluster[]): Content[] {
    // Main section header
    const content: Content[] = [
      { text: 'Clusters Summary', style: 'h1', tocItem: true, tocStyle: 'tocMain' },
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
      layout: {
        // Makes header row have gray background
        fillColor: (rowIndex: number) => rowIndex === 0 ? '#d9d9d9' : null
      }
    }

    return [
      { text: 'Image Scanning with Trivy', style: 'h2', ...this.tocSubItemSettings },
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


  /**
   * Because margin has to be set as tocMargin rather than as a property of the tocSTyle,
   * this utility makes it easy to modify margins for the toc sub items
   * */
  get tocSubItemSettings() {
    return {
      tocItem: true,
      tocMargin: [16, 0, 0, 0],
      tocStyle: 'tocSub',
      tocNumberStyle: 'tocSub'
    }
  }

  async getClusterReportData(clusterId: number, clusterName: string): Promise<PrCluster> {
    const report: PrCluster = {
      id: clusterId,
      name: clusterName,
      trivy: null
    };

    report.trivy = await this.buildClusterTrivyReport(clusterId);
    return report;
  }

  async buildClusterTrivyReport(clusterId: number): Promise<PrTrivyReport> {
    const report: PrTrivyReport = {
      clusterOverview: null,
      namespaceOverview: new Map<string, PrTrivyOverview>(),
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
      report.namespaceOverview.set(namespace.name, {
        total: worstImageReport.totalImages,
        critical: worstImageReport.criticalImages,
        major: worstImageReport.majorImages,
        medium: worstImageReport.mediumImages,
        low: worstImageReport.lowImages,
        negligible: worstImageReport.negligibleImages,
        unscanned: worstImageReport.unscannedImages,
        clean: worstImageReport.safeImages
      });
    }

    return report;

  }


}