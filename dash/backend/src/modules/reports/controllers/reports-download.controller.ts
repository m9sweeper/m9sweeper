import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {Controller, Get, Query, Res, UseGuards} from '@nestjs/common';
import {ReportsService} from '../services/reports.service';
import {SecurityAuditReportService} from '../../security-audit-report/services/security-audit-report.service';
import {AllowedAuthorityLevels} from '../../../decorators/allowed-authority-levels.decorator';
import {Authority} from '../../user/enum/Authority';
import {AuthGuard} from '../../../guards/auth.guard';
import {AuthorityGuard} from '../../../guards/authority.guard';
import {Response} from 'express';
import {SecurityAuditReportTools} from '../../security-audit-report/enums/security-audit-report-tools';

@ApiTags('Reports')
@Controller()
@ApiBearerAuth('jwt-auth')
/** Doesn't include the response transformer interceptor to allow streaming files */
export class ReportsDownloadController {
  constructor(
    private readonly reportsService: ReportsService,
    protected readonly printableAuditReportService: SecurityAuditReportService
  ) {}

  @Get('/security-audit-report')
  @AllowedAuthorityLevels(Authority.ADMIN, Authority.SUPER_ADMIN)
  @UseGuards(AuthGuard, AuthorityGuard)
  async generatePrintableAuditReport(
    @Res({ passthrough: true }) res: Response,
    @Query('namespaces') namespaces?: string[],
    @Query('clusterIds') clusterIds?: number[],
    @Query('tools') tools?: SecurityAuditReportTools[],
  ) {
    const pdfStream = await this.printableAuditReportService.generate({ namespaces, clusterIds, tools });
    res.set({
      'Content-Type': 'application/pdf',
      'Transfer-Encoding': 'chunked',
      'Connection': 'keep-alive'
    });

    pdfStream.pipe(res);
    pdfStream.end();

    // This promise doesn't resolve until the pdf finishes streaming.
    // This prevents nestjs from closing the response stream early & erroring out the application
    // by trying to write to a closed stream.
    return new Promise(resolve => pdfStream.on('end', resolve));
  }
}