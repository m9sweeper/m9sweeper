import {Injectable} from '@nestjs/common';
import {Content, ContentTable, TableCell} from 'pdfmake/interfaces';
import {SecurityAuditReportPdfHelpersService} from './security-audit-report-pdf-helpers.service';
import {IAuditReportSectionService} from '../interfaces/IAuditReportSectionService';
import {ClusterObjectSummary} from '../../cluster/dto/cluster-object-summary';
import {KubeHunterService} from '../../kube-hunter/service/kube-hunter.service';
import {
  IKHRawResponseVulnerability,
  IKubeHunterRawVulnerabilities
} from '../../kube-hunter/dto/kube-hunter-raw.interface';
import {format} from 'date-fns';

@Injectable()
export class SecurityAuditKubehunterService implements IAuditReportSectionService {

  constructor(
    protected readonly pdfHelpers: SecurityAuditReportPdfHelpersService,
    protected readonly kubeHunterService: KubeHunterService,
  ) {

  }


  async buildClusterContent(cluster: ClusterObjectSummary): Promise<{ content: Content; summaryRow: TableCell[] }> {
    const report = await this.kubeHunterService.getMostRecentReportForCluster(cluster.id);
    const locations: Record<string, IKHRawResponseVulnerability[]>  = {}
    let content: Content;
    let summaryRow: TableCell[];
    if (report) {
      let totalHigh = 0;
      let totalMed = 0;
      let totalLow = 0;
      const processed = (JSON.parse(report?.vulnerabilities) as IKubeHunterRawVulnerabilities)?.value?.value;
      for (const vuln of processed) {
        if (locations[vuln.location]) {
          locations[vuln.location].push(vuln);
        } else {
          locations[vuln.location] = [vuln];
        }

        if (vuln.severity === 'high') {
          totalHigh++;
        } else if (vuln.severity === 'medium') {
          totalMed++;
        } else {
          totalLow++;
        }
      }
      content = this.buildKubeHunterLocationTables(locations);
      summaryRow = [cluster.name, format(new Date(+report.createdAt), 'PPP'), totalHigh, totalMed, totalLow];
    } else {
      content = { text: 'kube-hunter scan not run', style: 'italics'};
      summaryRow = [cluster.name, 'N/A', {text: 'No scan run', style: 'italics', colSpan: 3 },{},{}];
    }


    return {
      summaryRow,
      content: [this.buildClusterKubehunterIntro(), content]
    };
  }

  buildSummaryContent(summaries: TableCell[][]): Content {
    const table: ContentTable = {
      marginBottom: 10,
      style: 'body',
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
        body: [
          ['Cluster', 'Last Scanned', 'High', 'Medium', 'Low'],
          ...summaries
        ]
      },
      layout: this.pdfHelpers.coloredTableHeaderLayout()
    }

    return [
      this.pdfHelpers.buildSubHeader('Penetration Test with kube-hunter'),
      {
        style: 'body',
        text: [
          'Kube-hunter runs a non-invasive penetration test in your cluster. ',
          'It runs as an application in your cluster and then attempts to see whether it can access any sensitive cluster data ',
          'or whether it has too many privileges. This is similar to what a hacker would do, ',
          'and informs you whether there are any obvious configuration issues you should try to fix.'
        ]
      },
      table
    ];
  }

  /** Builds the cluster specific section of a kube-hunter report */
  buildClusterKubehunterIntro(): Content[] {
    return [
      this.pdfHelpers.buildSubHeader('Penetration Test with kube-hunter'),
      {
        style: 'body',
        text: [
          'Kube-hunter runs a non-invasive penetration test in your cluster. ',
          'It runs as an application in your cluster and then attempts to see if it can access any sensitive cluster data or has too many privileges. ',
          'This is similar to what a hacker would do, and informs you whether there are any obvious configuration issues you should try to fix.',
        ]
      },
    ];
  }

  buildKubeHunterLocationTables(locationData: Record<string, IKHRawResponseVulnerability[]>): Content[] {
    const locations = Object.keys(locationData);
    if (locations.length) {
      const locationTables: Content[] = [];
      for (const location of locations) {
        const rows = locationData[location]
          .map(v => (
            [v.severity, v.category, v.vulnerability,
            v.description, { text: v.avd_reference, link: v.avd_reference, style: 'link' }
          ]));
        const table: ContentTable = {
          marginBottom: 10,
          style: 'body',
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Severity', 'Category', 'Vulnerability', 'Description', 'Additional Information'],
              ...rows
            ]
          },
          layout: this.pdfHelpers.coloredTableHeaderLayout()
        }
        locationTables.push([{text: `Location: ${location}`, style: 'tableLabel' }, table]);
      }
      return locationTables;
    } else {
      return [{ text: 'No vulnerabilities found', style: 'italics'}];
    }
  }
}