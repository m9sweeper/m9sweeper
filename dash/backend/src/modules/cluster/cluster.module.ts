import {Global, Module} from '@nestjs/common';
import { ClusterDao } from './dao/cluster.dao';
import { ClusterController } from './controllers/cluster.controller';
import {ClusterService} from './services/cluster.service';
import { KubernetesClusterService } from '../command-line/services/kubernetes-cluster.service';
import {KubernetesApiService} from "../command-line/services/kubernetes-api.service";
import {ExceptionBlockService} from "../command-line/services/exception-block.service";
import { GatekeeperModule } from '../gatekeeper/gatekeeper.module';

@Global()
@Module({
  controllers: [
    ClusterController,
  ],
  exports: [
    ClusterDao,
    ClusterService,
    ExceptionBlockService,
    KubernetesClusterService,
    KubernetesApiService,
  ],
  imports: [
    GatekeeperModule,
  ],
  providers: [
    ClusterDao,
    ClusterService,
    ExceptionBlockService,
    KubernetesClusterService,
    KubernetesApiService,
  ],
})
export class ClusterModule {}
