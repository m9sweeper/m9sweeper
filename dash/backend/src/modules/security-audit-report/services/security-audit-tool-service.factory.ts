import {Injectable} from '@nestjs/common';
import {IAuditReportSectionService} from '../interfaces/IAuditReportSectionService';
import {SecurityAuditTrivyService} from './security-audit-trivy.service';
import {SecurityAuditReportTools} from '../enums/security-audit-report-tools';

@Injectable()
export class SecurityAuditToolServiceFactory {
  constructor(
    protected readonly trivyToolService: SecurityAuditTrivyService
  ) {}

  getTool(tool: SecurityAuditReportTools): IAuditReportSectionService {
    switch (tool) {
      case SecurityAuditReportTools.TRIVY:
        return this.trivyToolService;
    }
  }

}