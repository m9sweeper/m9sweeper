import { Global, Module } from '@nestjs/common';
import { ClusterGroupDao } from './dao/cluster-group-dao';
import { ClusterGroupService } from './services/cluster-group-service';
import { ClusterGroupController } from './controllers/cluster-group.controller';

@Global()
@Module({
    providers: [ClusterGroupDao, ClusterGroupService],
    exports: [
        ClusterGroupDao,
        ClusterGroupService
    ],
    controllers: [ClusterGroupController]
})

export class ClusterGroupModule {}
