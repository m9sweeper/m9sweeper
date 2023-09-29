import {PdfmakeConfig} from './types/pdfmake-config';
import * as process from 'process';

export default {
  fontsDirectory: process.cwd() + '/' + (process.env.FONTS_DIRECTORY || 'dist/fonts')
} as PdfmakeConfig