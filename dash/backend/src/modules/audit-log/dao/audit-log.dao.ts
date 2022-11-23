import { Injectable} from '@nestjs/common';
import { DatabaseService } from '../../shared/services/database.service';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {AuditLogDto} from '../dto/audit-log.dto';

/**
 * Access to the audit logs table in the DB. Note, the audit logs table is used to store cluster events as well as
 * audit logs themselves, which results in some inconsistencies between stored data types
 * */
@Injectable()
export class AuditLogDao {
    constructor(private readonly databaseService: DatabaseService) {}

    async getAuditLogs(): Promise<AuditLogDto[]> {
        const knex = await this.databaseService.getConnection();
        const query = knex
            .select([
                'al.id',
                'al.entity_type',
                'al.entity_id',
                'al.data',
                'al.event_type',
                knex.raw(`CONCAT(u.first_name, ' ', u.last_name) as full_name`
                )])
            .from('audit_logs as al')
            .leftJoin(`users as u`, function (){
                this.on(`u.id`, `=`, `al.user_id`)
            })
            .where('al.type', 'AuditLog')
            .orderBy('al.id', 'desc');
        return query.then(data => {
            return plainToInstance(AuditLogDto, data);
        })
    }

    async createAuditLog(auditLog: AuditLogDto): Promise<Array<{id: number}>> {
        const knex = await this.databaseService.getConnection();
        return knex.insert(instanceToPlain(auditLog)).into('audit_logs').returning(['id']);
    }

    async getEntityTypes(): Promise<{ entityType: string }[]> {
        const data =[{entityType:"Account"},
                    {entityType:"ApiKey"},
                    {entityType:"Batch Job"},
                    {entityType:"Cluster"},
                    {entityType:"Cluster Pod Compliance"},
                    {entityType:"Cluster Validation"},
                    {entityType:"DockerRegistry"},
                    {entityType:"Exception"},
                    {entityType:"Image Scan"},
                    {entityType:"Kubernetes Image History"},
                    {entityType:"License Validation"},
                    {entityType:"Policy"},
                    {entityType:"Unknown"}
            ];
        return data;
    }

    async filterAuditLogs(entityType: string, entityId: number): Promise<AuditLogDto[]> {
        const knex = await this.databaseService.getConnection();
        let query = knex
            .select(['al.id', 'al.entity_type', 'al.entity_id', 'al.data', 'al.event_type',
                knex.raw(`to_timestamp(al.created_at/1000) as created_at`),
                knex.raw(`CONCAT(u.first_name, ' ', u.last_name) as full_name`)])
            .from('audit_logs as al')
            .leftJoin(`users as u`, function (){
                this.on(`u.id`, `=`, `al.user_id`)
            });
        if (entityType && entityType !== 'null') {
            query = query.andWhere('al.entity_type', entityType);
        }
        if (entityId) {
            query = query.andWhere('al.entity_id', entityId);
        }
        query = query.orderBy('al.id', 'desc');

        return query.then(data => {
            return plainToInstance(AuditLogDto, data);
        });
    }
}
