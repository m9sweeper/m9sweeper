import {Controller, Get, Inject, Query, UseGuards, UseInterceptors} from '@nestjs/common';
import {ApiBearerAuth, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { DeploymentDto } from '../dto/deployment-dto';
import { DeploymentService } from '../services/deployment.service';
import {
    ALL_DEPLOYMENTS_RESPONSE_SCHEMA,
    COUNT_ALL_DEPLOYMENT_RESPONSE_SCHEMA, DEPLOYMENT_SUMMARY_RESPONSE_SCHEMA
} from '../open-api-schema/deployment-schema';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import {AllowedAuthorityLevels} from "../../../decorators/allowed-authority-levels.decorator";
import {Authority} from "../../user/enum/Authority";
import {AuthGuard} from "../../../guards/auth.guard";
import {AuthorityGuard} from "../../../guards/authority.guard";

@ApiTags('Deployments')
@Controller()
@ApiBearerAuth('jwt-auth')
@UseInterceptors(ResponseTransformerInterceptor)
export class DeploymentController {
    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly deploymentService: DeploymentService) {}

    @Get()
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_DEPLOYMENTS_RESPONSE_SCHEMA
    })
    async getAllDeployments(@Query('clusterId') clusterId: number,
                            @Query('namespace') namespace: string,
                            @Query('limit') limit: number,
                            @Query('page') page: number,
                            @Query('sort') sort: {field: string; direction: string; }):
        Promise<DeploymentDto[]>{
        return await this.deploymentService.getAllDeployments(clusterId, namespace, page, limit, sort);
    }

    @Get('/history')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_DEPLOYMENTS_RESPONSE_SCHEMA
    })
    async getAllDeploymentsBySelectedDate(@Query('clusterId') clusterId: number,
                                          @Query('namespace') namespace: string,
                                          @Query('startTime') startTime: string,
                                          @Query('endTime') endTime: string,
                                          @Query('limit') limit: number,
                                          @Query('page') page: number,
                                          @Query('sort') sort: {field: string; direction: string; }):
        Promise<DeploymentDto[]> {
        return await this.deploymentService.getAllDeploymentsBySelectedDate(clusterId, namespace, startTime, endTime, page, limit, sort);
    }

    @Get('/count')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: COUNT_ALL_DEPLOYMENT_RESPONSE_SCHEMA
    })
    async getCountOfCurrentDeployments(@Query('clusterId') clusterId: number,
                                       @Query('namespace') namespace: string): Promise<number>{
        return await this.deploymentService.getCountOfCurrentDeployments(clusterId, namespace);
    }

    @Get('/history/count')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: COUNT_ALL_DEPLOYMENT_RESPONSE_SCHEMA
    })
    async getCountOfDeployments(@Query('clusterId') clusterId: number,
                                          @Query('namespace') namespace: string,
                                          @Query('startTime') startTime: string,
                                          @Query('endTime') endTime: string): Promise<number> {
        return await this.deploymentService.getCountOfDeployments(clusterId, namespace, startTime, endTime);
    }

    @Get('/summary')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: DEPLOYMENT_SUMMARY_RESPONSE_SCHEMA
    })
    @ApiQuery({name : 'clusterId', style: "form", type: [Number]})
    async getCountOfDeploymentByComplaintStatus(@Query('filters') filters: {clusterId: number[]}): Promise<{count: number, compliant: boolean}[]> {
        return await this.deploymentService.getCountOfDeploymentByComplaintStatus(filters);
    }
}
