import {Body, Controller, Get, InternalServerErrorException, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
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
        return await this.kubesecService.listNamespaces(clusterId).catch((err) => {
            console.log(err);
            throw new InternalServerErrorException();
        });
    }

    @Get('/listpods')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    async listPods(
      @Query('cluster') clusterId: number,
      @Query('namespaces') namespaces: string[]
    ): Promise<(V1PodList | object)[]> {
        if (namespaces) {
            // remove "selectAll" (it's not a namespace, it's a value that tells it to return all ns)
            const index = namespaces.indexOf("selectAll");
            if (index !== -1) {
                namespaces.splice(index, 1);
            }

            const response =  await this.kubesecService.listPods(clusterId, namespaces);
            if (response.errors.length) {
              console.log({ method: "KubesecController.listPods", errors: response.errors });
            }
            return response.podList;
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
            res.push(this.kubesecService.runKubesecByPod(info.name, info.namespace, clusterId).then(result => result.data[0]));
        }
        return await Promise.all(res);
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
