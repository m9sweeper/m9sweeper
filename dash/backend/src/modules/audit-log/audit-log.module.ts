import { Global, Module } from '@nestjs/common';
import {AuditLogController} from "./controllers/audit-log.controller";
import {AuditLogService} from "./services/audit-log.service";
import {AuditLogDao} from "./dao/audit-log.dao";

@Global()
@Module({
    providers: [AuditLogDao, AuditLogService],
    exports: [
        AuditLogDao,
        AuditLogService
    ],
    controllers: [AuditLogController]
})

export class AuditLogModule {}
