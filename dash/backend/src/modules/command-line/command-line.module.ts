import { Global, Module } from '@nestjs/common';
import { ClusterCommand } from './commands/cluster.command';
import { ClusterSyncCommand } from './commands/cluster-sync.command';
import { KubernetesClusterService } from './services/kubernetes-cluster.service';
import { KubernetesHistoryCommand } from './commands/kubernetes-history.command';
import { KubernetesHistoryService } from './services/kubernetes-history.service';
import {HelmSetupCommand} from "./commands/helm-setup.command";
import {GatekeeperExceptionCommand} from "./commands/gatekeeper-exception.command";
import {SyncExceptionStatusCommand} from "./commands/exception.command";
import {ExceptionBlockService} from "./services/exception-block.service";
import { ImageRescanningService } from './services/image-rescanning.service';
import {JobsCliController} from './controllers/jobs-cli.controller';
import {JobsCronController} from './controllers/jobs-cron.controller';
import {CliCommandBuilderService} from './services/cli-command-builder.service';
import {ScheduleModule} from '@nestjs/schedule';

@Global()
@Module({
    providers: [
        ClusterCommand,
        ClusterSyncCommand,
        JobsCliController,
        JobsCronController,
        HelmSetupCommand,
        KubernetesClusterService,
        KubernetesHistoryCommand,
        KubernetesHistoryService,
        ExceptionBlockService,
        GatekeeperExceptionCommand,
        SyncExceptionStatusCommand,
        ImageRescanningService,
        CliCommandBuilderService
    ],
    imports: [
      ScheduleModule.forRoot()
    ],
    exports: []
})
export class CommandLineModule {}
