import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../shared/services/database.service';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import * as knexnest from 'knexnest';
import { ClusterGroupDto } from '../dto/cluster-group-dto';

@Injectable()
export class ClusterGroupDao {
    constructor(private databaseService: DatabaseService) {}

    async getClusterGroupById(id: number): Promise<ClusterGroupDto> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                'cg.id as _id',
                'cg.name as _name',
                'cg.user_id as _userId' ])
            .from('cluster_group as cg')
            .where('cg.id', id)
            .andWhere('cg.deleted_at', null)
        )
            .then(clusterGroup => plainToInstance(ClusterGroupDto, clusterGroup?.[0]));
    }

    async getClusterGroups(): Promise<ClusterGroupDto[]> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                'cg.id as _id',
                'cg.name as _name',
                'cg.user_id as _userId'
            ])
            .from('cluster_group as cg')
            .where('cg.deleted_at', null)
            .orderBy('cg.id', 'desc'))
            .then(clusterGroups => plainToInstance(ClusterGroupDto, clusterGroups));
    }

    async countClusterGroups(): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex
            .count('cg.id')
            .from('cluster_group as cg')
            .then((res: { count: string }[]) => res[0]?.count ? +res[0].count : 0);

    }

    async getClusterGroupBYClusterGroupName(searchClause: any): Promise<any>{
        const knex = await this.databaseService.getConnection();
        const query = knex.select(['name', 'id'])
            .from('cluster_group')
            .where(searchClause);
        return query;
    }

    async createClusterGroup(clusterGroup: ClusterGroupDto): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex.insert(instanceToPlain(clusterGroup)).into('cluster_group')
          .returning('id').then((results) => results ? results[0]?.id : null);
    }

    async updateClusterGroup(clusterGroup: ClusterGroupDto, id: number): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const clusterGroupToPlain = instanceToPlain(clusterGroup);
        return knexnest(knex
            .where('id', +id)
            .update(clusterGroupToPlain, ['id'])
            .into('cluster_group'))
            .then(data => data.id);

    }

    /**
    Count all cluster by group_id
     */
    async countAllClusterByGroupId(id: number): Promise<any>{
        const knex = await this.databaseService.getConnection();
      return knex.count('id').from('clusters').where('group_id', id).andWhere('deleted_at', null);
    }

    /**
     * Deletes a cluster Group. Requires all clusters in the group to be deleted.
     */
    async deleteClusterGroupById(id: number): Promise<number> {
        const knex = await this.databaseService.getConnection();

            // 'Delete' cluster group by setting its deleted_at column to current time
            const current_time = Math.round((new Date()).getTime());
            return knex.from('cluster_group')
                .update('deleted_at', current_time)
                .where('id', id)
              .returning(['id']).then(results => !!results ? results[0]?.id : null);
    }
}
