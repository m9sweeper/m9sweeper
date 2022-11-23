import { Global, Module } from '@nestjs/common';
import { ImageScanResultsIssueDao } from './dao/image-scan-results-issue.dao';
import { ImageScanResultsIssueController } from './controllers/image-scan-results-issue.controller';
import { ImageScanResultsIssueService } from './services/image-scan-results.service';

@Global()
@Module({
    providers: [ImageScanResultsIssueDao, ImageScanResultsIssueService],
    exports: [
        ImageScanResultsIssueDao,
        ImageScanResultsIssueService
    ],
    controllers: [ImageScanResultsIssueController]
})
export class ImageScanResultsIssueModule {}
