import {BadRequestException, Controller, Get, Inject, Param, Query, UseGuards, UseInterceptors} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { K8sImageDto } from '../dto/k8s-image-dto';
import { K8sImageService } from '../services/k8s-image.service';
import { ALL_K8S_IMAGES_RESPONSE_SCHEMA, COUNT_K8S_IMAGES_RESPONSE_SCHEMA } from '../open-api-schema/k8s-image-schema';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import {AllowedAuthorityLevels} from "../../../decorators/allowed-authority-levels.decorator";
import {Authority} from "../../user/enum/Authority";
import {AuthGuard} from "../../../guards/auth.guard";
import {AuthorityGuard} from "../../../guards/authority.guard";

@ApiTags('K8sImages')
@Controller()
@ApiBearerAuth('jwt-auth')
@UseInterceptors(ResponseTransformerInterceptor)
export class K8sImageController {
    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly k8sImageService: K8sImageService) {}

    @Get()
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_K8S_IMAGES_RESPONSE_SCHEMA
    })
    async getAllK8sImages(@Query('clusterId') clusterId: number,
                          @Query('namespace') namespace: string,
                          @Query('deployment') deployment: string,
                          @Query('limit') limit: number,
                          @Query('page') page: number,
                          @Query('sort') sort: {field: string; direction: string; }): Promise<K8sImageDto[]> {
        return await this.k8sImageService.getAllK8sImages(clusterId, namespace, deployment, page, limit, sort);
    }

    @Get('/history')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_K8S_IMAGES_RESPONSE_SCHEMA
    })
    async getAllK8sImagesBySelectedDate(@Query('clusterId') clusterId: number,
                                        @Query('namespace') namespace: string,
                                        @Query('deployment') deployment: string,
                                        @Query('startTime') startTime: string,
                                        @Query('endTime') endTime: string,
                                        @Query('limit') limit: number,
                                        @Query('page') page: number,
                                        @Query('sort') sort: {field: string; direction: string; }): Promise<K8sImageDto[]> {
        return await this.k8sImageService.getAllK8sImagesBySelectedDate(clusterId, namespace, deployment, startTime, endTime, page, limit, sort);
    }

    @Get('/count')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: COUNT_K8S_IMAGES_RESPONSE_SCHEMA
    })
    async getCountOfCurrentImages(@Query('clusterId') clusterId: number,
                                  @Query('namespace') namespace: string,
                                  @Query('deployment') deployment: string): Promise<number> {
        return await this.k8sImageService.getCountOfCurrentImages(clusterId, namespace, deployment);
    }

    @Get('/history/count')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: COUNT_K8S_IMAGES_RESPONSE_SCHEMA
    })
    async getCountOfImages(@Query('clusterId') clusterId: number,
                           @Query('namespace') namespace: string,
                           @Query('deployment') deployment: string,
                           @Query('startTime') startTime: string,
                           @Query('endTime') endTime: string): Promise<number> {
        return await this.k8sImageService.getCountOfImages(clusterId, namespace, deployment, startTime, endTime);
    }
}
