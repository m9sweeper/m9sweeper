import { Global, Module } from '@nestjs/common';
import { K8sImageDao } from './dao/k8s-image.dao';
import { K8sImageService } from './services/k8s-image.service';
import { K8sImageController } from './controllers/k8s-image.controller';

@Global()
@Module({
    providers: [K8sImageDao, K8sImageService],
    exports: [
        K8sImageDao,
        K8sImageService
    ],
    controllers: [K8sImageController]
})

export class K8sImageModule {}
