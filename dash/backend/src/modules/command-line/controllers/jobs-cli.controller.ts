import {Injectable} from '@nestjs/common';
import {Command, Positional} from 'nestjs-command';
import {ClusterCommand} from '../commands/cluster.command';
import {ClusterSyncCommand} from '../commands/cluster-sync.command';
import {SyncExceptionStatusCommand} from '../commands/exception.command';
import {GatekeeperExceptionCommand} from '../commands/gatekeeper-exception.command';
import {HelmSetupCommand} from '../commands/helm-setup.command';
import {KubernetesHistoryCommand} from '../commands/kubernetes-history.command';

@Injectable()
export class JobsCliController {
  constructor(
    protected readonly clusterCommand: ClusterCommand,
    protected readonly clusterSyncCommand: ClusterSyncCommand,
    protected readonly exceptionCommand: SyncExceptionStatusCommand,
    protected readonly gatekeeperExceptionCommand: GatekeeperExceptionCommand,
    protected readonly helmSetupCommand: HelmSetupCommand,
    protected readonly kubernetesHistoryCommand: KubernetesHistoryCommand
  ) {
  }

  @Command({ command: 'cluster:seed', describe: 'Seeds the DB with the current cluster' })
  async seedCluster(): Promise<void> {
    return await this.clusterCommand.seedCluster();
  }

  @Command({ command: 'cluster:sync <clusterID>', describe: 'Sync one or all clusters\' data' })
  async syncCluster(
    @Positional({
      name: 'clusterID',
      // describe: 'Database ID of a cluster',
      // type: 'string',
    }) clusterID: string
  ) {
    return await this.clusterSyncCommand.syncCluster(clusterID);
  }

  @Command({ command: 'sync:exception-status', describe: 'Syncing exception status...' })
  async syncExceptionStatus(): Promise<void> {
    return await this.exceptionCommand.syncExceptionStatus();
  }

  @Command({
    command: 'sync:gatekeeper-exceptions',
    describe: 'Synchronizing gatekeeper exception blocks.'
  })
  async syncGatekeeperExceptionBlocks(): Promise<void> {
    return await this.gatekeeperExceptionCommand.syncGatekeeperExceptionBlocks();
  }

  @Command({ command: 'users:init', describe: 'Seeds the a super admin account & creates API keys' })
  async runSeed(): Promise<any[] | void> {
    return await this.helmSetupCommand.runSeed();
  }

  @Command({command: "registries:init", describe: "Takes JSON of docker registries to populate the database with"})
  async populateRegistries(): Promise<void | any[]> {
    return await this.helmSetupCommand.populateRegistries();
  }

  @Command({command: "exceptions:init", describe: "Accepts comma delimited list of namespaces to whitelist"})
  async loadDefaultNamespaceExceptions(): Promise<void> {
    return  await this.helmSetupCommand.loadDefaultNamespaceExceptions();
  }

  @Command({ command: 'populate:kubernetes-history', describe: 'Save kubernetes contents history' })
  async populateKubernetesHistory() {
    return await this.kubernetesHistoryCommand.get();
  }
}