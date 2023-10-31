import {Injectable} from '@nestjs/common';
import {Content} from 'pdfmake/interfaces';
import {SecurityAuditReportPdfHelpersService} from './security-audit-report-pdf-helpers.service';
import {SecurityAuditReportCluster} from '../interfaces/security-audit-report-cluster';
import {SecurityAuditReportTools} from '../enums/security-audit-report-tools';
import {ClusterObjectSummary} from '../../cluster/dto/cluster-object-summary';
import {SecurityAuditToolServiceFactory} from './security-audit-tool-service.factory';

@Injectable()
export class SecurityAuditClusterService {
  constructor(
    protected readonly pdfHelpers: SecurityAuditReportPdfHelpersService,
    protected readonly SecurityAuditToolServiceFactory: SecurityAuditToolServiceFactory
  ) {}

  async getClusterReportData(cluster: ClusterObjectSummary, tools: SecurityAuditReportTools[]): Promise<SecurityAuditReportCluster> {
    const report: SecurityAuditReportCluster = {
      id: cluster.id,
      name: cluster.name,
      toolResults: {}
    };
    for (const tool of tools) {
      const service = this.SecurityAuditToolServiceFactory.getTool(tool);
      report.toolResults[tool] = await service.buildClusterContent(cluster);
    }
    return report;
  }

  buildClusterSummary(cluster: SecurityAuditReportCluster, tools: SecurityAuditReportTools[]): Content[] {
    return [
      this.pdfHelpers.buildHeader(`Cluster ${cluster.name}`, { pageBreak: 'before' }),
      tools.map(tool => {
        return cluster.toolResults[tool].content
      })
    ];
  }
}