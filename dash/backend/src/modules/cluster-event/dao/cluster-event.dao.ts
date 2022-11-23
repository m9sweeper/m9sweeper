import {Injectable} from '@nestjs/common';
import * as knexnest from 'knexnest';
import {plainToInstance} from 'class-transformer';
import {DatabaseService} from '../../shared/services/database.service';
import {ClusterEventDto} from '../dto/cluster-event-dto';

@Injectable()
export class ClusterEventDao {
    constructor(private readonly databaseService: DatabaseService) {}

    async createClusterEvent(clusterEvent: any): Promise<{id: number}[]> {
        const knex = await this.databaseService.getConnection();
            return knex.insert(clusterEvent).into('audit_logs').returning(['id']);
    }

    async getAllClusterEvents(offset: number, limit: number, clusterId: number): Promise<ClusterEventDto[]>{
        const knex = await this.databaseService.getConnection();
        return await knexnest(knex
            .select([
                'al.id as _id',
                'al.organization_id as _organizationId',
                'al.entity_type as _entityType',
                'al.entity_id as _entityId',
                'al.created_date as _createdDate',
                'al.type as _type',
                'al.level as _level',
                'al.description as _description',
                'al.data as _data'
            ])
            .from('audit_logs as al')
            .where({
                'al.entity_id': clusterId
            })
            .whereNot({'al.type': 'AuditLog'})
            .offset(offset).limit(limit)
            .orderBy('al.created_date', 'desc'))
            .then( clusterEvents => plainToInstance(ClusterEventDto, clusterEvents));
    }
}
