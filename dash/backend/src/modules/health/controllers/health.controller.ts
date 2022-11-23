import {
    Controller,
    Get,
    Inject,
    UseInterceptors
} from '@nestjs/common';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import { HealthService } from "../services/health.service";
import {ALL_HEALTH_RESPONSE_SCHEMA} from '../open-api-schema/health.schema';

@ApiTags('Health')

@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class HealthController {
    constructor( private readonly healthService: HealthService){}

    @Get()
    @ApiResponse({
        status: 201,
        schema: ALL_HEALTH_RESPONSE_SCHEMA
    })
    async getDatabaseStatus(): Promise<{postgres: string}> {
        return this.healthService.getDatabaseStatus();

    }
}
