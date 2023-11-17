import {assetsConfig} from './types/assets-config';
import * as process from 'process';


const assetsDirectory = process.cwd() + '/' + (process.env.ASSETS_DIRECTORY || 'assets');

export default {
  assetsDirectory: assetsDirectory,
  fontsDirectory: assetsDirectory + '/fonts',
  imagesDirectory: assetsDirectory + '/images',
} as assetsConfig