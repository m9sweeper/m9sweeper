import {Injectable} from '@nestjs/common';
import PdfPrinter = require('pdfmake');
import * as fs from 'fs';
import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {ConfigService} from '@nestjs/config';
import {PdfmakeConfig} from '../../../config/types/pdfmake-config';

@Injectable()
export class PrintableAuditReportService {

  constructor(protected readonly config: ConfigService) {

  }

  _printer: PdfPrinter;
  get printer(): PdfPrinter {

    if (!this._printer) {
      const pdfmakeConfig = this.config.get<PdfmakeConfig>('pdfmake');
      const fontsDir = pdfmakeConfig.fontsDirectory;
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

    const definition: TDocumentDefinitions = {
      content: [
        { text: 'BIG', fontSize: 30},
        { text: 'Body', fontSize: 12}
      ]
    };
    const pdf = this.printer.createPdfKitDocument(definition);
    const fname = Date.now() + '-test.pdf';

    pdf.pipe(fs.createWriteStream(`/Users/kyle/WebstormProjects/m9sweeper/dash/backend/dist/${fname}`));
    pdf.end();

    return null;
  }



}