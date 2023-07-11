import { Injectable } from '@nestjs/common';
import { ReportsDao } from '../dao/reports.dao';
import { VulnerabilitySeverity } from '../../shared/enums/vulnerability-severity';
import { ReportsVulnerabilityExportPreviewDto } from '../dto/reports-vulnerability-export-preview-dto';
import { format } from 'date-fns';
import { CsvService } from '../../shared/services/csv.service';
import {
    ReportsHistoricalVulnerabilitiesPreviewDto,
    ReportsRunningVulnerabilitiesPreviewDto
} from '../dto/reports-running-vulnerabilities-preview-dto';
import {ReportsWorstImagesDto} from '../dto/reports-worst-images-dto';
import {ReportsDifferenceByDateDto} from '../dto/reports-difference-by-date-dto';
import {ReportsCsvDto} from '../dto/reports-csv-dto';
import { ReportsRunningVulnerabilitiesSummaryDto } from '../dto/reports-running-vulnerabilities-summary-dto';


@Injectable()
export class ReportsService {
    constructor(
        private readonly reportsDao: ReportsDao,
        private readonly csvService: CsvService,
    ) {}

    async getVulnerabilityExport(limit: number, clusterId?: number, namespaces?: Array<string>,
                                 severityLevels?: Array<VulnerabilitySeverity>, fixAvailable?: string, targetDate?: string)
        : Promise<ReportsVulnerabilityExportPreviewDto>
    {
        if (targetDate && targetDate !== format(new Date(), 'yyyy-MM-dd')) {
            return this.reportsDao.getHistoricalVulnerabilityExport(targetDate, clusterId, namespaces,
                severityLevels, fixAvailable, limit)
        } else {
            return this.reportsDao.getVulnerabilityExport(clusterId, namespaces, severityLevels,
                fixAvailable, limit);
        }
    }

    async getVulnerabilityExportCsv(clusterId?: number, namespaces?: Array<string>,
                                    severityLevels?: Array<VulnerabilitySeverity>, fixAvailable?: string, targetDate?: string)
        : Promise<ReportsCsvDto>
    {
        let queryResponse;
        if (targetDate && targetDate !== format(new Date(), 'yyyy-MM-dd')) {
            queryResponse = await this.reportsDao.getHistoricalVulnerabilityExport(targetDate, clusterId, namespaces, severityLevels, fixAvailable);
        } else {
            queryResponse = await this.reportsDao.getVulnerabilityExport(clusterId, namespaces, severityLevels, fixAvailable);
        }

        const result = ['Image,Image ID,Namespaces,Scanner Name,CVE,Package,Is Fixable?,Running?,Severity'];

        for (let i = 0; i < queryResponse.results.length; i++) {
            const vuln = queryResponse.results[i];

            result.push(this.csvService.buildLine([
                vuln.image,
                vuln.imageId.toString(),
                vuln.namespaces.join(','),
                vuln.scannerName,
                vuln.type,
                vuln.data.PkgName ? vuln.data.PkgName : 'n/a',
                vuln.isFixable.toString(),
                vuln.runningInCluster.toString(),
                vuln.severity
            ]));
        }

        return {
            filename: `Vulnerability-Export-${targetDate ? targetDate : format(new Date(), 'yyyy-MM-dd')}.csv`,
            csv: result.join('\n')
        }
    }

    async getRunningVulnerabilities(limit: number, clusterId?: number, namespaces?: Array<string>,
      isCompliant?: string, date?: string, page?: string)
      : Promise<ReportsRunningVulnerabilitiesPreviewDto>
    {
        return this.getRunningVulnerabilitiesNoRequirements(clusterId, limit, namespaces, isCompliant, date, page);
    }

    async getRunningVulnerabilitiesNoRequirements(
      clusterId?: number,
      limit?: number,
      namespaces?: Array<string>,
      isCompliant?: string,
      date?: string,
      page?: string,
    ): Promise<ReportsRunningVulnerabilitiesPreviewDto> {
        let pageAsNum = 0;
        if (page) {
            pageAsNum = parseInt(page);
        }
        if (date && date !== format(new Date(), 'yyyy-MM-dd')) {
            return this.reportsDao.getHistoricalRunningVulnerabilities(
              clusterId, date, {limit, namespaces, isCompliant, page: pageAsNum }
            );
        } else {
            return this.reportsDao.getRunningVulnerabilities(clusterId, {namespaces, limit, isCompliant, page: pageAsNum });
        }
    }

    async getRunningVulnerabilitiesCsv(clusterId: number, date?: string, namespaces?: Array<string>, isCompliant?: string)
        : Promise<ReportsCsvDto> {

        let queryResponse;
        if (date && date != format(new Date(), 'yyyy-MM-dd')) {
            queryResponse = await this.reportsDao.getHistoricalRunningVulnerabilities(clusterId, date, {namespaces, isCompliant});
        } else {
            queryResponse = await this.reportsDao.getRunningVulnerabilities(clusterId, {namespaces, isCompliant});
        }
        const result = [this.csvService.buildLine(['Image', 'Namespace(s)', 'Compliance', 'Date Scanned', 'Critical Issues', 'Major Issues',
            'Medium Issues', 'Low Issues', 'Negligible Issues', 'Critical Fixable Issues', 'Major Fixable Issues', 'Medium Fixable Issues',
            'Low Fixable Issues', 'Negligible Fixable Issues'])];

        for (let i = 0; i < queryResponse.results.length; i++) {
            const vuln = queryResponse.results[i];
            result.push(this.csvService.buildLine([
                vuln.image,
                vuln.namespaces.join(','),
                vuln.scanResults,
                vuln.lastScanned,
                String(vuln.totalCritical),
                String(vuln.totalMajor),
                String(vuln.totalMedium),
                String(vuln.totalLow),
                String(vuln.totalNegligible),
                String(vuln.totalFixableCritical),
                String(vuln.totalFixableMajor),
                String(vuln.totalFixableMedium),
                String(vuln.totalFixableLow),
                String(vuln.totalFixableNegligible)
            ]));
        }

        return {
            filename: `Running-Vulnerabilities-${format(new Date(), 'yyyy-MM-dd-hh-mm-ss')}.csv`,
            csv: result.join('\n')
        }
    }

    async getRunningVulnerabilitiesSummary(
      clusterId: number,
      options?: {namespaces?: Array<string>, limit?: number, isCompliant?: string},
    ): Promise<ReportsRunningVulnerabilitiesSummaryDto> {
        return await this.reportsDao.getRunningVulnerabilitiesSummary(clusterId, options);
    }

    async getHistoricalVulnerabilities(limit: number, clusterId?: number, namespaces?: Array<string>, startDate?: string, endDate?: string)
        : Promise<ReportsHistoricalVulnerabilitiesPreviewDto>
    {
        const report = await this.reportsDao.getHistoricalVulnerabilities(clusterId, limit, namespaces, startDate, endDate);
        for(let i = 0; i < report.results.length; i++) {
            report.results[i].savedDate = report.results[i].savedDate.toISOString().split('T')[0];
        }
        return report;
    }

    async getHistoricalVulnerabilitiesCsv(clusterId: number, limit: number, startDate: string, endDate: string, namespaces?: Array<string>)
        : Promise<ReportsCsvDto> {
        const queryResponse = await this.reportsDao.getHistoricalVulnerabilities(clusterId, limit, namespaces, startDate, endDate);
        const result = [this.csvService.buildLine(['Date Scanned', 'Critical Issues', 'Major Issues',
            'Medium Issues', 'Low Issues', 'Negligible Issues', 'Critical Fixable Issues', 'Major Fixable Issues', 'Medium Fixable Issues',
            'Low Fixable Issues', 'Negligible Fixable Issues'])];

        for (let i = 0; i < queryResponse.results.length; i++) {
            const vuln = queryResponse.results[i];
            result.push(this.csvService.buildLine([
                String(format(vuln.savedDate, 'yyyy-MM-dd')),
                String(vuln.totalCritical),
                String(vuln.totalMajor),
                String(vuln.totalMedium),
                String(vuln.totalLow),
                String(vuln.totalNegligible),
                String(vuln.totalFixableCritical),
                String(vuln.totalFixableMajor),
                String(vuln.totalFixableMedium),
                String(vuln.totalFixableLow),
                String(vuln.totalFixableNegligible)
            ]));
        }

        return {
            filename: `Historical-Vulnerabilities-${format(new Date(), 'yyyy-MM-dd-hh-mm-ss')}.csv`,
            csv: result.join('\n')
        }
    }

    async getWorstImages(clusterId: number, startDate?: string, endDate?: string, namespaces?: Array<string>)
        : Promise<ReportsWorstImagesDto[]>
    {
        return this.reportsDao.getWorstImages(clusterId, startDate, endDate, namespaces);
    }

    async getVulnerabilityDifferenceByDate(clusterId: number, startDate: string, endDate: string,
                                           options?: {namespaces?: Array<string>,
                                               severity?: Array<VulnerabilitySeverity>, fixAvailable?: string,
                                               limit?: number})
    : Promise<ReportsDifferenceByDateDto>
    {
        return this.reportsDao.getDifferencesInVulnerabilities(startDate, endDate, clusterId, options?.namespaces,
            options?.severity, options?.fixAvailable, options?.limit);
    }

    async getVulnerabilityDifferenceByDateCsv(clusterId: number, startDate: string, endDate: string,
                                              options?: {namespaces?: Array<string>,
                                                  severity?: Array<VulnerabilitySeverity>, fixAvailable?: string})
    : Promise<ReportsCsvDto>
    {
        const queryResponse = await this.reportsDao.getDifferencesInVulnerabilities(startDate, endDate, clusterId,
            options?.namespaces, options?.severity, options?.fixAvailable);

        const result = ['Status,Image,Image ID,Namespaces,Scanner Name,CVE,Is Fixable?,Running?,Severity'];

        for (const vuln of queryResponse.newVulnerabilities) {
            result.push(this.csvService.buildLine([
                'New',
                vuln.image,
                vuln.imageId.toString(),
                vuln.namespaces.join(','),
                vuln.scannerName,
                vuln.type,
                vuln.isFixable.toString(),
                vuln.runningInCluster.toString(),
                vuln.severity
            ]));
        }

        for (const vuln of queryResponse.fixedVulnerabilities) {
            result.push(this.csvService.buildLine([
                'Fixed',
                vuln.image,
                vuln.imageId.toString(),
                vuln.namespaces.join(','),
                vuln.scannerName,
                vuln.type,
                vuln.isFixable.toString(),
                vuln.runningInCluster.toString(),
                vuln.severity
            ]));
        }
        return {
            filename: `Vulnerability-Difference-${startDate}-to-${endDate}.csv`,
            csv: result.join('\n')
        }
    }
}
