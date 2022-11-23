import {Global, Module} from '@nestjs/common';
import {KubesecService} from "./services/kubesec.service";
import {KubesecController} from "./controllers/kubesec.controller";
import {HttpModule} from "@nestjs/axios";

@Global()
@Module({
    providers: [
        KubesecService
    ],
    exports: [
        KubesecService
    ],
    imports: [HttpModule],
    controllers: [
        KubesecController
    ]
})
export class KubesecModule {}
