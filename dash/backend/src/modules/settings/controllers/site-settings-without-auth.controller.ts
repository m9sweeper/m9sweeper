import {Controller, Get, HttpStatus, Inject, Res, UseGuards, UseInterceptors} from '@nestjs/common';
import {AppSettingsService} from '../services/app-settings.service';
import {AppSettingsDto} from '../dto/app-settings-dto';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {FileManagementService} from '../../shared/services/file-management.service';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import {SITE_TITLE_RESPONSE_SCHEMA} from '../open-api-schema/site-settings-schema';
import {ConfigService} from '@nestjs/config';
import {AppSettingsType, SiteSettingsType} from "../enums/settings-enums";
import {UserProfileDto} from "../../user/dto/user-profile-dto";

@ApiTags('Site Settings')
@Controller('site')
@UseInterceptors(ResponseTransformerInterceptor)
export class SiteSettingsWithoutAuthController {

    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly appSettingsService: AppSettingsService,
                private readonly fileManagementService: FileManagementService,
                private readonly configService: ConfigService){}

    @Get('title')
    @ApiResponse({
        status: 201,
        schema: SITE_TITLE_RESPONSE_SCHEMA
    })
    async siteTitle(): Promise<string> {
        const siteSettings: AppSettingsDto = <AppSettingsDto> await this.appSettingsService.getSettings(AppSettingsType.SITE_SETTINGS, SiteSettingsType.SITE_NAME);
        return siteSettings ? siteSettings.value : this.configService.get('server.name');
    }

    @Get('logo')
    async viewFile(@Res() res) {
        const siteLogoSettings: AppSettingsDto = <AppSettingsDto> await this.appSettingsService.getSettings(AppSettingsType.SITE_SETTINGS, SiteSettingsType.SITE_LOGO);

        if (siteLogoSettings) {
            const file = await this.fileManagementService.load(siteLogoSettings.value);
            if (file && file.stream) {
                res.set({
                    'Content-Type': file.details.contentType,
                    'Content-Length': file.details.contentSize,
                    'Content-Disposition': `attachment; filename=${file.details.fileName}`
                });
                file.stream.on('close', () => {
                    res.end()
                });
                file.stream.on('error', () => {
                    res.end()
                });
                file.stream.pipe(res);
                return;
            }
        }
        res.status(HttpStatus.NOT_FOUND).send();
    }
}
