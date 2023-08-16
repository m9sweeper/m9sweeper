import {Global, Module} from '@nestjs/common';
import { ClusterDao } from './dao/cluster.dao';
import { ClusterController } from './controllers/cluster.controller';
import {ClusterService} from './services/cluster.service';
import { KubernetesClusterService } from '../command-line/services/kubernetes-cluster.service';
import {KubernetesApiService} from "../command-line/services/kubernetes-api.service";
import {ExceptionBlockService} from "../command-line/services/exception-block.service";

@Global()
@Module({
  providers: [
    ClusterDao,
    ClusterService,
    ExceptionBlockService,
    KubernetesClusterService,
    KubernetesApiService,
  ],
  exports: [
    ClusterDao,
    ClusterService,
    ExceptionBlockService,
    KubernetesClusterService,
    KubernetesApiService,
  ],
  controllers: [
    ClusterController,
  ],
})
export class ClusterModule {}
