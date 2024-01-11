import { Global, Module } from '@nestjs/common';
import {SecurityAuditReportService} from './services/security-audit-report.service';
import {SecurityAuditReportPdfHelpersService} from './services/security-audit-report-pdf-helpers.service';
import {SecurityAuditTrivyService} from './services/security-audit-trivy.service';
import {SecurityAuditClusterService} from './services/security-audit-cluster.service';
import {SecurityAuditToolServiceFactory} from './services/security-audit-tool-service.factory';
import {SecurityAuditKubesecService} from './services/security-audit-kubesec.service';
import {SecurityAuditKubehunterService} from './services/security-audit-kubehunter.service';
import {SecurityAuditKubeBenchService} from './services/security-audit-kube-bench.service';

@Global()
@Module({
  providers: [
    SecurityAuditReportService,
    SecurityAuditReportPdfHelpersService,
    SecurityAuditClusterService,
    SecurityAuditTrivyService,
    SecurityAuditToolServiceFactory,
    SecurityAuditKubesecService,
    SecurityAuditKubehunterService,
    SecurityAuditKubeBenchService,
  ],
  exports: [
    SecurityAuditReportService,
    SecurityAuditReportPdfHelpersService,
    SecurityAuditClusterService,
    SecurityAuditTrivyService,
    SecurityAuditToolServiceFactory,
    SecurityAuditKubesecService,
    SecurityAuditKubehunterService,
    SecurityAuditKubeBenchService,
  ],
  controllers: []
})
export class SecurityAuditModule {}
