export default {
  secureEndpoint: (process.env.METRICS_SECURE_ENDPOINT || 'false').toString().toLowerCase() === 'true',
  placeholder: 'helloworld',
};
