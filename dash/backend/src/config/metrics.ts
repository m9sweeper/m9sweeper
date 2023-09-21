export default {
  disableEndpoint: +process.env.METRICS_DISABLE_ENDPOINT || 0,
  secureEndpoint: +process.env.METRICS_SECURE_ENDPOINT || 0,
  security: {
    apiKey: process.env.METRICS_API_KEY,
    minimumAuthority: process.env.METRICS_MINIMUM_AUTHORITY_LEVEL || 'SUPER_ADMIN',
  },
};
