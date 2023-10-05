import {Injectable} from '@nestjs/common';
import PdfPrinter = require('pdfmake');
import {ConfigService} from '@nestjs/config';
import {assetsConfig} from '../../../config/types/assets-config';
import {BufferOptions, TDocumentDefinitions} from 'pdfmake/interfaces';



@Injectable()
export class PdfMakeService {
  protected _printer: PdfPrinter;
  constructor(
    protected readonly config: ConfigService
  ) {}
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

  buildPdfStream(definition: TDocumentDefinitions, options?: BufferOptions): PDFKit.PDFDocument {
    return this.printer.createPdfKitDocument(definition, options);
  }
}