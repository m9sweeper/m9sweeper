import {Injectable} from '@nestjs/common';
import {DatabaseService} from '../../shared/services/database.service';
import { Knex } from 'knex';
import * as knexnest from 'knexnest';
import {AuthConfiguration} from '../models/auth-configuration';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {AuthConfigurationDTO} from '../dto/external-auth-config-dto';


@Injectable()
export class ExternalAuthConfigService {
    constructor(private readonly dbService: DatabaseService){}

    async loadAll(): Promise<AuthConfiguration[]> {
        const connection: Knex = await this.dbService.getConnection();
        const data: any[] = await knexnest(connection.select(
            [
                'id AS _id', 'auth_name AS _authName', 'auth_type AS _authType', 'provider_type AS _providerType',
                'auth_strategy_config AS _authConfig', 'redirectable AS _isRedirectable', 'in_site_credential AS _inSiteCredential',
                'active AS _isActive'
            ]
        ).from('external_auth_config').where({'active': true}));
        return plainToInstance(AuthConfiguration, data);
    }

    async loadById(id: number): Promise<AuthConfiguration> {
        const connection: Knex = await this.dbService.getConnection();
        const data = await knexnest(connection.select(
            [
                'id AS _id', 'auth_name AS _authName', 'auth_type AS _authType', 'provider_type AS _providerType',
                'auth_strategy_config AS _authConfig', 'redirectable AS _isRedirectable', 'in_site_credential AS _inSiteCredential',
                'active AS _isActive'
            ]
        ).from('external_auth_config').where({'active': true, 'id': id}));
        const configuration: any = data?.length > 0 ? data[0] : null;
        return plainToInstance(AuthConfiguration, configuration);
    }

    async loadProviderList(): Promise<any> {
        const connection: Knex = await this.dbService.getConnection();
        const data = await knexnest(connection.select(           [
            'id AS _id', 'auth_name AS _authName', 'auth_type AS _authType', 'provider_type AS _providerType',
            'auth_strategy_config AS _authConfig', 'redirectable AS _isRedirectable', 'in_site_credential AS _inSiteCredential',
            'active AS _isActive'
        ]).from('external_auth_config'));
        return data.length > 0 ? data : null;
    }

    async createExternalAuth(authConfigBody: AuthConfigurationDTO): Promise<number> {
        const connection: Knex = await this.dbService.getConnection();
        return connection.insert(instanceToPlain(authConfigBody)).into('external_auth_config')
          .returning('id').then(results => !!results ? results[0]?.id : null);
    }

    async updateExternalAuth(authConfigBody: AuthConfigurationDTO, authConfigId: number): Promise<boolean> {
      const connection: Knex = await this.dbService.getConnection();
        return connection
            .where('id', +authConfigId)
            .update(instanceToPlain(authConfigBody))
            .into('external_auth_config').then(rowsUpdated => rowsUpdated > 0);
    }
}
