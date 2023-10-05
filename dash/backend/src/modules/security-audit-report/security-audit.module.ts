import { Global, Module } from '@nestjs/common';
import {PrintableAuditReportService} from './services/printable-audit-report.service';

@Global()
@Module({
  providers: [ PrintableAuditReportService],
  exports: [
    PrintableAuditReportService
  ],
  controllers: []
})
export class SecurityAuditModule {}
