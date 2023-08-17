import {BadRequestException, Controller, Get, Inject, Param, Query, UseGuards, UseInterceptors} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { PodDto } from '../dto/pod-dto';
import { PodService } from '../services/pod.service';
import {ALL_PODS_RESPONSE_SCHEMA, COUNT_PODS_RESPONSE_SCHEMA} from '../open-api-schema/pod-schema';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import {AllowedAuthorityLevels} from "../../../decorators/allowed-authority-levels.decorator";
import {Authority} from "../../user/enum/Authority";
import {AuthGuard} from "../../../guards/auth.guard";
import {AuthorityGuard} from "../../../guards/authority.guard";
import { PodComplianceSummaryDto } from '../dto/pod-compliance-summary-dto';
import { GatekeeperService } from '../../gatekeeper/services/gatekeeper.service';

@ApiTags('Pods')
@Controller()
@ApiBearerAuth('jwt-auth')
@UseInterceptors(ResponseTransformerInterceptor)
export class PodController {
    constructor(
      @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
      private readonly podService: PodService,
      private readonly gatekeeperService: GatekeeperService,
    ) {}

    @Get()
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_PODS_RESPONSE_SCHEMA
    })
    async getAllPods(
      @Query('clusterId') clusterId: number,
      @Query('namespace') namespace: string,
      @Query('limit') limit?: number,
      @Query('page') page?: number,
      @Query('sort') sort?: {field: string; direction: string; },
    ): Promise<PodDto[]>{
        const violations = await this.gatekeeperService.getTotalViolations(clusterId);
        const pods =  await this.podService.getAllPods(clusterId, namespace, sort, page, limit);
        if (pods && pods.length) {
            pods.map(p => p.violations = violations.filter(v => v.name === p.name));
        }
        return pods;
    }

    @Get('/count')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: COUNT_PODS_RESPONSE_SCHEMA,
    })
    async countAllPods(
      @Query('clusterId') clusterId: number,
      @Query('namespace') namespace: string,
    ): Promise<number> {
        return await this.podService.countAllPods(clusterId, namespace);
    }

    @Get('/history')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_PODS_RESPONSE_SCHEMA
    })
    async getPodsByDate(
      @Query('clusterId') clusterId: number,
      @Query('namespace') namespace: string,
      @Query('startTime') startTime: string,
      @Query('endTime') endTime: string,
      @Query('limit') limit?: number,
      @Query('page') page?: number,
      @Query('sort') sort?: {field: string; direction: string; },
    ): Promise<PodDto[]>{
        return await this.podService.getPodsByDate(clusterId, namespace, startTime, endTime, sort, page, limit);
    }

    @Get('/history/count')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: COUNT_PODS_RESPONSE_SCHEMA,
    })
    async countPodsByDate(
      @Query('clusterId') clusterId: number,
      @Query('namespace') namespace: string,
      @Query('startTime') startTime: string,
      @Query('endTime') endTime: string,
    ): Promise<number> {
        return await this.podService.countPodsByDate(clusterId, namespace, startTime, endTime);
    }



    @Get(':podIdentifier/history')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
    })
    async getHistoricalSinglePodByName(
      @Param('podIdentifier') podIdentifier: string,
      @Query('clusterId') clusterId: number,
      @Query('namespace') namespace: string,
      @Query('startTime') startTime: string,
      @Query('endTime') endTime: string,
    ): Promise<PodDto> {
        return await this.podService.getHistoricalPodByName(clusterId, namespace, podIdentifier, startTime, endTime);
    }

    @Get('/search')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_PODS_RESPONSE_SCHEMA
    })
    async getAllPodsBySelectedDate(
      @Query('clusterId') clusterId: number, @Query('namespace') namespace: string,
      @Query('startTime') startTime: number, @Query('endTime') endTime: number,
    ): Promise<PodDto[]> {
        if (!clusterId || !namespace || !startTime || !endTime) {
            throw new BadRequestException('Please include the clusterId, namespace, startTime, and endTime in the request');
        }
        return await this.podService.getAllPodsBySelectedDate(clusterId, namespace, startTime, endTime);
    }

    @Get('/summary')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200
    })
    async getPodsComplianceSummary(
      @Query('clusterId') clusterId: number): Promise<PodComplianceSummaryDto[]> {
        return await this.podService.getPodsComplianceSummary(clusterId);
    }

    @Get(':podIdentifier')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
    })
    async getSinglePod(
      @Param('podIdentifier') podIdentifier: string | number,
      @Query('clusterId') clusterId: number,
      @Query('namespace') namespace: string,
    ): Promise<PodDto> {
        const violations = await this.gatekeeperService.getTotalViolations(clusterId);
        let pod = null;
        if (typeof(podIdentifier) === 'number') {
            pod = await this.podService.getPodById(podIdentifier);
        } else {
            pod = await this.podService.getPodByName(clusterId, namespace, podIdentifier);
        }
        pod.violations = violations.filter(v => v.name === pod.name);
        return pod;
    }
}
