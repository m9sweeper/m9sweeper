import { Injectable} from '@nestjs/common';
import { DatabaseService } from '../../shared/services/database.service';
import * as knexnest from 'knexnest';
import { ApiKeyDto } from '../dto/api-key-dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ApiKeyDao {
    constructor(private readonly databaseService: DatabaseService) {
    }

    async getCountApiKeys(searchClause: any): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const result = await knex('api_keys as a')
            .count('a.id', {as: 'count'})
            .leftJoin('users as u', function (){
                this.on('u.id', '=', 'a.user_id')
            })
            .where(searchClause)
            .returning('count');

        return (result && result[0] && result[0].count) ? result[0].count : 0;
    }

    async getAllApiKeys(searchClause: any, page = 0, limit = 10, sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}): Promise<ApiKeyDto[]> {
        const knex = await this.databaseService.getConnection();
        const sortFieldMap = {
            'id': 'a.id',
            'name': 'a.name',
            'username': `CONCAT(u.first_name, ' ', u.last_name)`,
            'isActive': 'a.is_active',
        };

        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';

        return await knexnest(knex
            .select(['a.id as _id', 'a.name as _name', 'u.first_name as _firstName','u.last_name as _lastName',
                'a.user_id as _userId', 'a.api as _api', 'a.is_active as _isActive'])
            .from('api_keys as a')
            .leftJoin('users as u', function (){
                this.on('u.id', '=', 'a.user_id')
            })
            .where(searchClause)
            .orderByRaw(`${sort.field} ${sort.direction}`)
            .limit(limit)
            .offset(page * limit))
            .then(data => plainToInstance(ApiKeyDto, data));
    }

    async createApiKey(apikey: any): Promise<{id: number}[]> {
        const knex = await this.databaseService.getConnection();
        return knex.insert(apikey).into('api_keys').returning(['id']);
    }


    async getUserInfoByApiKey(searchClause: any): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return await knexnest(knex
            .select(['u.id AS _id', 'u.first_name as _firstName', 'u.last_name as _lastName', 'u.email AS _email', 'u.phone AS _phone', 'u.is_active as _isActive', 'u.profile_image_file_id as _profileImageFileId',
                'u.source_system_id as _sourceSystem_id', 'u.source_system_type as _sourceSystem_type', 'u.source_system_user_id as _sourceSystem_uid',
                'authority_levels.id as _authorities__id', 'authority_levels.name as _authorities__type'])
            .from('api_keys as a')
            .leftJoin('users as u', function () {
                this.on('u.id', '=', 'a.user_id')
            })
            .leftJoin('user_authorities as user_auth', function () {
                this.on('u.id', '=', 'user_auth.user_id').andOn('user_auth.active', '=', knex.raw('?', [true]));
            }).leftJoin('authority_levels', function () {
                this.on('user_auth.authority_id', '=', 'authority_levels.id');
            })
            .where(searchClause))
            .then(data => data);
    }

    async getApiKeyById(id: number): Promise<ApiKeyDto> {
        const knex = await this.databaseService.getConnection();
        return await knexnest(knex
            .select(['a.id as _id', 'a.name as _name', 'u.first_name as _firstName','u.last_name as _lastName',
                'a.user_id as _userId', 'a.api as _api', 'a.is_active as _isActive'])
            .from('api_keys as a')
            .leftJoin('users as u', function () {
                this.on('u.id', '=', 'a.user_id')
            })
            .where('a.id', id)
            .orderBy('a.id', 'desc'))
            .then(apikey =>plainToInstance(ApiKeyDto, apikey));
    }

    async deleteApiKeyById(id: number): Promise<{id: number}[]> {
        const knex = await this.databaseService.getConnection();
        return knex('api_keys')
            .where('id', +id)
            .del().returning(['id']);
    }

    async updateApiKeyById(id: number, apiKey: any): Promise<{id: number}[]>{
        const knex = await this.databaseService.getConnection();
        apiKey.updated_at = knex.raw('getCurrentUnixTimestamp() * 1000');
        return knex
            .where('id', +id)
            .update(apiKey, ['id'])
            .into('api_keys');
    }

    async getApiKeyByUserEmail(reportType: string): Promise<ApiKeyDto[]> {
        const knex = await this.databaseService.getConnection();
        return knex
            .select('api_keys.api').from('api_keys')
            .leftJoin('users', 'users.id', 'api_keys.user_id')
            .where('users.email', '=', reportType).andWhere('api_keys.is_active', '=', true);
    }

}
