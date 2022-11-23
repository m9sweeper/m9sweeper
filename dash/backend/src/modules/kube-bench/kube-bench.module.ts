import {Global, Module} from "@nestjs/common";
import {HttpModule} from "@nestjs/axios";
import {KubeBenchService} from "./services/kube-bench.service";
import {KubeBenchController} from "./controllers/kube-bench.controller";
import {KubeBenchDao} from "./dao/kube-bench-dao";


@Global()
@Module({
    providers: [
        KubeBenchService,
        KubeBenchDao
    ],
    exports: [
        KubeBenchService,
        KubeBenchDao
    ],
    imports: [HttpModule],
    controllers: [
        KubeBenchController
    ]
})
export class KubeBenchModule {}
