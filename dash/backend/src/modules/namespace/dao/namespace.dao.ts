import { Injectable} from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import * as knexnest from 'knexnest';
import { DatabaseService } from '../../shared/services/database.service';
import { NamespaceDto } from '../dto/namespace-dto';
import { HistoryNamespaceDto } from '../dto/history-namespace-dto';
import { NamespaceComplianceDto } from '../dto/namespace-compliance-dto';

@Injectable()
export class NamespaceDao {
    constructor(private databaseService: DatabaseService) {}

    async getCountOfCurrentNamespaces(clusterId: number): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return await knex('kubernetes_namespaces as kn').countDistinct('kn.name as count')
            .where('kn.cluster_id', clusterId)
            .then(result => result);
    }

    async getCountOfNamespaces(clusterId: number, startTime: string, endTime: string): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return await knex('history_kubernetes_namespaces as h').count('h.id as count')
            .where('h.cluster_id', clusterId)
            .andWhere('h.saved_date', '>=', startTime)
            .andWhere('h.saved_date', '<=', endTime)
            .then(namespace => namespace);
    }

    async getAllNamespaces(clusterId: number,
                           page = 0, limit = 10,
                           sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<NamespaceDto[]> {
        const knex = await this.databaseService.getConnection();

        const sortFieldMap = {
            'id': 'n.id',
            'name': 'n.name',
            'compliant': 'n.compliant',
            'imagesScanned': 'i.name',
            'pod': 'p.name',
            'creationTime': 'n.creation_timestamp'
        };

        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';
        const query = knex
            .select([
                'n.name as _name',
                knex.raw('MAX(n.id) as "_id"'),
                knex.raw('MAX(n.self_link) as "_selfLink"'),
                knex.raw('MAX(n.uid) as _uid'),
                knex.raw('MAX(n.cluster_id) as "_clusterId"'),
                knex.raw('MAX(n.resource_version) as "_resourceVersion"'),
                knex.raw('MAX(n.creation_timestamp) as "_creationTimestamp"'),
                knex.raw('EVERY(n.compliant) as _compliant'),
                knex.raw('MAX(p.pods) as "_kubernetesPods"')
            ]).from('kubernetes_namespaces as n')
            .leftJoin(
                knex('kubernetes_pods as kp')
                    .select('namespace', knex.raw(`count(*) filter(where kp.cluster_id = ?) as pods`, [clusterId]))
                    // .leftJoin('kubernetes_namespaces as kn', function(){
                    //     this.on('kn.name', '=', 'kp.namespace')
                    //         .andOn('kn.cluster_id', '=', 'kp.cluster_id')
                    // })
                    .andWhere('pod_status', 'Running')
                    .groupBy('namespace')
                    .as('p'),
                'p.namespace',
                'n.name'
            )
            .where('n.cluster_id', clusterId)
            .groupBy('n.name', 'n.id')
            .limit(limit)
            .offset(page * limit)
            .orderByRaw(`${sort.field} ${sort.direction}`);
        return await knexnest(query)
            .then(namespaces => {
                return plainToInstance(NamespaceDto, namespaces)
            });
    }

    async getAllNamespacesBySelectedDate(clusterId: number, startTime: string, endTime: string, page: number, limit: number,
                                         sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<HistoryNamespaceDto[]> {
        const knex = await this.databaseService.getConnection();

        const sortFieldMap = {
            'id': 'n.id',
            'name': 'n.name',
            'compliant': 'n.compliant',
            'imagesScanned': 'i.name',
            'pod': 'p.name',
            'creationTime': 'n.creation_timestamp'
        };
        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';

        const subquery = knex('history_kubernetes_pods').select('namespace', 'history_kubernetes_pods.saved_date', knex.raw('count(*) as ??', ['name']))
            .where('cluster_id', clusterId)
            .andWhere('pod_status', 'Running')
            .groupBy('namespace', 'saved_date').as('p')

        const result = await knexnest(knex
            .select([
                'n.id as _id',
                'n.name as _name',
                'n.self_link as _selfLink',
                'n.uid as _uid',
                'n.cluster_id as _clusterId',
                'n.resource_version as _resourceVersion',
                'n.creation_timestamp as _creationTimestamp',
                'n.compliant as _compliant',
                'i.name as _kubernetesImages',
                'p.name as _kubernetesPods'
            ])
            .from('history_kubernetes_namespaces as n')
            .leftJoin(knex('history_kubernetes_images')
                    .select('namespace', knex.raw('count(*) as ??', ['name']))
                    .where('cluster_id', clusterId).groupBy('namespace').as('i'),
                'i.namespace',
                'n.name',
            )
            .leftJoin(subquery, function(){
                this.on('p.namespace', '=', 'n.name')
                this.andOn('p.saved_date', '=', 'n.saved_date')})
            .where('n.cluster_id', clusterId)
            .andWhere('n.saved_date', '>=', startTime)
            .andWhere('n.saved_date', '<=', endTime)
            .limit(limit)
            .offset(page * limit)
            .orderByRaw(`${sort.field} ${sort.direction}`))
            .then(namespaces => plainToInstance(NamespaceDto, namespaces));

            //console.log(result.sql);

        return result;
    }

    async getAllNamespacesHistoryByDate(dayStr: string) : Promise<NamespaceComplianceDto[]> {
        const knex = await this.databaseService.getConnection();
        return await knexnest(knex
            .select([
                'n.id as _id',
                'n.name as _name',
                'n.self_link as _selfLink',
                'n.uid as _uid',
                'n.resource_version as _resourceVersion',
                'n.creation_timestamp as _creationTimestamp',
                'n.compliant as _compliant',
                'n.cluster_id as _clusterId',
                'n.saved_date as _savedDate',
                'p.id as _pods__id',
                'p.name as _pods__name',
                'p.self_link as _pods__self_link',
                'p.uid as _pods__uid',
                'p.resource_version as _pods__resource_version',
                'p.creation_timestamp as _pods__creation_timestamp',
                'p.generate_name as _pods__generate_name',
                'p.namespace as _pods__namespace',
                'p.compliant as _pods__compliant',
                'p.cluster_id as _pods__cluster_id',
                'p.pod_status as _pods__pod_status',
                'p.saved_date as _pods__saved_date'
            ])
            .from('history_kubernetes_namespaces as n')
            .leftJoin('history_kubernetes_pods as p', function() {
                this.on('p.namespace', 'n.name').
                andOn('p.cluster_id', 'n.cluster_id')

            })
            .where('n.saved_date', dayStr)
            .where('p.saved_date', dayStr))
            .then(namespaces => plainToInstance(NamespaceComplianceDto, namespaces));
    }

    async updateBatchHistoryk8NamespaceCompliance(ids: number[], compliant: boolean) {
        const knex = await this.databaseService.getConnection();
        return knex('history_kubernetes_namespaces')
              .update({compliant: compliant})
              .whereIn('id', ids);

      }

      async updateBatchk8NamespaceCompliance(ids: number[], compliant: boolean) {
        const knex = await this.databaseService.getConnection();
        return knex('kubernetes_namespaces')
              .update({compliant: compliant})
              .whereIn('id', ids);

      }

    // DEAD CODE: left in case useful in future
    async getAllNamespacesHistory() : Promise<HistoryNamespaceDto[]> {
        const knex = await this.databaseService.getConnection();
        return await knexnest(knex
            .select([
                'n.id as _id',
                'n.name as _name',
                'n.self_link as _selfLink',
                'n.uid as _uid',
                'n.resource_version as _resourceVersion',
                'n.creation_timestamp as _creationTimestamp',
                'n.compliant as _compliant',
                'n.cluster_id as _clusterId',
                'n.saved_date as _savedDate'
            ])
            .from('history_kubernetes_namespaces as n'))
            .then(namespaces => plainToInstance(HistoryNamespaceDto, namespaces));
    }

    async clearNamespaceHistory(date: string): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex.del().from('history_kubernetes_namespaces')
            .where({saved_date: date});
    }

    async getCurrentNamespaces(): Promise<NamespaceDto[]> {
        const knex = await this.databaseService.getConnection();
        return await knexnest(knex
            .select([
                'n.id as _id',
                'n.name as _name',
                'n.self_link as _selfLink',
                'n.uid as _uid',
                'n.resource_version as _resourceVersion',
                'n.creation_timestamp as _creationTimestamp',
                'n.compliant as _compliant',
                'n.cluster_id as _clusterId',
            ])
            .from('kubernetes_namespaces as n'))
            .then(namespaces => plainToInstance(NamespaceDto, namespaces));
    }

    async getDistinctNamespaces(): Promise<NamespaceDto[]> {
        const knex = await this.databaseService.getConnection();
        return await knex
            .distinct([
                'n.name',
                `n.cluster_id`,
                `c.name as clusterName`
            ])
            .from('kubernetes_namespaces as n')
            .leftJoin('clusters as c', function(){
                this.on('n.cluster_id', '=', 'c.id')
            })
            .where('c.deleted_at', null)
            .orderBy('n.name', 'asc')
            // .orderBy('n.cluster_id', 'desc')
            .then(namespaces => plainToInstance(NamespaceDto, namespaces));
    }

    async getCommonNamespaces(): Promise<NamespaceDto[]> {
        const knex = await this.databaseService.getConnection();
        const query = knex
            .distinct([
                'n.name'
            ])
            .from('kubernetes_namespaces as n')
            .leftJoin('clusters as c', function(){
                this.on('n.cluster_id', '=', 'c.id')
            })
            .where('c.deleted_at', null)
            .andWhereNot('c.name', null)
            .orderBy('n.name', 'asc');
        // console.log(query.toSQL());
        return await query.then(namespaces => plainToInstance(NamespaceDto, namespaces));
    }

    async getNamespacesByClusterId(clusterId: number): Promise<NamespaceDto[]> {
        const knex = await this.databaseService.getConnection();
        return await knex
            .select([
                'kn.name'
            ])
            .from('kubernetes_namespaces as kn')
            .where('kn.cluster_id', clusterId)
            .orderBy('kn.name', 'asc')
            .then(namespaces => plainToInstance(NamespaceDto, namespaces));
    }

    async getNamespacesByClusterIdWithPods(clusterId: number) : Promise<NamespaceComplianceDto[]> {
        const knex = await this.databaseService.getConnection();
        return await knexnest(knex
            .select([
                'n.id as _id',
                'n.name as _name',
                'n.self_link as _selfLink',
                'n.uid as _uid',
                'n.resource_version as _resourceVersion',
                'n.creation_timestamp as _creationTimestamp',
                'n.compliant as _compliant',
                'n.cluster_id as _clusterId',
                'p.id as _pods__id',
                'p.name as _pods__name',
                'p.self_link as _pods__self_link',
                'p.uid as _pods__uid',
                'p.resource_version as _pods__resource_version',
                'p.creation_timestamp as _pods__creation_timestamp',
                'p.generate_name as _pods__generate_name',
                'p.namespace as _pods__namespace',
                'p.compliant as _pods__compliant',
                'p.cluster_id as _pods__cluster_id',
                'p.pod_status as _pods__pod_status',
            ])
            .from('kubernetes_namespaces as n')
            .leftJoin('kubernetes_pods as p', function() {
                this.on('p.namespace', 'n.name').
                andOn('p.cluster_id', 'n.cluster_id')

            })
            .where('n.cluster_id', clusterId))
            .then(namespaces => plainToInstance(NamespaceComplianceDto, namespaces));
    }


    async getNamespaceById(clusterId: number, namespaceId: number): Promise<NamespaceDto[]> {
        const knex = await this.databaseService.getConnection();
        return await knex
            .select([
                'kn.name'
            ])
            .from('kubernetes_namespaces as kn')
            .where('kn.cluster_id', clusterId)
            .where('kn.id', namespaceId)
            .orderBy('kn.name', 'asc')
            .then(namespaces => plainToInstance(NamespaceDto, namespaces));
    }

    async getNamespaceByName(clusterId: number, name: string): Promise<NamespaceDto[]> {
        const knex = await this.databaseService.getConnection();
        return await knex
            .select([
                'kn.name'
            ])
            .from('kubernetes_namespaces as kn')
            .where('kn.cluster_id', clusterId)
            .where('kn.name', name)
            .then(namespaces => plainToInstance(NamespaceDto, namespaces));
    }


    async deleteDeadNamespaces(clusterId: number, namespacesToBeDeleted: string[]): Promise<void> {
        const knex = await this.databaseService.getConnection();
        return knex('kubernetes_namespaces')
            .whereIn('name', namespacesToBeDeleted)
            .andWhere('cluster_id', clusterId)
            .delete();
    }

    async saveK8sNamespacesHistory(namespace:NamespaceDto, startTime:string): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const namespaceHistoryDTO = new HistoryNamespaceDto();
        namespaceHistoryDTO.name = namespace.name;
        namespaceHistoryDTO.selfLink = namespace.selfLink;
        namespaceHistoryDTO.uid = namespace.uid;
        namespaceHistoryDTO.resourceVersion = namespace.resourceVersion;
        namespaceHistoryDTO.creationTimestamp = namespace.creationTimestamp;
        namespaceHistoryDTO.compliant = namespace.compliant;
        namespaceHistoryDTO.clusterId = namespace.clusterId;
        namespaceHistoryDTO.savedDate = startTime;
        const dtoToPlain = instanceToPlain(namespaceHistoryDTO);
        await knex.insert(dtoToPlain).into('history_kubernetes_namespaces')
          .returning('id').then(results => !!results ? results[0]?.id : null)
          .catch(e => {
            Promise.reject(e);
        });
        return 0;
    }

    async checkNamespace(namespace:NamespaceDto, clusterId:number): Promise<any> {
        const knex = await this.databaseService.getConnection();
         return knex.select('uid')
             .from('kubernetes_namespaces')
             .where('uid', namespace.uid)
             .andWhere('cluster_id', clusterId);
    }

    async saveK8sNamespaces(namespace:NamespaceDto): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const dtoToPlain = instanceToPlain(namespace);
        return await knex.insert(dtoToPlain).into('kubernetes_namespaces')
          .returning('id').then(results => !!results ? results[0]?.id : null)
          .catch(e => {
            console.log(e);
            Promise.reject(0);
        });
    }
}
