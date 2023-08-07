import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../shared/services/database.service';
import * as knexnest from 'knexnest';
import { ClusterDto } from '../dto/cluster-dto';
import { HistoryClusterDto } from '../dto/history-cluster-dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Knex } from "knex";
import {PolicyDto} from "../../policy/dto/policy-dto";
import {ScannerDto} from "../../scanner/dto/scanner-dto";
import { MineLoggerService } from '../../shared/services/mine-logger.service';

@Injectable()
export class ClusterDao {
    constructor(
      private readonly databaseService: DatabaseService,
      private logger: MineLoggerService,
    ) {}

    async createCluster(cluster: any): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex.insert(cluster).into('clusters').returning('id').then(clusterId => clusterId[0].id);
    }

    async getClusterByClusterName(searchClause: any, id?: number): Promise<ClusterDto[]>{
        const knex = await this.databaseService.getConnection();
        const query = knex
            .select(['c.id as _id', 'c.name as _name', 'c.ip_address as _ipAddress', 'c.port as _port',
              'c.context as _context', 'c.tags as _tags', 'c.group_id as _groupId',
              'c.is_enforcement_enabled as _isEnforcementEnabled', 'c.kube_config as _kubeConfig',
              'c.is_image_scanning_enforcement_enabled as _isImageScanningEnforcementEnabled',
              'c.grace_period_days as _gracePeriodDays'])
            .from('clusters as c')
            .orderBy('c.id', 'desc');

        if(searchClause){
            query.where(searchClause);
        }
        if(id){
            query.whereNot('c.id', +id);
        }
        return knexnest(query).then(result => plainToInstance(ClusterDto, result));
    }

  async getClustersById(ids: number[]): Promise<ClusterDto[]> {
    const knex = await this.databaseService.getConnection();
    return (knex
      .select([
        'c.id as id', 'c.name as name', 'c.ip_address as ipAddress',
        'c.port as port', 'c.context as context', 'c.tags as tags',
        'c.created_at as createdAt', 'c.kube_config as kubeConfig',
        'c.context as context',
        'c.updated_at as updatedAt', 'c.grace_period_days as gracePeriodDays',
        'cg.id as group_id', 'cg.name as group_name',
        'c.is_enforcement_enabled as isEnforcementEnabled',
        'c.is_image_scanning_enforcement_enabled as isImageScanningEnforcementEnabled',
      ])
      .from('clusters as c')
      .innerJoin('cluster_group as cg', function () {
        this.on('cg.id', '=', 'c.group_id');
      })
      .where({'c.deleted_at': null, 'cg.deleted_at': null})
      .whereIn('c.id', ids)
      .orderBy('c.id', 'desc'))
      .then((data) => {
        const newInstance = plainToInstance(ClusterDto, data);
        this.logger.log({label: 'Got clusters by id', data: { ids, data, newInstance }}, 'ClusterDao.getClustersById');
        return newInstance;
      });
  }

    async getClusterById(id: number): Promise<ClusterDto> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select(['c.id as _id', 'c.name as _name', 'c.ip_address as _ipAddress', 'c.port as _port',
                'c.context as _context', 'c.tags as _tags', 'c.group_id as _groupId',
                'c.is_enforcement_enabled as _isEnforcementEnabled', 'c.kube_config as _kubeConfig',
                'c.is_image_scanning_enforcement_enabled as _isImageScanningEnforcementEnabled',
                'c.grace_period_days as _gracePeriodDays'])
            .from('clusters AS c')
            .where('c.id', id)
            .andWhere('c.deleted_at', null)
            .orderBy('id', 'desc'))
            .then(result => plainToInstance(ClusterDto, result[0]));
    }

    async getClustersByGroupId(id: number): Promise<ClusterDto[]> {
        const knex = await this.databaseService.getConnection();
        return (knex
            .select(['c.id as id', 'c.name as name', 'c.ip_address as ipAddress', 'c.port as port',
                'c.context as context', 'c.tags as tags', 'c.kube_config as _kubeConfig',
                'c.grace_period_days as gracePeriodDays', 'c.last_scanned_at as lastScannedAt'])
            .from('clusters as c')
            .where({group_id: id})
            .where('deleted_at', null)
            .orderBy('id', 'desc'))
            .then(data => plainToInstance(ClusterDto, data))
    }

    async getAllClusters(): Promise<ClusterDto[]> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                'c.id as _id', 'c.name as _name', 'c.ip_address as _ipAddress',
                'c.port as _port', 'c.context as _context', 'c.tags as _tags',
                'c.created_at as _createdAt', 'c.kube_config as _kubeConfig',
                'c.updated_at as _updatedAt', 'c.grace_period_days as _gracePeriodDays',
                'cg.id as _group_id', 'cg.name as _group_name'
            ])
            .from('clusters as c')
            .innerJoin('cluster_group as cg', function () {
                this.on('cg.id', '=', 'c.group_id');
            })
            .where({'c.deleted_at': null, 'cg.deleted_at': null})
            .orderBy('c.id', 'desc'))
            .then(data => plainToInstance(ClusterDto, data));
    }

    async updateCluster(cluster: ClusterDto, id: number): Promise<ClusterDto> {
        const knex = await this.databaseService.getConnection();
        // Cluster.tags must be stringified in order for knex to store it.
        if (cluster.tags && typeof (cluster.tags) !== 'string') {
            cluster.tags = JSON.stringify(cluster.tags) as any;
        }
        cluster.updatedAt = Date.now();
        const clusterToPlain = instanceToPlain(cluster);
        return knexnest(knex
            .where('c.id', +id)
            .update(clusterToPlain, ['c.id as _id', 'c.name as _name', 'c.ip_address as _ipAddress', 'c.port as _port',
                'c.context as _context', 'c.tags as _tags', 'c.group_id as _groupId',
                'c.is_enforcement_enabled as _isEnforcementEnabled','c.kube_config as _kubeConfig',
                'c.is_image_scanning_enforcement_enabled as _isImageScanningEnforcementEnabled',
                'c.grace_period_days as _gracePeriodDays'])
            .into('clusters as c'))
            .then(data => {
                return plainToInstance(ClusterDto, data)[0];
            });
    }

    async updateClusterLastScanned(id: number): Promise<ClusterDto> {
        const knex = await this.databaseService.getConnection();
        return knex
            .where('id', id)
            .update('last_scanned_at', Date.now())
            .into('clusters')
            .then(data => {
                return plainToInstance(ClusterDto, data)[0];
            });
    }

    async deleteClusterById(id: number): Promise<ClusterDto> {
        const deletedTime = {
            deleted_at: Math.round((new Date()).getTime())
        };
        const knex = await this.databaseService.getConnection();
        return knex
            .where('id', +id)
            .update(deletedTime, ['id'])
            .into('clusters')
    }

    async searchClusters(groupId: number, searchTerm: string): Promise<ClusterDto[]> {
        const knex = await this.databaseService.getConnection();
        const query = knex
            .raw(`select t.* from clusters t where EXISTS 
                        (select from jsonb_array_elements(t.tags) elem where elem->>'name' like ? AND "group_id"= ? ) 
                        OR ("name" LIKE ? AND "group_id" = ?) 
                        OR ("ip_address" like ? AND "group_id"=?) order by id DESC`,
                [`%${searchTerm.trim()}%`,groupId, `%${searchTerm.trim()}%`, groupId, `%${searchTerm.trim()}%`, groupId]);
        return query
            .then(data => {
                data.rows = data.rows.filter(row => row.deleted_at === null);
                return plainToInstance(ClusterDto, data.rows) as unknown as ClusterDto[];
            });
    }

    async getAllClustersHistory(): Promise<HistoryClusterDto[]> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                'c.id as _id',
                'c.name as _name',
                'c.ip_address as _ipAddress',
                'c.port as _port',
                'c.context as _context',
                'c.tags as _tags',
                'c.group_id as _groupId',
                // 'c.kube_config as _kubeConfig',
                'c.created_at as _createdAt',
                'c.updated_at as _updatedAt',
                'c.deleted_at as _deletedAt',
                'c.saved_date as _savedDate',
                'c.cluster_id as _clusterId'
            ])
            .from('history_kubernetes_clusters as c'))
            .then(result => plainToInstance(HistoryClusterDto, result));
    }

    /**
     * Hard Deletes all entries for the given date.
     *
     * @param date string in format yyyy-mm-dd
     */
    async clearK8sClustersHistory(date: string): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex.del()
            .where({saved_date: date})
            .from('history_kubernetes_clusters');
    }

    async saveK8sClustersHistory(cluster:ClusterDto, startTime: string): Promise<number> {
        const knex = await this.databaseService.getConnection();
                const clusterHistoryDTO = new HistoryClusterDto();
                clusterHistoryDTO.name = cluster.name;
                clusterHistoryDTO.clusterId = cluster.id;
                clusterHistoryDTO.ipAddress = cluster.ipAddress;
                clusterHistoryDTO.port = cluster.port;
                // @TODO: fix ClusterDto or getall clusters so this can be done consistently
                clusterHistoryDTO.groupId = cluster.groupId || (cluster as any).group?.id;
                clusterHistoryDTO.context = cluster.context;
                clusterHistoryDTO.tags = JSON.stringify(cluster.tags);
                clusterHistoryDTO.createdAt = cluster.createdAt;
                clusterHistoryDTO.updatedAt = cluster.updatedAt;
                clusterHistoryDTO.deletedAt = cluster.deletedAt;
                clusterHistoryDTO.kubeConfig = cluster.kubeConfig;
                clusterHistoryDTO.savedDate = startTime;
                const dtoToPlain = instanceToPlain(clusterHistoryDTO);
                await knex.insert(dtoToPlain).into('history_kubernetes_clusters')
                  .returning('id')
                  .then(results => !!results ? results[0]?.id : null)
                  .catch(e => {
                    Promise.reject(e);
                })
        return 0;
    }

    /**
     * Creates cluster group with the given name, and adds the provided cluster to it.
     * Associates both objects with the initial user
     * @param cluster The cluster object
     * @param clusterGroupName The name of the cluster group to be created
     */
    async seedInitialCluster(cluster, clusterGroupName: string, policy: PolicyDto, scanner: ScannerDto, userId: number) {
        const knex = await this.databaseService.getConnection();
        return knex.transaction(async (trx: Knex.Transaction) => {
                this.logger.log({label: 'Saving initial cluster & cluster group', data: { cluster, clusterGroupName, userId }}, 'ClusterDao.seedInitialCluster');

                const cgId = await trx('cluster_group')
                    .insert({
                        name: clusterGroupName,
                        user_id: userId
                    }).returning('id')
                  .then(results => !!results ? results[0]?.id : null);
                this.logger.log({label: 'Initial cluster group saved', data: { clusterGroupId: cgId }}, 'ClusterDao.seedInitialCluster');

                cluster.group_id = cgId;
                const clusterId = await trx('clusters').insert(cluster)
                  .returning('id').then(results => !!results ? results[0]?.id : null);
                this.logger.log({label: 'Initial cluster saved', data: { clusterId }}, 'ClusterDao.seedInitialCluster');

                const policyId = await trx('policies').insert(instanceToPlain(policy))
                  .returning('id').then(results => !!results ? results[0]?.id : null);
                this.logger.log({label: 'Initial policy saved', data: { policyId }}, 'ClusterDao.seedInitialCluster');

                scanner.policyId = policyId;
                await trx('scanners').insert(instanceToPlain(scanner));
                this.logger.log({label: 'Initial scanner saved' }, 'ClusterDao.seedInitialCluster');

                await trx('policy_cluster').insert({cluster_id: clusterId, policy_id: policyId});
                this.logger.log({label: 'Policy associated with cluster' }, 'ClusterDao.seedInitialCluster');
        })
        .then(() => this.logger.log({label: 'Initial cluster & cluster group saved' }, 'ClusterDao.seedInitialCluster'))
        .catch(e => this.logger.log({label: 'Error saving initial cluster & cluster group saved' }, e, 'ClusterDao.seedInitialCluster'));
    }

}
