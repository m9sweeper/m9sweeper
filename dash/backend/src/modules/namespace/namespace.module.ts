import { Global, Module } from '@nestjs/common';
import { NamespaceDao } from './dao/namespace.dao';
import { NamespaceService } from './services/namespace.service';
import { NamespaceController } from './controllers/namespace.controller';
import { NamespaceComplianceService } from './services/namespace_compliance.service';

@Global()
@Module({
    providers: [NamespaceDao, NamespaceService, NamespaceComplianceService],
    exports: [
        NamespaceDao,
        NamespaceService,
        NamespaceComplianceService
    ],
    controllers: [NamespaceController]
})

export class NamespaceModule {}