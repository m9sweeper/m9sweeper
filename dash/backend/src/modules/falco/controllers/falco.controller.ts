import {Body, Controller, Get, Header, HttpException, HttpStatus, Param, Post, Query, UseGuards, UseInterceptors} from '@nestjs/common';
import {AllowedAuthorityLevels} from '../../../decorators/allowed-authority-levels.decorator';
import {AuthorityGuard} from '../../../guards/authority.guard';
import {AuthGuard} from '../../../guards/auth.guard';
import {FalcoDto} from '../dto/falco.dto';
import {FalcoService} from '../service/falco.service';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import {FalcoWebhookInputDto} from '../dto/falco-webhook-input.dto';
import {Authority} from '../../user/enum/Authority';
import {ApiKeyDao} from "../../api-key/dao/api-key.dao";
import {ApiKeyDto} from "../../api-key/dto/api-key-dto";
import {UserDao} from "../../user/dao/user.dao";
import {AuthService} from "../../auth/services/auth.service";
import {AuthorityId} from "../../user/enum/authority-id";
import {FalcoCountDto} from "../dto/falco-count.dto";
import {FalcoSettingDto} from "../dto/falco-setting.dto";
import {format, set, sub} from "date-fns";


@ApiTags('Project Falco')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class FalcoController {
    constructor(
        private readonly falcoService: FalcoService,
        private readonly apiKeyDao: ApiKeyDao,
        private readonly userDao: UserDao,
        private readonly authService: AuthService,
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
        @Query('eventId') eventId?: number
    ): Promise<{ logCount: number, list: FalcoDto[]}>
    {
        return this.falcoService.getFalcoLogs(clusterId, limit, page, priorities, orderBy, startDate, endDate, namespace, pod, image, signature, eventId);
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


    @Post(':clusterid/create')
    async createFalcoLog(
        @Param('clusterid') clusterId: number,
        @Body() falcoLog: FalcoWebhookInputDto,
        @Query('key') key: string
    ): Promise<FalcoDto> {
        // look up user by api key
        const currentUserAuthObj = await this.userDao.loadUserByApiKey(key);
        if (!currentUserAuthObj) {
            return; // @TODO: Should throw access denied exception
        }

        // get all authorities from the current user
        const currentUserAuth = currentUserAuthObj[0].authorities;
        let isFalcoUser = this.authService.checkAuthority(currentUserAuth, [AuthorityId.FALCO]);
        if (!isFalcoUser) {
            return; // @TODO: Should throw access denied exception
        }

        // check if falco settings rules should be applied
        /*const rules = getFalcoSettingsRules(clusterId);
        for (rules : rule) {
            if (rule.isRelevant(event)) {
                if (rule.affect === 'ignore') {
                    return; // don't save this event - it is being filtered out
                }
            }
        }*/

        // Saved new falco log
        const newFalcoLog = await this.falcoService.createFalcoLog(clusterId, falcoLog);

        // look up falco settings in order to decide if we need to send email(s) to administrators
        // @TODO: Mave the email stuff to the service class so that it could be re-used if we ever added another way to ingest falco events/logs
        await this.sendFalcoEmailAlert(clusterId, newFalcoLog);
    }

    private async sendFalcoEmailAlert(clusterId: number, newFalcoLog: FalcoDto) {
        const falcoSetting = await this.falcoService.findFalcoSettingByClusterId(clusterId);

        if (!falcoSetting) {
            return; // no settings means there's no email to send!
        }

        // get all admin email addresses
        const allAdminEmail = await this.falcoService.getAllAdminsToMail();
        // To test email: const allAdminEmailArray = ['some_email_address'] and comment out forEach();
        const allAdminEmailArray = [];
        allAdminEmail.forEach( element => allAdminEmailArray.push(element.email));

        // Parse data from new falco log fields
        const falcoId = newFalcoLog[0].id;
        const falcoSignature = newFalcoLog[0].anomaly_signature;
        const falcoNamespace = newFalcoLog[0].namespace;
        const falcoSeverity = newFalcoLog[0].level;

        // Parse data from falco settings json fields
        const severityLevel = falcoSetting["severity_level"];
        const anomalyFrequency = (falcoSetting['anomaly_notification_frequency'] * 24 * 60 * 60 * 1000);
        const weekDay = falcoSetting['weekday'];
        const emailList = falcoSetting['email_list'].split(',');
        const cleanEmailList = [];
        for (const ele of emailList) {
            cleanEmailList.push(ele.trim());
        }
        const whoToNotify = falcoSetting['who_to_notify'];


        if (!severityLevel.includes(falcoSeverity)) {
            return; // no need to send email - does not match the severity level we send emails for
        }

        // Have we already sent an email ?
        const lastEmailSentTime = await this.falcoService.falcoEmailAlreadySent(clusterId, falcoSignature);

        // if no email record then send an email now
        if (lastEmailSentTime === null || lastEmailSentTime <= (Date.now() - lastEmailSentTime)) {
            await this.sendFalcoEmail(whoToNotify, allAdminEmailArray, emailList, clusterId, falcoId, falcoSeverity, falcoNamespace, falcoSignature, newFalcoLog);
        } else {
            // when was the last email sent?
            const timeDifference = Date.now() - lastEmailSentTime;

            // if the last sent email was older than anomalyFrequency then send
            if (timeDifference > anomalyFrequency) {
                await this.sendFalcoEmail(whoToNotify, allAdminEmailArray, emailList, clusterId, falcoId, falcoSeverity, falcoNamespace, falcoSignature, newFalcoLog);
            } else {
                console.log('Email notification was already sent for this anomaly!');
            }
        }
    }

    private async sendFalcoEmail(whoToNotify, allAdminEmailArray: any[], emailList, clusterId: number, falcoId, falcoSeverity, falcoNamespace, falcoSignature, newFalcoLog: FalcoDto) {
        // send to all admin OR specific email list?
        const usersToSendTo = (whoToNotify === 'allAdmin') ? allAdminEmailArray : emailList;

        for (const user of usersToSendTo) {
            const emailSentTime = await this.falcoService.sendFalcoEmail(
                user,
                clusterId,
                falcoId,
                falcoSeverity,
                falcoNamespace,
                falcoSignature,
                newFalcoLog
            );

            // if email is sent then add a falco email record
            if (emailSentTime !== null && emailSentTime !== undefined) {
                await this.falcoService.addFalcoEmail(emailSentTime, clusterId, falcoSignature);
            } else {
                console.log("Failed to send email!")
            }
        }
    }

    @Post(':clusterid/settings')
    async createFalcoSetting(
        @Param('clusterid') clusterId: number,
        @Body() falcoSetting: FalcoSettingDto
    ): Promise <any> {
        console.log('backend falco controller');
        console.log('falcosetting:', falcoSetting);
        const result = this.falcoService.createFalcoSetting(clusterId, falcoSetting);
        return result;
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
        @Query('endDate') endDate?: string
    ) {
        return this.falcoService.getFalcoCsv(clusterId);
    }

}
