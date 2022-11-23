import { Global, Module } from '@nestjs/common';
import { DeploymentDao } from './dao/deployment.dao';
import { DeploymentController } from './controllers/deployment.controller';
import { DeploymentService } from './services/deployment.service';

@Global()
@Module({
    providers: [DeploymentDao, DeploymentService],
    exports: [
        DeploymentDao,
        DeploymentService
    ],
    controllers: [DeploymentController]
})

export class DeploymentModule {}
