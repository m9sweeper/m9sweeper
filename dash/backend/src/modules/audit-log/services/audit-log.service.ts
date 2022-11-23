import { Injectable } from '@nestjs/common';
import {AuditLogDto} from "../dto/audit-log.dto";
import {AuditLogDao} from "../dao/audit-log.dao";
import {plainToInstance} from "class-transformer";
import {CsvService} from "../../shared/services/csv.service";
import {format} from "date-fns";
import {MineLoggerService} from "../../shared/services/mine-logger.service";

@Injectable()
export class AuditLogService {
    constructor(private readonly auditLogDao: AuditLogDao,
                private readonly csvService: CsvService,
                private loggerService: MineLoggerService
    ) {}

    async getAuditLogs(): Promise<AuditLogDto[]> {
        return this.auditLogDao.getAuditLogs();
    }

    async createAuditLog(auditLog: AuditLogDto): Promise<Array<{id: number}>> {
        delete auditLog.data?.password;
        delete auditLog.data?.pre?.password;
        delete auditLog.data?.post?.password;
        delete auditLog.data?.diff?.password;
        delete auditLog.data?.authDetails;
        delete auditLog.data?.pre?.authDetails;
        delete auditLog.data?.post?.authDetails;
        delete auditLog.data?.diff?.authDetails;
        delete auditLog.data?.api;
        delete auditLog.data?.pre?.api;
        delete auditLog.data?.post?.api;
        delete auditLog.data?.diff?.api;

        return this.auditLogDao.createAuditLog(auditLog)
            .then()
            .catch(error => {
                this.loggerService.log({label: 'cannot create audit log'}, error);
                return [];
            });
    }

    async calculateMetaData(previous: any, updated: any, entityName: string): Promise<AuditLogDto> {
        const metadata =  {};
        metadata['entity_type'] = entityName;
        metadata['entity_id'] = previous ? previous.id : updated.id;
        metadata['type'] = 'AuditLog';
        metadata['organization_id'] = 0;

        const audit_metadata = {};
        audit_metadata['pre'] = previous;
        audit_metadata['post'] = updated;
        audit_metadata['diff'] = this.calculateObjectDiff(previous, updated);

        audit_metadata['trace'] = null;
        audit_metadata['error'] = null;

        metadata['data'] = audit_metadata;

        const auditLog = plainToInstance(AuditLogDto, metadata);
        delete auditLog.fullName;
        return auditLog;
    }

    async getEntityTypes(): Promise<{ entityType: string }[]> {
        return this.auditLogDao.getEntityTypes()
            .then()
            .catch(error => {
                this.loggerService.log({label: 'cannot get entity type'}, error);
                return [];
            });
    }

    async filterAuditLogs(entityType: string, entityId: number): Promise<AuditLogDto[]> {
        return this.auditLogDao.filterAuditLogs(entityType, entityId)
            .then()
            .catch(error => {
                this.loggerService.log({label: 'cannot filter audit log'}, error);
                return [];
            });
    }

    async downloadAuditLogs(entityType: string, entityId: number): Promise<{filename: string, content: string}> {
        const auditLogs =  await this.auditLogDao.filterAuditLogs(entityType, entityId);
        const result = ['Id,Entity Type,Entity Id,Event Type, User,Metadata'];
        for(let auditLog of auditLogs) {
            const csvRow = this.csvService.buildLine([String(auditLog.id), auditLog.entityType, String(auditLog.entityId), auditLog.eventType, String(auditLog.fullName), JSON.stringify(auditLog.data)]);
            result.push(csvRow);
        }
        return {filename: `m9sweeper-audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`, content: result.join('\n')};
    }

    private
    calculateObjectDiff(previous, current) : any {
        let diff = {};
        // for a put request none of previous and current can be null
        if (previous && current) {
            diff = this.calculateDiff(JSON.parse(JSON.stringify(previous)), current);
        } else {
            /* for create and delete request:
                create: previous = null, current = valid object
                delete: previous = valid object, current = null
             */
            diff = current ;
        }
        return diff;
    }

    calculateDiff(pre, post): any {
        Object.keys(pre).forEach(key => {
            if (typeof pre[key] === 'object' && pre[key] !== null && !Array.isArray(pre[key])) {
                pre[key] = this.calculateDiff(pre[key], post[key]);
            } else if (Array.isArray(pre[key])) {
                if (pre[key].length !== post[key].length) {
                    pre[key] = {pre: pre[key], post: post[key]};
                } else {
                    for (let i = 0; i <  pre[key].length; i++) {
                        if (pre[key][i] !== post[key][i]) {
                            pre[key] = {pre: pre[key], post: post[key]};
                            break;
                        }
                    }
                }
            } else {
                if (pre[key] !== post[key]) {
                    pre[key] =  {pre: pre[key], post: post[key]};
                } else {
                    delete pre[key];
                }
            }
        });
        return pre;
    }

}
