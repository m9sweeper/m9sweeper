import {Global, Module} from '@nestjs/common';
import { ClusterDao } from './dao/cluster.dao';
import { ClusterController } from './controllers/cluster.controller';
import {ClusterService} from './services/cluster.service';
import { KubernetesClusterService } from '../command-line/services/kubernetes-cluster.service';
import {KubernetesApiService} from "../command-line/services/kubernetes-api.service";
import {ExceptionBlockService} from "../command-line/services/exception-block.service";
import { GatekeeperController } from './controllers/gatekeeper.controller';
import { GatekeeperService } from './services/gatekeeper.service';
import { ClusterEventModule } from '../cluster-event/cluster-event.module';

@Global()
@Module({
  providers: [
    ClusterDao,
    GatekeeperService,
    ClusterService,
    ExceptionBlockService,
    KubernetesClusterService,
    KubernetesApiService,
  ],
  exports: [
    ClusterDao,
    ClusterService,
    ExceptionBlockService,
    GatekeeperService,
    KubernetesClusterService,
    KubernetesApiService,
  ],
  controllers: [
    ClusterController,
    GatekeeperController,
  ],
})
export class ClusterModule {}
