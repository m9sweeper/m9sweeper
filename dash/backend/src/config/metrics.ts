export default {
  disableEndpoint: (process.env.METRICS_DISABLE_ENDPOINT || 'false').toString().toLowerCase() === 'true',
  secureEndpoint: (process.env.METRICS_SECURE_ENDPOINT || 'false').toString().toLowerCase() === 'true',
  security: {
    apiKey: process.env.METRICS_API_KEY,
    minimumAuthority: process.env.METRICS_MINIMUM_AUTHORITY_LEVEL || 'SUPER_ADMIN',
  },
};
