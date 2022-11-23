import {Body, Controller, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {KubesecService} from "../services/kubesec.service";
import {AllowedAuthorityLevels} from "../../../decorators/allowed-authority-levels.decorator";
import {Authority} from "../../user/enum/Authority";
import {AuthGuard} from "../../../guards/auth.guard";
import {AuthorityGuard} from "../../../guards/authority.guard";
import {FileInterceptor} from "@nestjs/platform-express";
import {Express} from 'express';
import {V1PodList} from "@kubernetes/client-node";
import {V1NamespaceList} from "@kubernetes/client-node/dist/gen/model/v1NamespaceList";

@Controller()
export class KubesecController {
    constructor(
        private readonly kubesecService: KubesecService,
    ) {}

    @Get('/listnamespaces')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    async listNamespaces(@Query('cluster') clusterId: number): Promise<V1NamespaceList> {
        return await this.kubesecService.listNamespaces(clusterId);
    }

    @Get('/listpods')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    async listPods(@Query('cluster') clusterId: number,
                   @Query('namespaces') namespaces: string[]): Promise<V1PodList[]> {
        if (namespaces) {
            return await this.kubesecService.listPods(clusterId, namespaces);
        } else {
            return [];
        }
    }

    @Post('/:clusterId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    async runKubesecForPod(@Param('clusterId') clusterId: number, @Body() podInfo: any) {
        const res = [];
        if(!Array.isArray(podInfo)) {
            return (await this.kubesecService.runKubesecByPod(podInfo.name, podInfo.namespace, clusterId)).data[0];
        }
        for (const info of podInfo) {
            res.push((await this.kubesecService.runKubesecByPod(info.name, info.namespace, clusterId)).data[0]);
        }
        return res;
    }

    @Post()
    @UseInterceptors(FileInterceptor('podFile'))
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    async runKubesecForFile(@UploadedFile() podFile: Express.Multer.File) {
        const res = await this.kubesecService.runKubesecByPodFile(podFile);
        return typeof(res) === "string" ? res : res.data[0];
    }
}
