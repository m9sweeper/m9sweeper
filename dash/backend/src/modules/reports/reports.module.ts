import { Global, Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { ReportsDao } from './dao/reports.dao';
import {PrintableAuditReportService} from './services/printable-audit-report.service';

@Global()
@Module({
    providers: [PrintableAuditReportService, ReportsService, ReportsDao],
    exports: [
        PrintableAuditReportService,
        ReportsService,
        ReportsDao,
    ],
    controllers: [ReportsController]
})

export class ReportsModule {}
