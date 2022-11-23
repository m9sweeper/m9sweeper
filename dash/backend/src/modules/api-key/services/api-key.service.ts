import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ApiKeyDto } from '../dto/api-key-dto';
import { ApiKeyDao } from '../dao/api-key.dao';
import { instanceToPlain } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import {AuditLogService} from "../../audit-log/services/audit-log.service";

@Injectable()
export class ApiKeyService {
    private readonly entityType: string = 'ApiKey';
    constructor(private readonly apiKeyDao: ApiKeyDao,
                private readonly auditLogService: AuditLogService) {}

    async getAllApiKeys(page: number = 0, limit: number = 10, sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}): Promise<{totalCount: number; list: ApiKeyDto[]}> {
        const searchClause = {};
        const totalCount = await this.apiKeyDao.getCountApiKeys(searchClause);
        const listData = await this.apiKeyDao.getAllApiKeys(searchClause, page, limit, sort);
        return {totalCount: +totalCount, list: listData};
    }

    async createApiKey(apiKey: ApiKeyDto): Promise<{id: number}[]> {
        const searchClause = {
            'a.user_id': apiKey.userId
        };
        const  checkUserApiToken = await this.apiKeyDao.getAllApiKeys(searchClause);
        if(checkUserApiToken){
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                message: 'This is user api key already exists.',
                entityType: this.entityType
            }, HttpStatus.NOT_FOUND)
        }
        apiKey.api = await bcrypt.hash(`${Date.now()}-${apiKey.userId}-${apiKey.name}`, await bcrypt.genSalt(10));
        return await this.apiKeyDao.createApiKey(instanceToPlain(apiKey));
    }

    async getApiKeyDetailsByApiKey(apiKey: string): Promise<ApiKeyDto>{
        const searchClause = {
            'a.is_active': true,
            'a.api': apiKey
        };
        const result =  await this.apiKeyDao.getAllApiKeys(searchClause);
        return result[0];
    }


    async getUserInfoByApiKey(apiKey: string): Promise<any>{
        const searchClause = {
            'a.is_active': true,
            'a.api': apiKey
        };
        const result: any =  await this.apiKeyDao.getUserInfoByApiKey(searchClause);
        return result[0];
    }

    async getApiKeyById(id: number): Promise<ApiKeyDto> {
        return await this.apiKeyDao.getApiKeyById(id);
    }

    async deleteApiKeyById(id: number): Promise<{id: number}[]> {
        return await this.apiKeyDao.deleteApiKeyById(id);
    }

    async updateApiKeyById(id: number, apiKey: ApiKeyDto): Promise<{id: number}[]> {
        return await this.apiKeyDao.updateApiKeyById(id, instanceToPlain(apiKey));
    }

     async calculateApiKeyMetadata(previous: ApiKeyDto, updated: ApiKeyDto): Promise<any> {
        return await this.auditLogService.calculateMetaData(previous, updated, 'ApiKey');
    }

    async getApiKeyByUserEmail(reportType: string): Promise<ApiKeyDto[]> {
        return await this.apiKeyDao.getApiKeyByUserEmail(reportType);
    }
}
