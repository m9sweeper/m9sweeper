import { Global, Module } from '@nestjs/common';
import { ApiKeyDao } from './dao/api-key.dao';
import { ApiKeyService } from './services/api-key.service';
import { ApiKeyController } from './controllers/api-key.controller';

@Global()
@Module({
    providers: [ApiKeyDao, ApiKeyService],
    exports: [
        ApiKeyDao,
        ApiKeyService
    ],
    controllers: [ApiKeyController]
})

export class ApiKeyModule {}
