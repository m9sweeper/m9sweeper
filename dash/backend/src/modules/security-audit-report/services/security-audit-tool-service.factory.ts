import {Injectable} from '@nestjs/common';
import {IAuditReportSectionService} from '../interfaces/IAuditReportSectionService';
import {SecurityAuditTrivyService} from './security-audit-trivy.service';
import {SecurityAuditReportTools} from '../enums/security-audit-report-tools';
import {SecurityAuditKubesecService} from './security-audit-kubesec.service';
import {SecurityAuditKubehunterService} from './security-audit-kubehunter.service';
import {SecurityAuditKubeBenchService} from './security-audit-kube-bench.service';

@Injectable()
export class SecurityAuditToolServiceFactory {
  constructor(
    protected readonly trivyToolService: SecurityAuditTrivyService,
    protected readonly kubesecToolService: SecurityAuditKubesecService,
    protected readonly kubehunterToolService: SecurityAuditKubehunterService,
    protected readonly kubebenchToolService: SecurityAuditKubeBenchService,
  ) {}

  getTool(tool: SecurityAuditReportTools): IAuditReportSectionService {
    switch (tool) {
      case SecurityAuditReportTools.TRIVY:
        return this.trivyToolService;
      case SecurityAuditReportTools.KUBESEC:
        return this.kubesecToolService;
      case SecurityAuditReportTools.KUBEHUNTER:
        return this.kubehunterToolService;
      case SecurityAuditReportTools.KUBEBENCH:
        return this.kubebenchToolService;
    }
  }

}