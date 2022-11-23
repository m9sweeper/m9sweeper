export default {
  name: process.env.SERVER_NAME || 'M9sweeper',
  host: process.env.SERVER_HOST || '0.0.0.0',
  port: process.env.SERVER_PORT || 3000,
  baseUrl: process.env.SERVER_BASE_URL || 'http://localhost:3000/',
  frontendUrl: process.env.SERVER_FRONTEND_URL || process.env.SERVER_BASE_URL
}
