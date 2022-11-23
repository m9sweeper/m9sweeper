import { Injectable } from '@nestjs/common';
import { ImageScanResultsIssueDto } from '../dto/image-scan-results-issue-dto';
import { ImageScanResultsIssueDao } from '../dao/image-scan-results-issue.dao';

@Injectable()
export class ImageScanResultsIssueService {
    constructor( private readonly imageScanResultsIssueDao: ImageScanResultsIssueDao ){}
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
