import { Global, Module } from '@nestjs/common';
import { ClusterValidationService } from "./services/cluster-validation.service";
import { ClusterValidationController } from './controllers/cluster-validation.controller';

@Global()
@Module({
    providers: [ClusterValidationService],
    exports: [ClusterValidationService],
    controllers: [ClusterValidationController]
})
export class ClusterValidationModule {}
