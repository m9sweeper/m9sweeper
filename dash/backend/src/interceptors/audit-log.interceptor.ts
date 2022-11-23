import {CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor} from '@nestjs/common';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from "rxjs/operators";
import {UserProfileDto} from "../modules/user/dto/user-profile-dto";
import {AuditLogService} from "../modules/audit-log/services/audit-log.service";
import {AuditLogDto} from "../modules/audit-log/dto/audit-log.dto";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly auditLogService: AuditLogService) {
    }
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();
        const userId = this._loggedInUser.id;
        const eventType = req.method;
        return next.handle().pipe(map( response => {
                response.metadata.userId = userId;
                response.metadata.eventType = eventType;
                delete response.metadata.id;
                this.auditLogService.createAuditLog(response.metadata).then();
                delete response.metadata;
                return response;
            }),
        catchError(err => {
                console.log('error ............................');
                console.log(err);
                console.log('error ............................');
                const auditLog = new AuditLogDto();
                auditLog.entityType = err.response.entityType ?? 'Unknown';
                auditLog.entityId = err.response.entityId ?? 0;
                auditLog.eventType = eventType;
                auditLog.userId = userId;
                auditLog.data = { error: err.toString() };
                auditLog.organizationId = 1;
                auditLog.type = 'AuditLog';
                this.auditLogService.createAuditLog(auditLog).then();
                throw err;
            }
        ));
    }
}
