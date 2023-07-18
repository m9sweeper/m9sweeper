import {Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards} from '@nestjs/common';
import {QuotedBody} from "../../../decorators/quoted-body.decorator";
import {KubeHunterService} from "../service/kube-hunter.service";
import {KubeHunterDto} from "../dto/kube-hunter-dto";
import {uuid} from "uuidv4";
import {UserDao} from "../../user/dao/user.dao";
import {AuthService} from "../../auth/services/auth.service";
import {AuthorityId} from "../../user/enum/authority-id";
import {ApiResponse} from "@nestjs/swagger";
import {AllowedAuthorityLevels} from "../../../decorators/allowed-authority-levels.decorator";
import {Authority} from "../../user/enum/Authority";
import {AuthGuard} from "../../../guards/auth.guard";
import {AuthorityGuard} from "../../../guards/authority.guard";
import {ApiKeyDto} from "../../api-key/dto/api-key-dto";
import {ApiKeyDao} from "../../api-key/dao/api-key.dao";
import {query} from "express";
import { MineLoggerService } from '../../shared/services/mine-logger.service';


@Controller()
export class KubeHunterController {
    constructor(
        private readonly kubeHunterService: KubeHunterService,
        private readonly userDao: UserDao,
        private readonly authService: AuthService,
        private readonly apiKeyDao: ApiKeyDao,
      private logger: MineLoggerService,
    ) {}

    @Post('hunter/:clusterId')
    @ApiResponse({
        status: 201,
    })
    async saveKubeHunterReport(@QuotedBody() report: any, @Param('clusterId') clusterId: number, @Query('key') key: string): Promise<any> {

        // find user authority by user's apikey
        const currentUserAuthObj = await this.userDao.loadUserByApiKey(key);
        if (!currentUserAuthObj || !this.authService.checkAuthority(currentUserAuthObj[0].authorities, [AuthorityId.KUBEHUNTER])) {
            this.logger.log({label: 'User is unauthorized; skip saving KH scan report', data: { clusterId }}, 'KubeHunterController.saveKubeHunterReport');
            throw new HttpException('Unauthorized  - log may not have been saved', HttpStatus.UNAUTHORIZED);
        }

        this.logger.log({label: 'User has been authorized; saving KH scan report', data: { clusterId }}, 'KubeHunterController.saveKubeHunterReport');
        const reportAsDto = Object.assign(new KubeHunterDto(), report);
        reportAsDto.uuid = uuid();
        reportAsDto.clusterId = clusterId;
        const newEntry = await this.kubeHunterService.saveKubeHunterReport(reportAsDto);
        if (!newEntry || newEntry.length == 0) throw new HttpException('Internal Server error - log may not have been saved', HttpStatus.INTERNAL_SERVER_ERROR);
        return newEntry[0];
    }

    @Get('/apiKey')
    @AllowedAuthorityLevels( Authority.SUPER_ADMIN, Authority.ADMIN )
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201
    })
    async getApiKey(): Promise<ApiKeyDto[]> {
        const apiKeyKH = await this.apiKeyDao.getApiKeyByUserEmail('Kubehunter');
        if (!apiKeyKH) throw new HttpException(`KH APi key ${apiKeyKH} not found`, HttpStatus.NOT_FOUND);
        return apiKeyKH;
    }

    @Get('/:id')
    async getKubeHunterReportById(@Param('id') id: string): Promise<KubeHunterDto> {
        return await this.kubeHunterService.getKubeHunterReportById(+id);
    }

    @Get('/cluster/:clusterId')
    async getAllReportsForCluster(@Param('clusterId') clusterId: number, @Query('page') page?: number, @Query('limit') limit?: number):
        Promise<{reportCount: number, list: KubeHunterDto[]}> {
        return this.kubeHunterService.getAllReportsForCluster(clusterId, page, limit);
    }

    @Get('/cluster/:clusterId/recent')
    async getRecentReportsForCluster(@Param('clusterId') clusterId: number, @Query('minDate') minDate: number): Promise<KubeHunterDto> {
        return await this.kubeHunterService.getRecentKubeHunterReportForCluster(clusterId, minDate);
    }
}
