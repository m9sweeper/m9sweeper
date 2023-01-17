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
import {SentMessageInfo} from "nodemailer";
import {instanceToPlain} from "class-transformer";
import {ConfigService} from "@nestjs/config";
import {EmailService} from "../../shared/services/email.service";

@ApiTags('Project Falco')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class FalcoController {
    constructor(
        private readonly falcoService: FalcoService,
        private readonly apiKeyDao: ApiKeyDao,
        private readonly userDao: UserDao,
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly email: EmailService,
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
    // @TODO: Update to use same authorization method as kube-bench and kube-hunter
    async createFalcoLog(
        @Param('clusterid') clusterId: number,
        @Body() falcoLog: FalcoWebhookInputDto,
        @Query('key') key: string
    ): Promise<FalcoDto> {

        //find user authority by user's apikey
        const currentUserAuthObj = await this.userDao.loadUserByApiKey(key);
        // if the current user's api is valid
        if (currentUserAuthObj !== null && currentUserAuthObj != undefined ) {
            // get all authorities from the current user
            const currentUserAuth = currentUserAuthObj[0].authorities;
            // get Falco authority from Authorityid
            let authorityArr: AuthorityId [] = [AuthorityId.FALCO];
            // is the user a Falco user
            let isFalcoUser = this.authService.checkAuthority(currentUserAuth, authorityArr);
            if (isFalcoUser) {
                const newFalcoLog =  await this.falcoService.createFalcoLog(clusterId, falcoLog);
                const falcoSetting = await this.falcoService.findFalcoSetting(clusterId, newFalcoLog);
                const allAdminEmail = await this.falcoService.getAllAdminsToMail();
                console.log('allAdminEmail', allAdminEmail);

                //console.log('falcosetting[0]', falcoSetting[0]);
                const stringArraySeverityLevel = JSON.parse(falcoSetting[0].severity_level);
                const stringArrayWeekDay = JSON.parse(falcoSetting[0].weekday);
                const stringArrayEmailList = JSON.parse(falcoSetting[0].email_list);
                //console.log('stringArrayWeekDay: ', stringArrayWeekDay);
                // console.log('stringArrayEmailList: ',stringArrayEmailList);
                //return;

                stringArraySeverityLevel.forEach(element => {
                    console.log('element:', element);

                    // if new log severity level matches setting
                    if (element === newFalcoLog[0].level){
                        console.log('matched!');

                        // if sent to all admin, get all admin email addresses
                        if (falcoSetting[0].who_to_notify === 'allAdmin'){
                            for (const user of allAdminEmail) {
                                this.email.send({
                                    to: user.email,
                                    from: this.configService.get('email.default.sender'),
                                    subject: `New ${newFalcoLog[0].level} Project Falco Alert in ${newFalcoLog[0].namespace}`,
                                    template: 'falco-log-email',
                                    context: {
                                        falcoLog: instanceToPlain(newFalcoLog[0]),
                                        moreDetailsLink: ``,
                                    }
                                }).catch(e => {
                                    console.log('Error sending falco email: ' + e);
                                });
                            }
                        } else{
                            // send to specific list
                            for (const user of stringArrayEmailList) {
                                this.email.send({
                                    to: user,
                                    from: this.configService.get('email.default.sender'),
                                    subject: `New ${newFalcoLog[0].level} Project Falco Alert in ${newFalcoLog[0].namespace}`,
                                    template: 'falco-log-email',
                                    context: {
                                        falcoLog: instanceToPlain(newFalcoLog[0]),
                                        moreDetailsLink: ``,
                                    }
                                }).catch(e => {
                                    console.log('Error sending falco email: ' + e);
                                });
                            }

                        }
              } else{
                  console.log('not match!');
              }
              });
                return;

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
