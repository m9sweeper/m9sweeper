import { Global, Module } from '@nestjs/common';
import { ImageDao } from './dao/image.dao';
import { ImageService } from './services/image.service';
import { ImageController } from './controllers/image.controller';
import { PolicyModule } from '../policy/policy.module';

@Global()
@Module({
    imports: [PolicyModule],
    providers: [
        ImageDao,
        ImageService
    ],
    exports: [
        ImageDao,
        ImageService
    ],
    controllers: [
        ImageController
    ]
})

export class ImageModule {
}
