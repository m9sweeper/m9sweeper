export default {
  disableEndpoint: (process.env.METRICS_DISABLE_ENDPOINT || 'false').toString().toLowerCase() === 'true',
  secureEndpoint: true,
  // secureEndpoint: (process.env.METRICS_SECURE_ENDPOINT || 'false').toString().toLowerCase() === 'true',
};
