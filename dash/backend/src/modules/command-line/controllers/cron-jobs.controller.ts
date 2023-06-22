import {ClusterSyncCommand} from '../commands/cluster-sync.command';
import {SyncExceptionStatusCommand} from '../commands/exception.command';
import {GatekeeperExceptionCommand} from '../commands/gatekeeper-exception.command';
import {KubernetesHistoryCommand} from '../commands/kubernetes-history.command';
import {Injectable} from '@nestjs/common';
import {SchedulerRegistry, Timeout} from '@nestjs/schedule';
import {CronJob} from 'cron';
import {MineLoggerService} from '../../shared/services/mine-logger.service';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class CronJobsController {
  constructor(
    protected readonly clusterSyncCommand: ClusterSyncCommand,
    protected readonly exceptionCommand: SyncExceptionStatusCommand,
    protected readonly gatekeeperExceptionCommand: GatekeeperExceptionCommand,
    protected readonly kubernetesHistoryCommand: KubernetesHistoryCommand,
    protected readonly logger: MineLoggerService,
    protected readonly config: ConfigService,
    protected readonly schedulerRegistry: SchedulerRegistry
  ) {
  }

  /**
   * This will be called 500ms after the app finished initializing.
   * If cron jobs are enabled, this will initialize them with the configured schedule
   * */
  @Timeout(500)
  initializeCrons() {
    const cronConfig = this.config.get('nodeCron');
    if (cronConfig.enabled) {
      this.logger.log('Cronjobs enabled');

      // Define Cron jobs
      const scrapeJob = new CronJob(cronConfig.clusterScrapeSchedule, async () => {
        return await this.syncClusters();
      });

      const gatekeeperSyncJob = new CronJob(cronConfig.gatekeeperExceptionSyncSchedule, async () => {
        return await this.syncGatekeeperExceptions();
      });

      const k8sHistoryJob = new CronJob(cronConfig.kubernetesHistorySchedule, async () => {
        return await this.populateKubernetesHistory();
      });

      const exceptionSyncJob = new CronJob(cronConfig.updateExceptionStatusSchedule, async () => {
        return await this.syncExceptionStatus();
      });

      // Register and start cron jobs
      this.schedulerRegistry.addCronJob('cluster:sync all', scrapeJob);
      this.schedulerRegistry.addCronJob('sync:gatekeeper-exceptions', gatekeeperSyncJob);
      this.schedulerRegistry.addCronJob('populate:kubernetes-history', k8sHistoryJob);
      this.schedulerRegistry.addCronJob('sync:exception-status', exceptionSyncJob);
      scrapeJob.start();
      gatekeeperSyncJob.start();
      k8sHistoryJob.start();
      exceptionSyncJob.start();
    }
  }

  async syncClusters(): Promise<boolean> {
    return await this.clusterSyncCommand.syncCluster('all');
  }

  async populateKubernetesHistory() {
    return await this.kubernetesHistoryCommand.get();
  }

  async syncExceptionStatus() {
    return await this.exceptionCommand.syncExceptionStatus();
  }

  async syncGatekeeperExceptions() {
    return await this.gatekeeperExceptionCommand.syncGatekeeperExceptionBlocks();
  }
}