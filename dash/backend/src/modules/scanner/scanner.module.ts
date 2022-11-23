import { Global, Module } from '@nestjs/common';
import { ScannerDao } from './dao/scanner.dao';
import { ScannerService } from './services/scanner.service';
import { ScannerController } from './controllers/scanner.controller';

@Global()
@Module({
    providers: [ScannerDao, ScannerService],
    exports: [
        ScannerDao,
        ScannerService
    ],
    controllers: [ScannerController]
})

export class ScannerModule {}
