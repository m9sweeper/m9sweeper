import { Global, Module } from '@nestjs/common';
import { ClusterEventDao } from './dao/cluster-event.dao';
import { ClusterEventController } from './controllers/cluster-event.controller';
import { ClusterEventService } from './services/cluster-event.service';

@Global()
@Module({
    providers: [ClusterEventDao, ClusterEventService],
    exports: [
        ClusterEventDao,
        ClusterEventService
    ],
    controllers: [ClusterEventController]
})

export class ClusterEventModule {}
