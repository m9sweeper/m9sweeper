import { Configuration } from 'webpack';

export default {
  resolve: {
    fallback: {
      url: require.resolve('url-shim')
    }
  }
} as Configuration;
