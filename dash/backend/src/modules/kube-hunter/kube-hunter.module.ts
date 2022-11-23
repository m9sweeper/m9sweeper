import { Global, Module } from '@nestjs/common';
import {HttpModule} from "@nestjs/axios";
import {KubeHunterController} from "./controllers/kube-hunter.controller";
import { KubeHunterService } from './service/kube-hunter.service';
import {KubeHunterDao} from "./dao/kube-hunter.dao";

@Global()
@Module({
    providers: [
        KubeHunterService,
        KubeHunterDao,
    ],
    exports: [
        KubeHunterService,
        KubeHunterDao,
    ],
    imports: [HttpModule],
    controllers: [
        KubeHunterController
    ]
})
export class KubeHunterModule {}
