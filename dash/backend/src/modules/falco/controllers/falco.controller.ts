import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UnauthorizedException,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {AllowedAuthorityLevels} from '../../../decorators/allowed-authority-levels.decorator';
import {AuthorityGuard} from '../../../guards/authority.guard';
import {AuthGuard} from '../../../guards/auth.guard';
import {FalcoDto} from '../dto/falco.dto';
import {FalcoService} from '../service/falco.service';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import {FalcoWebhookInputDto} from '../dto/falco-webhook-input.dto';
import {Authority} from '../../user/enum/Authority';
import {ApiKeyDao} from '../../api-key/dao/api-key.dao';
import {ApiKeyDto} from '../../api-key/dto/api-key-dto';
import {UserDao} from '../../user/dao/user.dao';
import {AuthService} from '../../auth/services/auth.service';
import {AuthorityId} from '../../user/enum/authority-id';
import {FalcoCountDto} from '../dto/falco-count.dto';
import {FalcoSettingDto} from '../dto/falco-setting.dto';
import {FalcoCsvDto} from '../dto/falco-csv-dto';
import {FalcoRuleDto} from '../dto/falco-rule.dto';
import {FalcoRuleAction} from '../enums/falco-rule-action';
import {MineLoggerService} from '../../shared/services/mine-logger.service';


@ApiTags('Project Falco')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class FalcoController {
    constructor(
        private readonly falcoService: FalcoService,
        private readonly apiKeyDao: ApiKeyDao,
        private readonly userDao: UserDao,
        private readonly authService: AuthService,
        protected readonly logger: MineLoggerService
        // private readonly falcoEmailCommand: FalcoEmailCommand,

    ) {}

    @Get()
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.ADMIN, Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getFalcoLogs(
        @Query('cluster-id') clusterId: number,
        @Query('limit') limit?: number,
        @Query('page') page?: number,
        @Query('priority') priorities?: string [],
        @Query('orderBy') orderBy?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('namespace') namespace?: string,
        @Query('pod') pod?: string,
        @Query('image') image?: string,
        @Query('signature') signature?: string,
    ): Promise<{ logCount: number, list: FalcoDto[], }>
    {
        // default values - seems to be filling with NaN instead of null which causes the defaults in Dao to not work right
        if (!limit) limit = null;
        if (!page) page = null;

        return this.falcoService.getFalcoLogs(clusterId, limit, page, priorities, orderBy, startDate, endDate, namespace, pod, image, signature);
    }

    @Get('/count')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.ADMIN, Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200
    })
    async getCountOfFalcoLogsBySignature(
        @Query('cluster-id') clusterId: number,
        @Query('signature') signature?: string
    ): Promise<FalcoCountDto[]>
    {
        return this.falcoService.getCountOfFalcoLogsBySignature(clusterId, signature);
    }

    @Get('/apiKey')
    @AllowedAuthorityLevels( Authority.SUPER_ADMIN, Authority.ADMIN )
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201
    })
    async getApiKey(): Promise<ApiKeyDto[]> {
        const apiKeyFalco = await this.apiKeyDao.getApiKeyByUserEmail('Falco');
        if (!apiKeyFalco) throw new HttpException(`Falco APi key ${apiKeyFalco} not found`, HttpStatus.NOT_FOUND);
        return apiKeyFalco;
    }

    @Get('/download')
    @AllowedAuthorityLevels(Authority.ADMIN, Authority.SUPER_ADMIN)
    @Header('Content-Type', 'text/csv')
    @UseGuards(AuthGuard, AuthorityGuard)
    async downloadFalcoExport(
        @Query('cluster-id') clusterId: number,
        @Query('limit') limit?: number,
        @Query('page') page?: number,
        @Query('priority') priorities?: string [],
        @Query('orderBy') orderBy?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('namespace') namespace?: string,
        @Query('pod') pod?: string,
        @Query('image') image?: string,
        @Query('signature') signature?: string,
    ): Promise< FalcoCsvDto >
     {
        //  use frontend result and pass them as parameters
         // default values - seems to be filling with NaN instead of null which causes the defaults in Dao to not work right
         if (!limit) limit = null;
         if (!page) page = null;

        return this.falcoService.getFalcoCsv(clusterId,  limit, page, priorities, orderBy, startDate, endDate, namespace, pod, image, signature);
    }

    @Get('/:eventId')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.ADMIN, Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201
    })
    async getFalcoLogByEventId(
        @Param('eventId') eventId: number
    ): Promise< FalcoDto>
    {
        return this.falcoService.getFalcoLogByEventId(eventId);
    }

    @Get('/:clusterid/findsetting')
    @AllowedAuthorityLevels( Authority.SUPER_ADMIN, Authority.ADMIN )
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201
    })
    async findFalcoSettingByClusterId(
        @Param('clusterid') clusterId: number,
    ): Promise< FalcoSettingDto>
    {
        return this.falcoService.findFalcoSettingByClusterId(clusterId);
    }


    @Post(':clusterid/create')
    async createFalcoLog(
        @Param('clusterid') clusterId: number,
        @Body() falcoLog: FalcoWebhookInputDto,
        @Query('key') key: string
    ): Promise<FalcoDto> {
        // look up user by api key
        const currentUserAuthObj = await this.userDao.loadUserByApiKey(key || '');
        if (!currentUserAuthObj) {
            throw new UnauthorizedException('Access Denied!');
        }

        // get all authorities from the current user
        const currentUserAuth = currentUserAuthObj[0].authorities;
        const isFalcoUser = this.authService.checkAuthority(currentUserAuth, [AuthorityId.FALCO]);
        if (!isFalcoUser) {
            throw new UnauthorizedException('Access Denied!');
        }

        const action = await this.falcoService.checkRules(clusterId, falcoLog);
        // An ignore rule applied,
        if (action === FalcoRuleAction.Ignore) {
            this.logger.log('Ignoring Falco Event', {
                clusterId,
                namespace: falcoLog?.outputFields?.k8sNamespaceName,
                rule: falcoLog?.rule,
                image: falcoLog?.outputFields?.containerImageRepository,
            });
            return;
        }

        // Save new falco log
        return await this.falcoService.createFalcoLog(clusterId, falcoLog, action === FalcoRuleAction.Silence);
    }

    @Post(':clusterid/settings')
    @AllowedAuthorityLevels( Authority.SUPER_ADMIN, Authority.ADMIN )
    @UseGuards(AuthGuard, AuthorityGuard)
    async createFalcoSetting(
        @Param('clusterid') clusterId: number,
        @Body() falcoSetting: FalcoSettingDto
    ): Promise <any> {
        const result = this.falcoService.createFalcoSetting(clusterId, falcoSetting);
        return result;
    }

    @Post(':clusterId/rules')
    @AllowedAuthorityLevels( Authority.SUPER_ADMIN, Authority.ADMIN )
    @UseGuards(AuthGuard, AuthorityGuard)
    async createFalcoRule(
      @Param('clusterId') clusterId: number,
      @Body() rule: FalcoRuleDto
    ): Promise<FalcoRuleDto> {
        if (rule?.clusterId !== clusterId) {
            throw new HttpException({ message: 'Cluster id in path does not match cluster ID in body.' }, HttpStatus.BAD_REQUEST);
        }
        delete rule.id;
        return await this.falcoService.createFalcoRule(rule);
    }

    @Get(':clusterId/rules')    @AllowedAuthorityLevels( Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY )
    @UseGuards(AuthGuard, AuthorityGuard)
    async listActiveFalcoRulesForCluster(@Param('clusterId') clusterId: number): Promise<FalcoRuleDto[]> {
        return this.falcoService.listActiveFalcoRulesForCluster(clusterId);

    }

    @Put(':clusterId/rules/:ruleId')
    @AllowedAuthorityLevels( Authority.SUPER_ADMIN, Authority.ADMIN )
    @UseGuards(AuthGuard, AuthorityGuard)
    async updateFalcoRule(
      @Param('clusterId') clusterId: number,
      @Param('ruleId') ruleId: number,
      @Body() rule: FalcoRuleDto
    ): Promise<FalcoRuleDto> {
        if (rule?.clusterId !== clusterId || ruleId !== rule?.id) {
            throw new HttpException({ message: 'rule or cluster id in path does not match the body.' }, HttpStatus.BAD_REQUEST);
        }
        return this.falcoService.updateFalcoRule(rule, ruleId);
    }

    @Delete(':clusterId/rules/:ruleId')
    @AllowedAuthorityLevels( Authority.SUPER_ADMIN, Authority.ADMIN )
    @UseGuards(AuthGuard, AuthorityGuard)
    async deleteFalcoRule(
      @Param('clusterId') clusterId: number,
      @Param('ruleId') ruleId: number
    ): Promise<FalcoRuleDto>  {
        return this.falcoService.deleteFalcoRule(clusterId, ruleId);
    }
}
