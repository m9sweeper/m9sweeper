import {Injectable} from '@nestjs/common';
import PdfPrinter = require('pdfmake');
import * as fs from 'fs';
import {Content, StyleDictionary, TDocumentDefinitions} from 'pdfmake/interfaces';
import {ConfigService} from '@nestjs/config';
import {assetsConfig} from '../../../config/types/assets-config';
import {format} from 'date-fns';

@Injectable()
export class PrintableAuditReportService {

  constructor(protected readonly config: ConfigService) {

  }

  _printer: PdfPrinter;
  get printer(): PdfPrinter {

    if (!this._printer) {
      const assetsConfig = this.config.get<assetsConfig>('assets');
      const fontsDir = assetsConfig.fontsDirectory;
      this._printer = new PdfPrinter({
        Roboto: {
          normal: fontsDir + '/Roboto/Roboto-Regular.ttf',
          bold: fontsDir + '/Roboto/Roboto-Bold.ttf',
          italics: fontsDir + '/Roboto/Roboto-Italic.ttf',
          bolditalics: fontsDir + '/Roboto/Roboto-BoldItalic.ttf'
        }
      });
    }
    return this._printer;
  }

  async generate() {
    const assetsConfig = this.config.get<assetsConfig>('assets');

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
        },
        [ ... this.buildClustersSummary()]

      ],
      styles: this.buildStyles()
    };
    const pdf = this.printer.createPdfKitDocument(definition);
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


}