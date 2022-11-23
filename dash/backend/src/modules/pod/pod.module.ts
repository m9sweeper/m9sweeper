import { Global, Module } from '@nestjs/common';
import { PodDao } from './dao/pod.dao';
import { PodController } from './controllers/pod.controller';
import { PodService } from './services/pod.service';
import { PodComplianceService } from './services/pod-compliance.service';

@Global()
@Module({
    providers: [PodDao, PodService, PodComplianceService],
    exports: [
        PodDao,
        PodService,
        PodComplianceService
    ],
    controllers: [PodController]
})

export class PodModule {}
