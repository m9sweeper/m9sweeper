import {Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors} from '@nestjs/common';
import {AuthGuard} from '../../../guards/auth.guard';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {ApiKeyDto} from '../dto/api-key-dto';
import {ApiKeyService} from '../services/api-key.service';
import {AllowedAuthorityLevels} from '../../../decorators/allowed-authority-levels.decorator'
import {AuthorityGuard} from '../../../guards/authority.guard';
import {Authority} from '../../user/enum/Authority';
import {ALL_API_KEY_RESPONSE_SCHEMA, CREATE_API_KEY_RESPONSE_SCHEMA} from '../open-api-schema/api-key-schema';
import {AuditLogInterceptor} from "../../../interceptors/audit-log.interceptor";

@ApiTags('api-key')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class ApiKeyController {
    constructor(private readonly apiKeyService: ApiKeyService){}

    @Get()
    @ApiResponse({
        status: 200,
        schema: ALL_API_KEY_RESPONSE_SCHEMA
    })
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getAllApiKeys(@Query('sort') sort: {field: string; direction: string; }, @Query('page') page: number, @Query('limit') limit: number):
        Promise<{totalCount: number; list: ApiKeyDto[]}> {
        return await this.apiKeyService.getAllApiKeys(page, limit, sort);
    }

    @Post('')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CREATE_API_KEY_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async createApiKey(@Body() apiKeyDto: ApiKeyDto): Promise<{id: number, metadata: any}> {
        const previous = null;
        const newApiKeyIds = await this.apiKeyService.createApiKey(apiKeyDto);
        const newApiKey = (await this.apiKeyService.getApiKeyById(newApiKeyIds[0].id))[0];
        const metadata = await this.apiKeyService.calculateApiKeyMetadata(previous, newApiKey);
        return {id: newApiKeyIds[0].id, metadata: metadata};
    }

    @Get(':id')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_API_KEY_RESPONSE_SCHEMA
    })
    async getApiKeyById(@Param('id') id: number): Promise<ApiKeyDto> {
        return await this.apiKeyService.getApiKeyById(id);
    }

    @Delete(':id')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CREATE_API_KEY_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async deleteApiKeyById(@Param('id') id: number): Promise<{id: number, metadata: any}> {
        const previous = (await this.apiKeyService.getApiKeyById(id))[0];
        const deletedApiKey =  await this.apiKeyService.deleteApiKeyById(id);
        const metadata = await this.apiKeyService.calculateApiKeyMetadata(previous, null);
        return {id: deletedApiKey[0].id, metadata: metadata};
    }

    @Put(':id')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CREATE_API_KEY_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async updateApiKeyById( @Body() apiKeyDto: ApiKeyDto, @Param('id') id: number): Promise<ApiKeyDto> {
        const previous = (await this.apiKeyService.getApiKeyById(id))[0];
        await this.apiKeyService.updateApiKeyById(id, apiKeyDto);
        const updatedApiKey = (await this.apiKeyService.getApiKeyById(id))[0];
        updatedApiKey.metadata = await this.apiKeyService.calculateApiKeyMetadata(previous, updatedApiKey);
        return updatedApiKey;
    }
}
