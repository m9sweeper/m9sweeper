export default {
  hostname: process.env.RABBITMQ_HOST_NAME || 'rabbitmq',
  port: +process.env.RABBITMQ_HOST_PORT || 5672,
  protocol: process.env.RABBITMQ_PROTOCOL || 'amqp',
  username: process.env.RABBITMQ_USER_NAME || 'guest',
  password: process.env.RABBITMQ_USER_PASSWORD || 'guest',
  vhost: process.env.RABBITMQ_VHOST || '/',
  frameMax: +process.env.RABBITMQ_FRAMEMAX || 0,
  enabled: +(process.env.RABBITMQ_ENABLED || '1') === 1 // default to enabled
};
