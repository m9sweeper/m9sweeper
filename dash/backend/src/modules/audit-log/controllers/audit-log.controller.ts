import {Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors} from '@nestjs/common';
import {AuthGuard} from '../../../guards/auth.guard';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {AllowedAuthorityLevels} from '../../../decorators/allowed-authority-levels.decorator'
import {AuthorityGuard} from '../../../guards/authority.guard';
import {Authority} from '../../user/enum/Authority';
import {AuditLogService} from "../services/audit-log.service";
import {ALL_API_KEY_RESPONSE_SCHEMA} from "../open-api-schema/audit-log-schema";
import {AuditLogDto} from "../dto/audit-log.dto";

@ApiTags('audit-log')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService){}

    @Get()
    @ApiResponse({
        status: 200,
        schema: ALL_API_KEY_RESPONSE_SCHEMA
    })
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getAllAuditLogs(
        @Query('sort') sort: {field: string; direction: string; },
        @Query('page') page: number,
        @Query('limit') limit: number):
        Promise<AuditLogDto[]> {
        return await this.auditLogService.getAuditLogs();
    }

    @Get('/get-entity-types')
    @ApiResponse({
        status: 200,
        schema: ALL_API_KEY_RESPONSE_SCHEMA
    })
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getEntityTypes(): Promise<{ entityType: string }[]> {
        return await this.auditLogService.getEntityTypes();
    }

    @Get('/filter-audit-logs')
    @ApiResponse({
        status: 200,
        schema: ALL_API_KEY_RESPONSE_SCHEMA
    })
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async filterAuditLogs(
        @Query('entity_type') entityType: string,
        @Query('entity_id') entityId: number): Promise<AuditLogDto[]> {
        return await this.auditLogService.filterAuditLogs(entityType, entityId);
    }

    @Get('/download')
    @ApiResponse({
        status: 200,
        schema: ALL_API_KEY_RESPONSE_SCHEMA
    })
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async downloadAuditLogs(
        @Query('entity_type') entityType: string,
        @Query('entity_id') entityId: number): Promise<{filename: string, content: string}> {
        return await this.auditLogService.downloadAuditLogs(entityType, entityId);
    }
}
