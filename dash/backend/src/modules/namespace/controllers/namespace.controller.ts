import {
    Controller,
    Get,
    Inject,
    Param,
    Query, UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { NamespaceDto } from '../dto/namespace-dto';
import { NamespaceService } from '../services/namespace.service';
import { ALL_NAMESPACES_RESPONSE_SCHEMA, COUNT_ALL_NAMESPACES_RESPONSE_SCHEMA } from '../open-api-schema/namespace-schema';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import {AllowedAuthorityLevels} from "../../../decorators/allowed-authority-levels.decorator";
import {Authority} from "../../user/enum/Authority";
import {AuthGuard} from "../../../guards/auth.guard";
import {AuthorityGuard} from "../../../guards/authority.guard";


@ApiTags('Namespaces')
@Controller()
@ApiBearerAuth('jwt-auth')
@UseInterceptors(ResponseTransformerInterceptor)
export class NamespaceController {
    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly namespaceService: NamespaceService) {}

    @Get()
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_NAMESPACES_RESPONSE_SCHEMA
    })
    async getAllNamespaces(@Query('clusterId') clusterId: number,
                           @Query('sort') sort?: {field: string; direction: string; },
                           @Query('page') page?: number, @Query('limit') limit?: number):
        Promise<NamespaceDto[]>{
        return await this.namespaceService.getAllNamespaces(clusterId,page, limit, sort);
    }

    @Get('current')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_NAMESPACES_RESPONSE_SCHEMA
    })
    async getDistinctNamespaces(): Promise<NamespaceDto[]> {
        return await this.namespaceService.getDistinctNamespaces();
    }

    @Get('/history')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_NAMESPACES_RESPONSE_SCHEMA
    })
    async getAllNamespacesBySelectedDate(@Query('clusterId') clusterId: number,
                                         @Query('startTime') startTime: string,
                                         @Query('endTime') endTime: string,
                                         @Query('limit') limit: number,
                                         @Query('page') page: number,
                                         @Query('sort') sort: {field: string; direction: string;}): Promise<NamespaceDto[]> {
        return await this.namespaceService.getAllNamespacesBySelectedDate(clusterId, startTime, endTime, page, limit, sort);
    }

    @Get(':clusterId/count')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: COUNT_ALL_NAMESPACES_RESPONSE_SCHEMA
    })
    async getCountOfCurrentNamespaces(@Param('clusterId') clusterId: number): Promise<number> {
        return await this.namespaceService.getCountOfCurrentNamespaces(clusterId);
    }

    @Get(':clusterId/history/count')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: COUNT_ALL_NAMESPACES_RESPONSE_SCHEMA
    })
    async getCountOfNamespaces(@Param('clusterId') clusterId: number,
                               @Query('startTime') startTime: string,
                               @Query('endTime') endTime: string): Promise<number> {
        return await this.namespaceService.getCountOfNamespaces(clusterId, startTime, endTime);
    }
}
