import {Injectable} from '@nestjs/common';
import {AppSettingsDao} from '../dao/app-settings.dao';
import {AppSettingsDto} from '../dto/app-settings-dto';
import {plainToInstance} from 'class-transformer';
import {AppSettingsType, LicenseSettingsType, SettingsType} from "../enums/settings-enums";
import {LicenseSettingDto} from "../../../integrations/licensing-portal/licensing-portal.dto";
import { LicenseFeatures } from '../../cluster-validation/enums/LicenseFeatures';

@Injectable()
export class AppSettingsService {

    constructor(private readonly appSettingsDao: AppSettingsDao) {}

    async getSettings(type: AppSettingsType, name?: SettingsType | string): Promise<AppSettingsDto[] | AppSettingsDto> {
        const appSettings: any[] = await this.appSettingsDao.getAppSettings(type, name);
        return plainToInstance(AppSettingsDto, name ? appSettings.pop() : appSettings, {enableImplicitConversion: true, excludeExtraneousValues: true});
    }

    async getLicenseSettings(): Promise<any> {
        return await this.appSettingsDao.getAppSettings(AppSettingsType.LICENSE_SETTINGS);
    }

    async doesLicenseHaveImageScanningEnforcement(): Promise<boolean> {
        return this.getLicenseSettings()
          .then((licenseFeatures) => {
              // Returns true if there are license features, and image scanning enforcement is an enabled feature
              return !!licenseFeatures &&
                licenseFeatures.some(feature => feature.name === LicenseFeatures.IMAGE_SCANNING_ENFORCEMENT && feature.value === 'true');
          });

    }

    async getAllSettings(type: AppSettingsType): Promise<AppSettingsDto[]> {
        const appSettings: any[] = await this.appSettingsDao.getAppSettings(type);
        return plainToInstance(AppSettingsDto, appSettings, {enableImplicitConversion: true, excludeExtraneousValues: true});
    }

    async saveSettings(type: AppSettingsType, settings: AppSettingsDto[], userId: number): Promise<AppSettingsDto[] | AppSettingsDto> {
        const siteSettings: any[] = settings.map(s => {
            return {
                settings_id: type,
                name: s.name,
                value: s.value
            };
        });
        const savedResult = await this.appSettingsDao.createAppSettings(siteSettings, userId);
        return plainToInstance(AppSettingsDto, savedResult, {enableImplicitConversion: true, excludeExtraneousValues: true});
    }

    async getLicenseAndInstanceKeys(): Promise<{ licenseKey: string, instanceKey: string }> {
        const allSettings = await this.getAllSettings(AppSettingsType.LICENSE_SETTINGS);
        const licenseKeySettings = allSettings.find(x => x.name === LicenseSettingsType.LICENSE_KEY);
        const instanceKeySettings = allSettings.find(x => x.name === LicenseSettingsType.INSTANCE_KEY);
        const licenseKey = licenseKeySettings ? licenseKeySettings.value : process.env.LICENSE_KEY;
        const instanceKey = instanceKeySettings ? instanceKeySettings.value : process.env.INSTANCE_KEY;
        return { licenseKey, instanceKey };
    }

    async getLicenseSettingsFromDash(): Promise<LicenseSettingDto[]> {
        return this.appSettingsDao.getLicenseSettingsFromDash();
    }
}
