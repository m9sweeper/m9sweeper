import {
    Controller,
    Get,
    Inject,
    Param, Query, UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IMAGE_SCAN_RESULTS_ISSUE_RESPONSE_SCHEMA } from '../open-api-schema/image-scan-results-issue-schema';
import { ImageScanResultsIssueDto } from '../dto/image-scan-results-issue-dto';
import { ImageScanResultsIssueService } from '../services/image-scan-results.service';
import {AllowedAuthorityLevels} from '../../../decorators/allowed-authority-levels.decorator';
import {Authority} from '../../user/enum/Authority';
import {AuthGuard} from '../../../guards/auth.guard';
import {AuthorityGuard} from '../../../guards/authority.guard';
import {ReportsCsvDto} from '../../reports/dto/reports-csv-dto';
import {ImageService} from '../../image/services/image.service';


@ApiTags('ImageScanResultsIssues')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class ImageScanResultsIssueController {
    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly imageScanResultsIssueService: ImageScanResultsIssueService,
                protected readonly imageService: ImageService
    ){}

    @Get('/scan/issues/:imageResultsId')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: IMAGE_SCAN_RESULTS_ISSUE_RESPONSE_SCHEMA
    })
    async getImageScanResultsIssues(
        @Param('imageResultsId') imageScanResultsIssuesId: number,
        @Query('scanDate') scanDate: number,
        @Query('all') all: number,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('sort') sort: {field: string; direction: string; },
        @Query('policyId') policyId?: number
        ): Promise<{totalCount: number, list:ImageScanResultsIssueDto[]}> {
        return await this.imageScanResultsIssueService.getImageScanResultsIssuesByImageResultsId(imageScanResultsIssuesId,
            all, page, limit, sort, {scanDate, policyId});
    }

    @Get('/scan/issues/:imageResultsId/download')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: IMAGE_SCAN_RESULTS_ISSUE_RESPONSE_SCHEMA
    })
    async downloadImageScanResultsIssues(
      @Param('imageResultsId') imageScanResultsIssuesId: number,
      @Query('imageId') imageId: number,
      @Query('scanDate') scanDate: number,
      @Query('all') all: number,
      @Query('sort') sort: {field: string; direction: string; },
      @Query('policyId') policyId?: number
    ): Promise<ReportsCsvDto> {
        const image = await this.imageService.getImageById(imageId);
        const imageName = `${image?.name}:${image?.tag}`;
        return await this.imageScanResultsIssueService.buildImageScanResultsIssuesCsv(imageName, imageScanResultsIssuesId, all, scanDate, policyId, sort);
    }
}
