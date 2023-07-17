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
import {SITE_SETTINGS_RESPONSE_SCHEMA, SITE_TITLE_RESPONSE_SCHEMA} from '../open-api-schema/site-settings-schema';
import {AllowedAuthorityLevels} from '../../../decorators/allowed-authority-levels.decorator';
import {Authority} from '../../user/enum/Authority';
import {AuthorityGuard} from '../../../guards/authority.guard';
import {ConfigService} from '@nestjs/config';
import {AppSettingsType, LicenseSettingsType} from "../enums/settings-enums";
import {UserProfileDto} from "../../user/dto/user-profile-dto";
import {LicensingPortalService} from "../../../integrations/licensing-portal/licensing-portal.service";
import {LicenseAndInstanceValidityDto} from "../../../integrations/licensing-portal/licensing-portal.dto";
import { MineLoggerService } from '../../shared/services/mine-logger.service';

@ApiTags('Site Settings')
@ApiBearerAuth('jwt-auth')
@Controller('site')
@UseInterceptors(ResponseTransformerInterceptor)
export class SiteSettingsController {

    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly appSettingsService: AppSettingsService,
                private readonly fileManagementService: FileManagementService,
                private readonly licensingPortalService: LicensingPortalService,
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

    @Get('license/validity')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: SITE_TITLE_RESPONSE_SCHEMA
    })
    async checkLicenseValidity(): Promise<LicenseAndInstanceValidityDto> {
        const keys = await this.appSettingsService.getLicenseAndInstanceKeys();
        /*
        if (keys.licenseKey === undefined || keys.instanceKey === undefined) {
            throw new HttpException({message: ' The license key / installation id is not contained in app settings'}, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        */

            const license = await this.licensingPortalService.checkLicenseValidity(keys.licenseKey, keys.instanceKey);
            if (license && license.success) {
                const settings: any = [
                    {
                        name: 'EXPIRATION_DATE',
                        value: license.data.licenseExpirationDate
                    }
                ];
                try {
                    await this.appSettingsService.saveSettings(AppSettingsType.LICENSE_SETTINGS, settings, this._loggedInUser.id);
                } catch (e) {
                    this.logger.error({label: 'Error saving license expiration date'}, e, 'SiteSettingsController.checkLicenseValidity');
                }
            }
            return license;
        }


    @Get('license/validity/from/portal')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: SITE_TITLE_RESPONSE_SCHEMA
    })
    async checkLicenseValidityFromLicensingPortal(@Query('licenseKey') licenseKey: string, @Query('instanceKey') instanceKey: string): Promise<LicenseAndInstanceValidityDto> {
            const license = await this.licensingPortalService.checkLicenseValidity(licenseKey, instanceKey);
            if (license && license.success) {
                // license is valid and not expired
                if (license.data.isValid && Number(license.data.licenseExpirationDate) > Date.now()) {
                    let settings: any = [
                        {
                            name: LicenseSettingsType.LICENSE_KEY,
                            value: licenseKey
                        },
                        {
                            name: LicenseSettingsType.INSTANCE_KEY,
                            value: instanceKey
                        },
                        {
                            name: 'EXPIRATION_DATE',
                            value: license.data.licenseExpirationDate
                        }
                    ];

                    if (license.data.features.length) {
                        const licenseFeatures = license.data.features.map(feature => {
                            feature['value'] = true;
                            delete feature.id;
                            return feature;
                        });
                        settings = [...settings, ...licenseFeatures];
                    }

                    if (license.data.quotas && license.data.quotas.length) {
                        const quotas = license.data.quotas.map(quota => {
                            return {
                                name: quota['quotaTypeName'],
                                value: quota['value'],
                            };
                        });
                        settings = [...settings, ...quotas];
                    }

                    try {
                        // first, update previously saved license feature to ''
                        await this.appSettingsService.saveSettings(AppSettingsType.LICENSE_SETTINGS, [
                            {name: LicenseSettingsType.IMAGE_SCANNING, value: ''},
                            {name: LicenseSettingsType.IMAGE_SCANNING_ENFORCEMENT, value: ''},
                            {name: LicenseSettingsType.IMAGE_SCANNING_EXCEPTIONS, value: ''},
                        ], this._loggedInUser.id);

                        await this.appSettingsService.saveSettings(AppSettingsType.LICENSE_SETTINGS, settings, this._loggedInUser.id);
                    } catch (e) {
                        this.logger.error({label: 'Error saving license & instance key'}, e, 'SiteSettingsController.checkLicenseValidityFromLicensingPortal');
                        return;
                    }
                }
            }
            return license;
        }

    @Get('license/settings')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: SITE_SETTINGS_RESPONSE_SCHEMA
    })
    async getLicenseSettings(): Promise<AppSettingsDto[]> {
        return await this.appSettingsService.getLicenseSettings();
    }
}
