import {Injectable} from '@nestjs/common';
import {DatabaseService} from '../../shared/services/database.service';
import {ResetPasswordModel} from '../models/reset-password.model';
import {instanceToPlain, plainToInstance} from 'class-transformer';

@Injectable()
export class ResetPasswordDao {

    constructor(private readonly databaseService: DatabaseService) {}

    async saveResetToken(data: ResetPasswordModel): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const plainData = <any> instanceToPlain(data);
        if (plainData?.id > 0) {
            const id = plainData.id;
            delete plainData.id;
            return knex('password_resets').update(plainData).where({id})
              .returning('id').then(results => !!results ? results[0]?.id : null);
        } else {
            return knex.into('password_resets').insert(plainData)
              .returning('id').then(results => !!results ? results[0]?.id : null);
        }
    }

    async loadTokenData(userId: number, token: string): Promise<ResetPasswordModel> {
        const knex = await this.databaseService.getConnection();
        return knex.select('*')
            .from('password_resets')
            .where({account_id: userId, token, is_used: false})
            .first()
            .then(resetPasswordData => plainToInstance(ResetPasswordModel, resetPasswordData));
    }

    async changePassword(userId: number, password: string): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return knex('users').update({password: password}).where({id: userId});
    }

}
