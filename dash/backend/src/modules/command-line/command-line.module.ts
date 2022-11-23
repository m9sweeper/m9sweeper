import { Global, Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
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

@Global()
@Module({
    providers: [
        ClusterCommand,
        ClusterSyncCommand,
        HelmSetupCommand,
        KubernetesClusterService,
        KubernetesHistoryCommand,
        KubernetesHistoryService,
        ExceptionBlockService,
        GatekeeperExceptionCommand,
        SyncExceptionStatusCommand,
        ImageRescanningService,
    ],
    imports: [
        CommandModule,
    ],
    exports: []
})
export class CommandLineModule {}
