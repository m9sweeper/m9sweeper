export default {
    USERNAME: process.env.USERNAME || 'super.admin@intelletive.com',
    PASSWORD: process.env.PASSWORD || '123456',
    BASE_URL: process.env.BASE_URL || 'http://127.0.0.1:3000',
    GATEKEEPER_VERSION: process.env.GATEKEEPER_VERSION || '3.10.0',
    DOCKER_REGISTRY: process.env.DOCKER_REGISTRY || ''
};
