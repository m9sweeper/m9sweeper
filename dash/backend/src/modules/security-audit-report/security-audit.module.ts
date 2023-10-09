import { Global, Module } from '@nestjs/common';
import {SecurityAuditReportService} from './services/security-audit-report.service';

@Global()
@Module({
  providers: [ SecurityAuditReportService],
  exports: [
    SecurityAuditReportService
  ],
  controllers: []
})
export class SecurityAuditModule {}
