import {
    BadRequestException, Body, Controller,
    Delete, Get, HttpException, HttpStatus, Param, Post, Put,
    Query, UseGuards, UseInterceptors
} from '@nestjs/common';
import {ApiBearerAuth, ApiQuery, ApiResponse, ApiSecurity, ApiTags} from '@nestjs/swagger';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { ImageService } from '../services/image.service';
import {
    ALL_IMAGES_RESPONSE_SCHEMA,
    CREATE_IMAGE_RESPONSE_SCHEMA,
    SEARCH_IMAGES_RESPONSE_SCHEMA,
    DELETE_IMAGE_RESPONSE_SCHEMA,
    SCAN_IMAGE_RESPONSE_SCHEMA,
    IMAGE_SCAN_RESULT_DETAILS_RESPONSE_SCHEMA,
    TOTAL_SEVERITY_RESPONSE_SCHEMA,
    TOTAL_VULNERABILITY_RESPONSE_SCHEMA,
    TOTAL_POLICY_VIOLATION, TOTAL_IMAGE_SCAN_COUNT_RESPONSE_SCHEMA,
    IMAGE_SCAN_QUEUE_STATUS_SCHEMA,
    ImageDetailsDto, ImageDetailsResponseDto, NAMESPACE_ID_SCHEMA
} from '../open-api-schema/images-schema';
import { ImageCreateDto } from '../dto/image-create.dto';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator'
import { AuthorityGuard } from '../../../guards/authority.guard';
import {AuthGuard} from '../../../guards/auth.guard';
import {Authority} from '../../user/enum/Authority';
import {ListOfImagesDto} from '../dto/image-result.dto';
import {ImageScanCreateDto} from '../dto/image-scan.create.dto';
import {ImageScanResultScannerDto} from '../dto/image-scan-result-scanner.dto';
import {ImageTrawlerResultDto, TrawlerScanResults} from '../dto/image-trawler-result.dto';
import {ImageScanResultSaveResponse, ImageScanResultDto} from '../open-api-schema/trawler-scan-schema';
import {IMAGES_SCAN_RESULTS_RESPONSE_SCHEMA} from '../open-api-schema/image-scan-results-schema';
import {
    ImageScanResultsDto,
    TotalSeverityResultsDto,
    TotalVulnerabilityResultsDto
} from '../dto/image-scan-results.dto';
import {UtilitiesService} from '../../shared/services/utilities.service';
import {plainToInstance} from 'class-transformer';
import {PolicyComplianceCheckerService} from '../../policy/services/policy-compliance-checker-service';
import {ImageScanCountDto} from '../dto/Image-scan-count.dto';
import {ImageDto} from "../dto/image-dto";
import { ImageComplianceFacadeService } from '../../policy/services/image-compliance-facade-service';
import { ImageScanResultPerPolicyFacadeDto } from '../../policy/dto/image-scan-results-perpolicy-dto';
import { EnsureArrayTyping } from '../../shared/utilities/ensure-array-typing';

@ApiTags('Images of cluster')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class ImageController {

    constructor(
      private readonly imageService: ImageService,
      private readonly policyComplianceCheckerService: PolicyComplianceCheckerService,
      private readonly utils: UtilitiesService,
      private readonly imageComplianceFacadeService: ImageComplianceFacadeService
    ) {}

    @Get(':clusterId/images')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_IMAGES_RESPONSE_SCHEMA
    })
    async getAllImagesByClusterId(@Param('clusterId') clusterId: number):
        Promise<{total: number, listOfImages: ListOfImagesDto[]}>{
        return await this.imageService.getAllImagesByClusterId(+clusterId);
    }

    @ApiTags('M9Sweeper')
    @ApiSecurity('x-auth-token')
    @Post(':clusterId/images')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN,Authority.TRAWLER)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiQuery({
        name: 'skipImageScan',
        schema: {
            type: 'boolean'
        }
    })
    @ApiResponse({
        status: 200,
        type: ImageDetailsResponseDto
    })
    async createImage(@Param('clusterId') clusterId: number, @Query('skipImageScan') skipImageScan: boolean, @Body() image: ImageCreateDto): Promise<ImageDetailsDto>{
        // console.log('skipImageScan: ', skipImageScan);
        return this.imageService.createImage(this.imageService.plaintToImage((image)), clusterId, skipImageScan);
    }

    @Get(':clusterId/images/search')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: SEARCH_IMAGES_RESPONSE_SCHEMA
    })
    async searchImageUnderClusterId(
        @Param('clusterId') clusterId: number,
        @Query('q') searchTerm: string,
        @Query('cve') cve: string,
        @Query('running') onlyRunning: boolean,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('sort') sort: {field: string; direction: string; }):
        Promise<{totalCount: number, list: ImageDto[]}> {
        return this.imageService.searchImageUnderClusterId(+clusterId, searchTerm, cve, onlyRunning, page, limit, sort);
    }

    @Get(':clusterId/images/by-pod')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_IMAGES_RESPONSE_SCHEMA,
    })
    async getImagesByPod(
      @Param('clusterId') clusterId: number,
      @Query('namespace') namespace: string,
      @Query('podName') podName: string,
      @Query('podId') podId: number,
      @Query('page') page?: number,
      @Query('limit') limit?: number,
      @Query('sort') sort?: {field: string; direction: string; },
    ): Promise<{total: number, listOfImages: ListOfImagesDto[]}> {
        if (!clusterId || !namespace || !(podName || podId)) {
            throw new BadRequestException('Please include the clusterId, namespace, and either the podName or podId in your request');
        }
        if (podId) {
            return await this.imageService.getAllRunningImagesByPodId(clusterId, namespace, podId, page, limit, sort);
        }
        return await this.imageService.getAllRunningImagesByPodName(clusterId, namespace, podName, page, limit, sort);
    }

    @Get(':clusterId/images/by-pod/history')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_IMAGES_RESPONSE_SCHEMA,
    })
    async getImagesByPodAndDate(
      @Param('clusterId') clusterId: number,
      @Query('namespace') namespace: string,
      @Query('podName') podName: string,
      @Query('podId') podId: number,
      @Query('startTime') startTime: string,
      @Query('endTime') endTime: string,
      @Query('page') page?: number,
      @Query('limit') limit?: number,
      @Query('sort') sort?: {field: string; direction: string; },
    ): Promise<{total: number, listOfImages: ListOfImagesDto[]}> {
        if (!clusterId || !namespace || !(podName || podId) || !startTime || !endTime) {
            throw new BadRequestException('Please include the clusterId, namespace, the start and end times, and either the podName or podId in your request');
        }
        if (podId) {
            return await this.imageService.getHistoricalImagesByPodIdAndDate(
              clusterId, namespace, podId,
              startTime, endTime,
              page, limit, sort
            );
        }
        return await this.imageService.getHistoricalImagesByPodNameAndDate(
          clusterId, namespace, podName,
          startTime, endTime,
          page, limit, sort
        );
    }

    @Get(':clusterId/images/:imageId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CREATE_IMAGE_RESPONSE_SCHEMA
    })
    async getImageById(
      @Param('clusterId') clusterId: number,
      @Param('imageId') imageId: number,
    ): Promise<ImageDto>{
        return await this.imageService.getImageByImageId(clusterId, imageId);
    }

    @ApiTags('M9Sweeper')
    @ApiSecurity('x-auth-token')
    @Get(':clusterId/image-by-docker-url')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.TRAWLER)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        type: ImageDetailsResponseDto
    })
    async getImageByDockerUrl(@Param('clusterId') clusterId: number,
                              @Query('dockerImageUrl') dockerImageUrl: string)
            : Promise<ImageDetailsDto>{
        const dockerParsedUrl = this.utils.parseDockerImageUrl(dockerImageUrl);
        const imageName = `${dockerParsedUrl.image.path !== '' ? dockerParsedUrl.image.path + '/' : ''}${dockerParsedUrl.image.name}`;
        const savedImageData: ImageDetailsDto = await this.imageService.getImageByImageName(clusterId, dockerParsedUrl.url, imageName, dockerParsedUrl.image.tag);
        if (savedImageData) {
            return savedImageData;
        } else {
            return plainToInstance(ImageDetailsDto, {
                url: dockerParsedUrl.url,
                name: imageName,
                tag: dockerParsedUrl.image.tag
            });
        }
    }

    @Put(':clusterId/images/:imageId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CREATE_IMAGE_RESPONSE_SCHEMA
    })
    async updateImageById(
        @Param('clusterId') clusterId: number,
        @Param('imageId') imageId: number,
        @Body() updateImageData: ImageCreateDto): Promise<ListOfImagesDto> {
        return await this.imageService.updateImageById(updateImageData, clusterId, imageId);
    }

    @Delete(':clusterId/images/:imageId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: DELETE_IMAGE_RESPONSE_SCHEMA
    })
    async deleteImageById(@Param('clusterId') clusterId: number, @Param('imageId') imageId: number): Promise<number>{
        return await this.imageService.deleteImageById(clusterId, imageId);
    }

    @Post(':clusterId/images/scan')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: SCAN_IMAGE_RESPONSE_SCHEMA
    })
    async createImageScanByImageId(@Param('clusterId') clusterId: number, @Body() imageScanDto: ImageScanCreateDto): Promise<boolean>{
        return await this.imageService.createImageScanByImageId(imageScanDto.imageIds.map(id => { return {id}; }), clusterId);
    }

    @Get(':clusterId/images/:imageId/scanners/:scannerId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: IMAGE_SCAN_RESULT_DETAILS_RESPONSE_SCHEMA
    })
    async getScanImageScannerDetails(
        @Param('clusterId') clusterId: number,@Param('imageId') imageId: number,
        @Param('scannerId') scannerId: number):
        Promise<ImageScanResultScannerDto>{
        return await this.imageService.getScanImageScannerDetails(clusterId, imageId, scannerId);
    }

    @ApiTags('M9Sweeper')
    @ApiSecurity('x-auth-token')
    @ApiResponse({
        status: 200,
        type: ImageScanResultSaveResponse
    })
    @Post(':clusterId/images/:imageId/trawler/scan/results/per-policy')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.TRAWLER)
    @UseGuards(AuthGuard, AuthorityGuard)
    async saveImageScanResultsPerPolicy(
        @Param('clusterId') clusterId: number,
        @Param('imageId') imageId: number,
        @Body() imageTrawlerResultDto: ImageTrawlerResultDto
        ):Promise<number[]>{
        const createdAt = new Date().getTime();
        return await this.imageService.saveImageScanDataByImageId(
          clusterId, imageId, imageTrawlerResultDto, createdAt);
    }

    @ApiTags('M9Sweeper')
    @ApiSecurity('x-auth-token')
    @ApiResponse({
        status: 200,
        type: ImageScanResultSaveResponse
    })
    @Post(':clusterId/images/:imageId/trawler/scan/results')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.TRAWLER)
    @UseGuards(AuthGuard, AuthorityGuard)
    async saveImageScanResults(
        @Param('clusterId') clusterId: number,
        @Param('imageId') imageId: number,
        @Body() trawlerScanResults: TrawlerScanResults
    ):Promise<ImageScanResultDto>{
        const imageHash = trawlerScanResults.data[0]?.imageHash;

        // imageID sent by Trawler is that of the first image with a matching name. Use it as a default value, but
        // otherwise ignore it while comparing images by hash
        const imageData = await this.imageService.getImageById(imageId);
        let targetImage: ListOfImagesDto;
        // if the image hash matches that of the image pulled by ID, or the pulled image has a temporary hash, overwrite it
        // if Trawler did not send an image hash, update the default image sent by Trawler
        if (!imageHash || imageHash === imageData.dockerImageId || imageData.dockerImageId.startsWith('TMP_')) {
            targetImage = imageData;
        } else {
            // get the image that matches the image hash sent by Trawler if it exists, or create a new image if it doesn't
            try {
                targetImage = await this.imageService.getImageByImageHash(clusterId, imageHash);
            } catch (e) {
                // getImageByImageHash throws a Not Found error when executing properly but no images match the hash
                // create a new image in that case, propagate other errors
                if (e instanceof HttpException && e.getStatus() === HttpStatus.NOT_FOUND) {
                    const newImage = new ImageDto();
                    newImage.dockerImageId = imageHash;
                    newImage.url = imageData.url;
                    newImage.name = imageData.name;
                    newImage.tag = imageData.tag;
                    newImage.summary = imageData.summary;
                    // Assume any new images are not running in the cluster.
                    // The Cluster sync job should make it correct
                    newImage.runningInCluster = false;
                    targetImage = await this.imageService.createImage(newImage, clusterId, true);
                } else {
                    throw e;
                }
            }
        }

        await Promise.all(trawlerScanResults.data.map(async (rsByPolicy: ImageTrawlerResultDto) => {
            const facadeDto = new ImageScanResultPerPolicyFacadeDto();
            facadeDto.issues = rsByPolicy.issues;
            facadeDto.policyId = rsByPolicy.policyId;
            facadeDto.encounteredError = rsByPolicy.encounterError;

            const results = await this.imageComplianceFacadeService.isImageClusterCompliant(clusterId, targetImage, [facadeDto]);

            rsByPolicy.issues.map((issue) => {
                const issueCompliance = results.complianceMap.getResultForCve(rsByPolicy.policyId, issue.scannerId, issue.type);
                issue.isCompliant = issueCompliance.compliant;
                issue.complianceReason = issueCompliance.complianceReason;
                issue.severity = issueCompliance.severity;
                 return issue;
            });

            rsByPolicy.policyStatus = results.compliant;

            return rsByPolicy;
        }));

        // save scan results
        const createdAt = Date.now();
        await Promise.all(trawlerScanResults.data.map((rsByPolicy: ImageTrawlerResultDto) =>
          this.imageService.saveImageScanDataByImageId(clusterId, targetImage.id, rsByPolicy, createdAt)));

        // update image data
        const critical_issues = trawlerScanResults.data.map(r => r.criticalIssues).reduce((a, b) => a + b, 0);
        const major_issues = trawlerScanResults.data.map(r => r.majorIssues).reduce((a, b) => a + b, 0);
        const medium_issues = trawlerScanResults.data.map(r => r.mediumIssues).reduce((a, b) => a + b, 0);
        const low_issues = trawlerScanResults.data.map(r => r.lowIssues).reduce((a, b) => a + b, 0);
        const negligible_issues = trawlerScanResults.data.map(r => r.negligibleIssues).reduce((a, b) => a + b, 0);


        const status = trawlerScanResults.data.every(r => r.policyStatus) ? 'Compliant' : 'Non-compliant'

        await this.imageService.updateImageScanDateByImageId(targetImage.id, status, critical_issues, major_issues,
            medium_issues, low_issues, negligible_issues, imageHash);

        await this.imageService.setImageScanQueueStatus(targetImage.id, false);

        return plainToInstance(ImageScanResultDto, {complaint: status === 'Compliant'});
    }

    @Get('images/:imageId/trawler/scan/results')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: IMAGES_SCAN_RESULTS_RESPONSE_SCHEMA
    })
    async getImageScanResults(
        @Param('imageId') imageId: number,
        @Query('scanDate') scanDate: number,
        @Query('sort') sort: {field: string; direction: string; },
        @Query('page') page: number, @Query('limit') limit: number
    ):Promise<{totalCount: number, list: ImageScanResultsDto[]}>{
        return await this.imageService.getImageScanDataByImageId(imageId, scanDate, page, limit, sort);
    }

    @Get('images/:imageId/trawler/scan/results/count')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: DELETE_IMAGE_RESPONSE_SCHEMA
    })
    async getCountOfImageScanData(
        @Param('imageId') imageId: number): Promise<number>{
        return await this.imageService.getCountOfImageScanData(imageId);
    }

    @Get(':clusterId/images/total/vulnerability/severity')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: TOTAL_SEVERITY_RESPONSE_SCHEMA
    })
    async countVulnerabilitySeverity(
        @Param('clusterId') clusterId: number,
        @Query('sort') sort: {field: string; direction: string; }): Promise<TotalSeverityResultsDto[]> {
        return await this.imageService.totalVulnerabilitySeverityByCluster(clusterId, sort);
    }

    @Get('images/summary')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: DELETE_IMAGE_RESPONSE_SCHEMA
    })
    @ApiQuery({name : 'filters[clusterId]', style: "form", type: [Number]})
    @ApiQuery({name : 'filters[runningInCluster]', style: "form", type: Number})
    async getCountOfFilteredImages(@Query('filters') filters: {clusterId: number[]; runningInCluster: number;}): Promise<number> {
        return await this.imageService.getCountOfTotalImagesRunningCount(filters);
    }

    @Get('images/summary/vulnerabilities')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: TOTAL_VULNERABILITY_RESPONSE_SCHEMA
    })
    @ApiQuery({name : 'filters[clusterId]', style: "form", type: [Number]})
    @ApiQuery({name : 'filters[startDate]', style: "form", type: String})
    @ApiQuery({name : 'filters[endDate]', style: "form", type: String})
    @ApiQuery({name : 'filters[runningInCluster]', style: "form", type: Number})
    @ApiQuery({name : 'filters[namespace]', style: "form", type: [String]})
    async getCountOfFilteredImagesVulnerabilities(
        @Query('filters') filters: {
          clusterId: number[]; namespace: string[]
          startDate: string; endDate: string;
          runningInCluster: number;
        },
        @Query('group_by') groupBy: string
    ): Promise<TotalVulnerabilityResultsDto[]> {
        filters['namespace'] = EnsureArrayTyping.ensureArrayTyping(filters['namespace']);
        return await this.imageService.getCountOfFilteredImagesVulnerabilities(filters, groupBy);
    }

    @Get(':clusterId/summary/vulnerabilities')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: DELETE_IMAGE_RESPONSE_SCHEMA
    })
    @ApiQuery({name : 'filters[startDate]', style: "form", type: String})
    @ApiQuery({name : 'filters[endDate]', style: "form", type: String})
    async getTotalVulnerabilities(@Param('clusterId') clusterId: number,
        @Query('filters') filters: {startDate: string; endDate: string;}): Promise<number>{
        return await this.imageService.getTotalVulnerabilities(clusterId, filters);
    }

    @Get(':clusterId/summary/policy-violations')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: TOTAL_POLICY_VIOLATION
    })
    async getPolicyViolationCount(@Param('clusterId') clusterId: number): Promise<{count: number}[]>{
        return await this.imageService.getPolicyViolationCount(clusterId);
    }

    @Get('image-scan/count')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: TOTAL_IMAGE_SCAN_COUNT_RESPONSE_SCHEMA
    })
    @ApiQuery({name : 'clusterIds[clusterId]', style: "form", type: [Number]})
    async getCountOfImageScan(@Query('clusterIds') clusterIds: {clusterId: number[]}): Promise<ImageScanCountDto[]> {
        return await this.imageService.getCountOfImageScan(clusterIds);
    }

    @Get('images/image-scan-dates')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: TOTAL_IMAGE_SCAN_COUNT_RESPONSE_SCHEMA
    })
    async getDistinctDatesForImageScan(@Query('imageId') imageId: number): Promise<Array<{created_at: number}[]>> {
        return await this.imageService.getDistinctDatesForImageScan(imageId);
    }
    @Get('images/:imageId/scan-queue-status')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: IMAGE_SCAN_QUEUE_STATUS_SCHEMA
    })
    async getImageSanQueueStatus(@Param('imageId') imageId: number): Promise<any> {
        return await this.imageService.getImageSanQueueStatus(imageId);
    }

    @Get('namespace/by/:imageHash')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: NAMESPACE_ID_SCHEMA
    })
    async getNamespaceIdIByImageHash(
        @Param('imageHash') imageHash: string,
    ): Promise<{ name: string }[]>{
        return await this.imageService.getNamespaceByImageHash(imageHash);
    }
}
