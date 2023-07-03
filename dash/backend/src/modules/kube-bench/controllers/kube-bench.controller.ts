import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import {AllowedAuthorityLevels} from "../../../decorators/allowed-authority-levels.decorator";
import {Authority} from "../../user/enum/Authority";
import {AuthGuard} from "../../../guards/auth.guard";
import {AuthorityGuard} from "../../../guards/authority.guard";
import {KubeBenchService} from "../services/kube-bench.service";
import {ApiResponse} from "@nestjs/swagger";
import {KubeBenchDto, KubeBenchLogDto, KubeBenchSummaryTimestampedDto} from "../dto/kube-bench-dto";
import {UserProfileDto} from "../../user/dto/user-profile-dto";
import {uuid} from "uuidv4";
import {UserDao} from "../../user/dao/user.dao";
import {AuthService} from '../../auth/services/auth.service'
import {AuthorityId} from "../../user/enum/authority-id";
import {ApiKeyDao} from "../../api-key/dao/api-key.dao";
import {ApiKeyDto} from "../../api-key/dto/api-key-dto";
import { MineLoggerService } from '../../shared/services/mine-logger.service';

@Controller()
export class KubeBenchController {
    constructor(
        @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
        private readonly kubeBenchService: KubeBenchService,
        private readonly userDao: UserDao,
        private readonly authService: AuthService,
        private readonly apiKeyDao: ApiKeyDao,
        private logger: MineLoggerService,
    ) {}

    @Post('/:clusterId')
    // called externally in curl
    // To do: implement API key protection with interceptor per trawler scanning method
    @ApiResponse({
        status: 201,
    })
    async saveKubeBenchReport(@Body() report: any, @Param('clusterId') clusterId: number, @Query('key') key: string): Promise<KubeBenchDto> {

        // find user authority by user's apikey
        const currentUserAuthObj = await this.userDao.loadUserByApiKey(key);

        // if the current user's api is valid
        if (currentUserAuthObj !== null && currentUserAuthObj != undefined ) {
           //  get all authorities from the current user
            const currentUserAuth = currentUserAuthObj[0].authorities;
            // get Kubebench authority from Authorityid
            let authorityArr: AuthorityId [] = [AuthorityId.KUBEBENCH];
            // is the user a KB user
            let isKBUser = this.authService.checkAuthority(currentUserAuth, authorityArr);
            if (isKBUser) {
                this.logger.log({label: 'User has been authorized; saving KB scan report', data: { clusterId }}, 'KubeBenchController.saveKubeBenchReport');
                //return key as any; // no reports;  remove when done
                const reportAsLogDto = Object.assign(new KubeBenchLogDto(), report);
                const reportAsDto: KubeBenchDto = {
                    uuid: uuid(),
                    clusterId: clusterId,
                    resultsJson: reportAsLogDto,
                    resultsSummary: reportAsLogDto.Totals,
                };
                const newEntry = await this.kubeBenchService.saveKubeBenchReport(reportAsDto);
                if (!newEntry || newEntry.length == 0) throw new HttpException('Internal Server error - log may not have been saved', HttpStatus.INTERNAL_SERVER_ERROR);
                return newEntry[0];

            } else {
                this.logger.log({label: 'User is unauthorized; skip saving KB scan report', data: { clusterId }}, 'KubeBenchController.saveKubeBenchReport');
                throw new HttpException('Unauthorized  - log may not have been saved', HttpStatus.UNAUTHORIZED);
            }
        }

    }

    @Get('/apiKey')
    @AllowedAuthorityLevels( Authority.SUPER_ADMIN, Authority.ADMIN )
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201
    })
    async getApiKey(): Promise<ApiKeyDto[]> {
        const apiKeyKB = await this.apiKeyDao.getApiKeyByUserEmail('Kubebench');
        if (!apiKeyKB) throw new HttpException(`KB APi key ${apiKeyKB} not found`, HttpStatus.NOT_FOUND);
        return apiKeyKB;
    }

    @Get('/:id')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
    })
    async getBenchReportById(@Param('id') id: string): Promise<KubeBenchDto> {
        const report = await this.kubeBenchService.getBenchReportById(+id);
        if (!report) throw new HttpException(`ID ${id} not found`, HttpStatus.NOT_FOUND);
        return report;
    }


    @Delete('/:id')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
    })
    async deleteBenchReportById(@Param('id') id: number): Promise<boolean> {
        const deleted = await this.kubeBenchService.deleteBenchReportById(id);
        if (!deleted) throw new HttpException(`ID ${id} not found`, HttpStatus.NOT_FOUND);
        return true;
    }

    @Get('cluster/:clusterId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
    })
    async getAllBenchReportsByCluster(@Param('clusterId') clusterId: number, @Query('page') page?: number, @Query ('limit') limit?: number ):
        Promise<{reportCount:number, list: KubeBenchDto[]}> {
        const reports = await this.kubeBenchService.getAllBenchReportsByCluster(clusterId, page, limit);
        return reports;
    }

    @Get('cluster/last/report/:clusterId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
    })
    async getLastBenchReportSummary(@Param('clusterId') clusterId: number): Promise<KubeBenchSummaryTimestampedDto> {
        const summary = await this.kubeBenchService.getLastBenchReportSummary(clusterId);
        if (!summary || summary.length == 0) throw new HttpException(`No results for cluster ID ${clusterId} found`, HttpStatus.NOT_FOUND);
        const Totals = summary[0].resultsSummary;
        const createdAt = summary[0].createdAt;
        return {Totals, createdAt};
    }

    @Get('/config/get-options')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
    })
    async getConfigFileList(): Promise<{data: {name: string, value: string}[], success: boolean}> {
        const env = await this.kubeBenchService.getConfigFileList();
        return { data: env, success: true };
    }

    @Get('/config/get-options/:option')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
    })
    async getConfigFileContents(@Param('option') option: string): Promise<{data: string, success: boolean}> {
        const contents = await this.kubeBenchService.getConfigFileContents(option);
        return { data: contents, success: true };
    }
}
