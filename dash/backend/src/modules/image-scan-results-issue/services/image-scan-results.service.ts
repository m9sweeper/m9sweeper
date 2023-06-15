import { Injectable } from '@nestjs/common';
import { ImageScanResultsIssueDto } from '../dto/image-scan-results-issue-dto';
import { ImageScanResultsIssueDao } from '../dao/image-scan-results-issue.dao';
import {CsvService} from '../../shared/services/csv.service';
import {ReportsCsvDto} from '../../reports/dto/reports-csv-dto';
import {format} from 'date-fns';
import {UtilitiesService} from '../../shared/services/utilities.service';

@Injectable()
export class ImageScanResultsIssueService {
    constructor(
      private readonly imageScanResultsIssueDao: ImageScanResultsIssueDao,
      protected readonly csvService: CsvService,
      protected readonly utilityService: UtilitiesService
                 ){}
    async getImageScanResultsIssuesByImageResultsId(id: number,
                                                    all: number,
                                                    page  = 0,
                                                    limit  = 10,
                                                    sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'},
                                                    options?: {
                                                        scanDate?: number,
                                                        policyId?: number
                                                    }
                                                    ):
        Promise<{totalCount: number, list:ImageScanResultsIssueDto[]}> {
        let list: ImageScanResultsIssueDto[] ;
        let totalCount: number;
        if(all === 1 && options?.scanDate){
            list = await this.imageScanResultsIssueDao.getAllImageScanResultsFilteredByScanDate(id, options.scanDate, sort);
            totalCount = await this.imageScanResultsIssueDao.getCountOfImageScanResultsIssuesByImageIdFilteredByDate(id, options.scanDate);
        } else {
            list = await this.imageScanResultsIssueDao.getImageScanResultsIssuesByImageResultsId(id, page, limit, sort, options?.policyId);
            totalCount = await this.imageScanResultsIssueDao.getCountOfImageScanResultsIssues(id, options?.policyId);
        }
        return {
            totalCount: +totalCount,
            list: list
        }
    }

    async buildImageScanResultsIssuesCsv(imageName: string,
                                         id: number,
                                         all: number,
                                         scanDate: number,
                                         policyId: number,
                                         sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'},
    ):
      Promise<ReportsCsvDto> {
        const headers = ['Package', 'Compliant', 'Severity', 'Title', 'Type', 'AVD Link', 'Scanner', 'Installed', 'Fixed Version'];
        const lines = [this.csvService.buildLine(headers)];

        const limit = 50;
        let seen = 0;
        let page = 0;
        let more = true;
        while (more) {
            const issueBatch = await this.getImageScanResultsIssuesByImageResultsId(id, all, page, limit, sort, { scanDate, policyId });
            for (const issue of issueBatch.list) {
                lines.push(this.csvService.buildLine([
                  issue.packageName || 'N/A',
                  issue.isCompliant ? 'Yes' : 'No',
                  issue.severity,
                  issue.name,
                  issue.type,
                  issue.vulnerabilityDescUrl,
                  issue.scannerName,
                  issue.installedVersion || 'N/A',
                  issue.fixedVersion
                ]));
            }
            page++;
            seen += limit;
            more = issueBatch.totalCount > seen;
        }

        // Add scan date and file gerneation stamps at end.
        // 'P ppp' format is: mm/dd/yyyy h:mm:ss GMT-X
        const prettyScanDate = format(scanDate, 'P ppp');
        const prettyDate = format(Date.now(), 'P ppp');
        lines.push('', `Scanned ${prettyScanDate}`, `Generated: ${prettyDate}`);

        const csv =  lines.join('\n');

        const filenameDateSuffix = format(scanDate, 'yyyy-MM-dd');
        const filename = this.utilityService.cleanFileName(`${imageName}_${filenameDateSuffix}.csv`);

        return { filename, csv };
    }

    async getAllImageScanResults(imageId: number, page: number, limit: number): Promise<ImageScanResultsIssueDto[]> {
        const eventLimit = isNaN(limit) || limit <= 0 ? 10 : limit;
        const eventPage = isNaN(page) ? 0 : page;
        const offset = eventLimit * eventPage;
        return await this.imageScanResultsIssueDao.getAllImageScanResults(imageId, eventLimit, offset);
    }
    async getCountOfImageScanResultsIssues(imageResultsId: number, imageId: number): Promise<any> {
        const totalImageScanResultsIssues = await this.imageScanResultsIssueDao.getCountOfImageScanResultsIssues(imageResultsId);
        return totalImageScanResultsIssues[0].count;
    }
}
