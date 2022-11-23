import {
    BadRequestException,
    Controller,
    Get,
    Header,
    Inject,
    Query,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator';
import { Authority } from '../../user/enum/Authority';
import { ReportsService } from '../services/reports.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { AuthGuard } from '../../../guards/auth.guard';
import { AuthorityGuard } from '../../../guards/authority.guard';
import { VulnerabilitySeverity } from '../../shared/enums/vulnerability-severity';
import { EnsureArrayTyping } from '../../shared/utilities/ensure-array-typing';
import {format} from 'date-fns'

@ApiTags('Reports')
@Controller()
@ApiBearerAuth('jwt-auth')
@UseInterceptors(ResponseTransformerInterceptor)
export class ReportsController {
    constructor(
        @Inject('LOGGED_IN_USER')
        private readonly _loggedInUser: UserProfileDto,
        private readonly reportsService: ReportsService,
    ) {}

    @Get('/vulnerability-export')
    @AllowedAuthorityLevels(Authority.ADMIN, Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getVulnerabilityExport(
        @Query('limit') limit: number,
        @Query('cluster-id') clusterId?: number,
        @Query('namespaces') namespaces?: Array<string>,
        @Query('severity') severityLevels?: Array<VulnerabilitySeverity>,
        @Query('fix-available') fixAvailable?: string,
        @Query('date') targetDate?: string,
    ) {
        if (!limit || limit < 1 || limit > 100) {
            throw new BadRequestException();
        }
        return this.reportsService.getVulnerabilityExport(limit, clusterId, namespaces,
            severityLevels, fixAvailable, targetDate);
    }

    @Get('/vulnerability-export/download')
    @AllowedAuthorityLevels(Authority.ADMIN, Authority.SUPER_ADMIN)
    @Header('Content-Type', 'text/csv')
    @UseGuards(AuthGuard, AuthorityGuard)
    async downloadVulnerabilityExport(
        @Query('cluster-id') clusterId?: number,
        @Query('namespaces') namespaces?: Array<string>,
        @Query('severity') severityLevels?: Array<VulnerabilitySeverity>,
        @Query('fix-available') fixAvailable?: string,
        @Query('date') targetDate?: string,
    ) {
        return this.reportsService.getVulnerabilityExportCsv(clusterId, namespaces,
            severityLevels, fixAvailable, targetDate);
    }

    @Get('/running-vulnerabilities')
    @AllowedAuthorityLevels(Authority.ADMIN, Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getRunningVulnerabilities(
        @Query('limit') limit: number,
        @Query('cluster-id') clusterId?: number,
        @Query('namespaces') namespaces?: Array<string>,
        @Query('date') date?: string,
        @Query('compliant') isCompliant?: string,
    ) {
        if (!limit || limit < 1 || limit > 100) {
            throw new BadRequestException();
        }
        return this.reportsService.getRunningVulnerabilities(limit, clusterId, namespaces, isCompliant, date);
    }

    @Get('/running-vulnerabilities/download')
    @AllowedAuthorityLevels(Authority.ADMIN, Authority.SUPER_ADMIN)
    @Header('Content-Type', 'text/csv')
    @UseGuards(AuthGuard, AuthorityGuard)
    async downloadRunningVulnerabilitiesReport(
        @Query('cluster-id') clusterId: number,
        @Query('namespaces') namespaces?: Array<string>,
        @Query('date') date?: string,
        @Query('compliant') isCompliant?: string,
    ) {
        return await this.reportsService.getRunningVulnerabilitiesCsv(clusterId, date, namespaces, isCompliant);
    }

    @Get('/historical-vulnerabilities')
    @AllowedAuthorityLevels(Authority.ADMIN, Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getHistoricalVulnerabilities(
        @Query('limit') limit: number,
        @Query('cluster-id') clusterId?: number,
        @Query('namespaces') namespaces?: Array<string>,
        @Query('start-date') startDate?: string,
        @Query('end-date') endDate?: string,
    ) {
        if (!limit || limit < 1 || limit > 100) {
            throw new BadRequestException();
        }
        if (!startDate) {
            const date28DaysAgo = new Date();
            date28DaysAgo.setDate(date28DaysAgo.getDate() - 28);
            startDate = format(date28DaysAgo, 'yyyy-MM-dd');
        }
        if(!endDate) {
            endDate = format(new Date(), 'yyyy-MM-dd')
        }
        return await this.reportsService.getHistoricalVulnerabilities(limit, clusterId, namespaces, startDate, endDate);
    }

    @Get('/worst-images')
    @AllowedAuthorityLevels(Authority.ADMIN, Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getWorstImages(
        @Query('cluster-id') clusterId?: number,
        @Query('start-date') startDate?: string,
        @Query('end-date') endDate?: string,
        @Query('namespaces') namespaces?: Array<string>
    ) {
        namespaces = EnsureArrayTyping.ensureArrayTyping(namespaces);
        return this.reportsService.getWorstImages(clusterId, startDate, endDate, namespaces);
    }

    @Get('/historical-vulnerabilities/download')
    @AllowedAuthorityLevels(Authority.ADMIN, Authority.SUPER_ADMIN)
    @Header('Content-Type', 'text/csv')
    @UseGuards(AuthGuard, AuthorityGuard)
    async downloadHistoricalVulnerabilitiesReport(
        @Query('limit') limit: number,
        @Query('cluster-id') clusterId: number,
        @Query('namespaces') namespaces?: Array<string>,
        @Query('start-date') startDate?: string,
        @Query('end-date') endDate?: string,
    ) {
        if (!startDate) {
            const date28DaysAgo = new Date();
            date28DaysAgo.setDate(date28DaysAgo.getDate() - 28);
            startDate = format(date28DaysAgo, 'yyyy-MM-dd');
        }
        if(!endDate) {
            endDate = format(new Date(), 'yyyy-MM-dd')
        }
        return await this.reportsService.getHistoricalVulnerabilitiesCsv(clusterId, limit, startDate, endDate, namespaces);
    }

    @Get('/vulnerability-difference')
    @AllowedAuthorityLevels(Authority.ADMIN, Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getVulnerabilityDifferences(
        @Query('cluster-id') clusterId: number,
        @Query('start-date') startDate: string,
        @Query('end-date') endDate: string,
        @Query('limit') limit: number,
        @Query('namespaces') namespaces?: Array<string>,
        @Query('fix-available') fixAvailable?: string,
        @Query('severity') severity?: Array<VulnerabilitySeverity>,
    ) {
        if (!startDate || !endDate) {
            throw new BadRequestException('Must specify a start and end date');
        }
        if (!limit || limit > 100) {
            throw new BadRequestException('Must specify a limit of 100 or fewer items');
        }
        namespaces = EnsureArrayTyping.ensureArrayTyping(namespaces);
        return this.reportsService.getVulnerabilityDifferenceByDate(clusterId, startDate, endDate,
            {namespaces, fixAvailable, severity, limit});
    }

    @Get('/vulnerability-difference/download')
    @AllowedAuthorityLevels(Authority.ADMIN, Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async downloadVulnerabilityDifferences(
        @Query('cluster-id') clusterId: number,
        @Query('start-date') startDate: string,
        @Query('end-date') endDate: string,
        @Query('namespaces') namespaces?: Array<string>,
        @Query('fix-available') fixAvailable?: string,
        @Query('severity') severity?: Array<VulnerabilitySeverity>,
    ) {
        if (!startDate || !endDate) {
            throw new BadRequestException('Must specify a start and end date');
        }
        namespaces = EnsureArrayTyping.ensureArrayTyping(namespaces);
        return this.reportsService.getVulnerabilityDifferenceByDateCsv(clusterId, startDate, endDate,
            {namespaces, fixAvailable, severity});
    }
}
