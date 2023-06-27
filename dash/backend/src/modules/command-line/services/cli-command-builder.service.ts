import { Injectable } from "@nestjs/common";
import { CliCommands } from '../enums/cli-commands';
import { CliCommand } from '../classes/cli-command';
import { HelmSetupCommand } from '../commands/helm-setup.command';
import { ClusterSyncCommand } from '../commands/cluster-sync.command';
import { GatekeeperExceptionCommand } from '../commands/gatekeeper-exception.command';
import { KubernetesHistoryCommand } from '../commands/kubernetes-history.command';
import { ClusterCommand } from '../commands/cluster.command';
import { SyncExceptionStatusCommand } from '../commands/exception.command';
import { DatabaseStatusCommand } from "../commands/database-status.command";


@Injectable()
export class CliCommandBuilderService {
    protected _commands: CliCommand[];

    constructor(
      protected readonly helmSetupCommand: HelmSetupCommand,
      protected readonly clusterSyncCommand: ClusterSyncCommand,
      protected readonly gatekeeperExceptionCommand: GatekeeperExceptionCommand,
      protected readonly kubernetesHistoryCommand: KubernetesHistoryCommand,
      protected readonly clusterCommand: ClusterCommand,
      protected readonly exceptionCommand: SyncExceptionStatusCommand,
      protected readonly databaseStatusCommand: DatabaseStatusCommand
    ) {}

    get commands(): CliCommand[] {
        if (this._commands) {
            return this._commands;
        } else {
            this.initializeCommandArray();
            return this._commands;
        }
    }

    printHelp(): void {
        console.log('M9sweeper CLI commands available');
        for (const command of this.commands) {
            command.printHelp();
        }
    }

    findCommand(command: CliCommands | string): CliCommand {
        return this.commands.find(x => x.command === command);
    }

    protected initializeCommandArray(): void {
        this._commands = [
            new CliCommand(
                CliCommands.UserInit,
                'Seeds the a super admin account & creates API keys',
                () => this.helmSetupCommand.runSeed()
            ),
            new CliCommand(
                CliCommands.RegistryInit,
                'Takes JSON of docker registries to populate the database with',
                () => this.helmSetupCommand.populateRegistries(),
            ),
            new CliCommand(
                CliCommands.ExceptionInit,
                'Accepts comma delimited list of namespaces to whitelist',
                () => this.helmSetupCommand.loadDefaultNamespaceExceptions(),
            ),
            new CliCommand(
                CliCommands.SyncGateKeeperExceptions,
                'Synchronizes gatekeeper exception blocks.',
                () => this.gatekeeperExceptionCommand.syncGatekeeperExceptionBlocks(),
            ),
            new CliCommand(
                CliCommands.ClusterSync,
                'Sync one or all cluster\'s data',
                clusterId => this.clusterSyncCommand.syncCluster(clusterId),
                ['clusterID']
            ),
            new CliCommand(
                CliCommands.PopulateKubernetesHistory,
                'Save kubernetes contents history',
                () => this.kubernetesHistoryCommand.get(),
            ),
            new CliCommand(
                CliCommands.ClusterSeed,
                'Seeds the DB with the current cluster',
                () => this.clusterCommand.seedCluster(),
            ),
            new CliCommand(
                CliCommands.SyncExceptionStatus,
                'Syncs exception status',
                () => this.exceptionCommand.syncExceptionStatus(),
            ),
            new CliCommand(
                CliCommands.DatabaseCheck,
                'Runs a one-time check against the database to see if it is available and responding to queries',
                () => this.databaseStatusCommand.runCheck(),
            ),
            new CliCommand(
                CliCommands.DatabaseWait,
                'Waits for the database to be available and responding to queries',
                () => this.databaseStatusCommand.waitForDatabse(),
            ),
        ];
    }
}
