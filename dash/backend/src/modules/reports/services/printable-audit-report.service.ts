import {Injectable} from '@nestjs/common';
import PdfPrinter = require('pdfmake');
import * as fs from 'fs';
import {TDocumentDefinitions} from 'pdfmake/interfaces';

@Injectable()
export class PrintableAuditReportService {

  _printer: PdfPrinter;
  get printer(): PdfPrinter {

    if (!this._printer) {
      this._printer = new PdfPrinter({
        // Roboto: {
        //   normal: 'fonts/Roboto/Roboto-Regular.ttf',
        //   bold: 'fonts/Roboto/Roboto-Bold.ttf',
        //   italics: 'fonts/Roboto/Roboto-Italic.ttf',
        //   bolditalics: 'fonts/Roboto/Roboto-BoldItalic.ttf'
        // }
        // Roboto: {
        //   normal: 'Helvetica',
        //   bold: 'Helvetica',
        //   italics: 'Helvetica',
        //   bolditalics: 'Helvetica'
        // }
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