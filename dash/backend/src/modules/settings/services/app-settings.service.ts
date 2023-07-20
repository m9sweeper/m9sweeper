import {Injectable} from '@nestjs/common';
import {AppSettingsDao} from '../dao/app-settings.dao';
import {AppSettingsDto} from '../dto/app-settings-dto';
import {plainToInstance} from 'class-transformer';
import {AppSettingsType, SettingsType} from "../enums/settings-enums";

@Injectable()
export class AppSettingsService {

    constructor(private readonly appSettingsDao: AppSettingsDao) {}

    async getSettings(type: AppSettingsType, name?: SettingsType | string): Promise<AppSettingsDto[] | AppSettingsDto> {
        const appSettings: any[] = await this.appSettingsDao.getAppSettings(type, name);
        return plainToInstance(AppSettingsDto, name ? appSettings.pop() : appSettings, {enableImplicitConversion: true, excludeExtraneousValues: true});
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
}
