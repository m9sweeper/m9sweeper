export interface NodeCronConfig {
  enabled: boolean;
  clusterScrapeSchedule: string;
  gatekeeperExceptionSyncSchedule: string;
  kubernetesHistorySchedule: string;
  updateExceptionStatusSchedule: string;
}
