import {Global, Module} from '@nestjs/common';
import {FalcoService} from './service/falco.service';
import {FalcoDao} from './dao/falco.dao';
import {FalcoController} from './controllers/falco.controller';

@Global()
@Module({
    providers: [
        FalcoDao,
        FalcoService
    ],
    exports: [
        FalcoDao,
        FalcoService
    ],
    controllers: [
        FalcoController
    ]
})
export class FalcoModule {}
