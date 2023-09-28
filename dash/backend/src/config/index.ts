import admissionController from './admissionController';
import common from './common';
import database from './database';
import defaultSeedEmailPassword from './defaultSeedEmailPassword';
import email from './email';
import fileManagement from './fileManagement';
import messageQueue from './messageQueue';
import rabbitMQ from './rabbitMQ';
import security from './security';
import server from './server';
import gatekeeper from './gatekeeper';
import kubebench from './kubebench';
import kubesec from './kubesec';
import releaseNamespace from './releaseNamespace';
import nodeCron from './node-cron';
import metrics from './metrics';

export default () => ({
  test: {
    port: process.env.SERVER_PORT || 3000,
  },
  admissionController,
  common,
  database,
  defaultSeedEmailPassword,
  email,
  fileManagement,
  gatekeeper,
  kubebench,
  kubesec,
  messageQueue,
  metrics,
  nodeCron,
  rabbitMQ,
  releaseNamespace,
  security,
  server,
});
