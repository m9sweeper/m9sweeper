import { Global, Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { ReportsDao } from './dao/reports.dao';

@Global()
@Module({
    providers: [ReportsService, ReportsDao],
    exports: [
        ReportsService,
        ReportsDao,
    ],
    controllers: [ReportsController]
})

export class ReportsModule {}
