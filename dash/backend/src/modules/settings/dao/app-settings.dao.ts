import {Injectable} from '@nestjs/common';
import {DatabaseService} from '../../shared/services/database.service';
import {AppSettingsType, SiteSettingsType} from '../enums/settings-enums';
import {plainToInstance} from "class-transformer";
import {LicenseSettingDto} from "../../../integrations/licensing-portal/licensing-portal.dto";

@Injectable()
export class AppSettingsDao {
    constructor(private readonly databaseService: DatabaseService) {}

    async getAppSettings(type: AppSettingsType, name?: SiteSettingsType | string) {
        const conditions: any = {settings_id: type};
        if (name) {
            conditions.name = name;
        }
        const knex = await this.databaseService.getConnection();
            const results = knex
            .select([
                's.id AS id', 's.name AS name', 's.value AS value',
                's.created_by AS createdBy', 's.created_at AS createdAt',
                's.updated_by AS updatedBy', 's.updated_at AS updatedAt'
            ])
            .from('organization_settings as s').where(conditions);
        return results;
    }

    async createAppSettings(settingsData: any[], userId: number): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return await knex.transaction(async trx => {
            return await Promise.all(settingsData.map((sd, i) => {
                const conflictArray = ['settings_id', 'name'];
                return trx('organization_settings')
                    .insert({
                        'settings_id': sd.settings_id,
                        'name': sd.name,
                        'value': sd.value,
                        'created_by': userId,
                    })
                    .onConflict(conflictArray)
                    .merge({
                        'value': sd.value,
                        'updated_by': userId ?? 0
                    })
                    .returning(['id AS id', 'name AS name', 'value AS value',
                        'created_by AS createdBy', 'created_at AS createdAt',
                        'updated_by AS updatedBy', 'updated_at AS updatedAt'])
                    .then((result: any) => {
                        return Array.isArray(result.rows) && result.rows.length > 0 ? result.rows[0] : null;
                    });
            }));
        });
    }

    async getLicenseSettingsFromDash(): Promise<LicenseSettingDto[]> {
        const knex = await this.databaseService.getConnection();
        return knex
            .select('*')
            .from('organization_settings as os')
            .where('os.settings_id', AppSettingsType.LICENSE_SETTINGS)
            .then(data => {
                return plainToInstance(LicenseSettingDto, data);
            });
    }
}
