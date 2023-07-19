import {
    Body,
    Controller,
    Get,
    Inject,
    Post,
    Put, Query,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {AppSettingsService} from '../services/app-settings.service';
import {AppSettingsDto} from '../dto/app-settings-dto';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {AuthGuard} from '../../../guards/auth.guard';
import {FileManagementService} from '../../shared/services/file-management.service';
import {ApiBearerAuth, ApiBody, ApiResponse, ApiTags} from '@nestjs/swagger';
import {SITE_SETTINGS_RESPONSE_SCHEMA} from '../open-api-schema/site-settings-schema';
import {AllowedAuthorityLevels} from '../../../decorators/allowed-authority-levels.decorator';
import {Authority} from '../../user/enum/Authority';
import {AuthorityGuard} from '../../../guards/authority.guard';
import {ConfigService} from '@nestjs/config';
import {AppSettingsType} from "../enums/settings-enums";
import {UserProfileDto} from "../../user/dto/user-profile-dto";
import { MineLoggerService } from '../../shared/services/mine-logger.service';

@ApiTags('Site Settings')
@ApiBearerAuth('jwt-auth')
@Controller('site')
@UseInterceptors(ResponseTransformerInterceptor)
export class SiteSettingsController {

    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly appSettingsService: AppSettingsService,
                private readonly fileManagementService: FileManagementService,
                private readonly configService: ConfigService,
                private logger: MineLoggerService,
    ) {}

    @Get()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: SITE_SETTINGS_RESPONSE_SCHEMA
    })
    async getSettings(): Promise<AppSettingsDto[]> {
        return <AppSettingsDto[]> await this.appSettingsService.getSettings(AppSettingsType.SITE_SETTINGS);
    }

    @Post()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: SITE_SETTINGS_RESPONSE_SCHEMA
    })
    @ApiBody({
        type: AppSettingsDto,
        isArray: true
    })
    async createSettings(@Body() siteSettings: AppSettingsDto[]): Promise<AppSettingsDto[]> {
        return <AppSettingsDto[]> await this.appSettingsService.saveSettings(AppSettingsType.SITE_SETTINGS, siteSettings, this._loggedInUser?.id);
    }

    @Put()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiBody({
        type: AppSettingsDto,
        isArray: true
    })
    @ApiResponse({
        status: 201,
        schema: SITE_SETTINGS_RESPONSE_SCHEMA
    })
    async updateSettings(@Body() siteSettings: AppSettingsDto[]): Promise<AppSettingsDto[]> {
        return await this.createSettings(siteSettings);
    }
}
