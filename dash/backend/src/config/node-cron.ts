import * as process from 'process';
import {NodeCronConfig} from './types/node-cron-config';

export default {
  // default to disabled
  enabled: +(process.env.NODE_CRON_ENABLED || '0') === 1,
  // Default: Every 30 minutes
  clusterScrapeSchedule: process.env.CLUSTER_SCRAPE_SCHEDULE || '30 * * * *',
  gatekeeperExceptionSyncSchedule: process.env.GATEKEEPER_EXCEPTION_SYNC_SCHEDULE || '30 * * * *',
  // Default: daily at 12:01 am
  kubernetesHistorySchedule: process.env.KUBERNETES_HISTORY_SCHEDULE || '1 0 * * *',
  updateExceptionStatusSchedule: process.env.UPDATE_EXCEPTION_STATUS_SCHEDULE || '1 0 * * *'
} as NodeCronConfig