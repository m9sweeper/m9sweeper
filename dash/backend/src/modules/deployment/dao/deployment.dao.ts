import { Injectable } from '@nestjs/common';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import * as knexnest from 'knexnest';
import { DatabaseService } from '../../shared/services/database.service';
import { DeploymentDto } from '../dto/deployment-dto';
import { HistoryDeploymentDto } from '../dto/history-deployment-dto';

@Injectable()
export class DeploymentDao {
    constructor(private databaseService: DatabaseService) {}

    async getCountOfCurrentDeployments(clusterId: number, namespace: string): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return await knex('kubernetes_deployments as d').count('d.id as count')
            .where('d.cluster_id', clusterId)
            .andWhere('d.namespace', namespace)
            .then( totalDeployment => totalDeployment);
    }

    async getCountOfDeployments(clusterId: number, namespace: string, startTime: string, endTime: string): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return await knex('history_kubernetes_deployments as d').count('d.id as count')
            .where('d.cluster_id', clusterId)
            .andWhere('d.namespace', namespace)
            .andWhere('d.saved_date', '>=', startTime)
            .andWhere('d.saved_date', '<=', endTime)
            .then( totalDeployment => totalDeployment);
    }

    async getCountOfDeploymentByComplaintStatus(filters: any): Promise<any> {
        const knex = await this.databaseService.getConnection();
        let query = knex('kubernetes_deployments')
                    .count('id as count').select('compliant')
                    .groupBy('compliant');

        Object.keys(filters).forEach(value => {
            if(Array.isArray(filters[value])) {
                if(filters[value].length > 0) {
                    query = query.whereIn(value, filters[value]);
                }
            } else {
                query = query.where(value, filters[value]);
            }
        });
        return query;
    }

    async getAllDeployments(
      clusterId: number, namespace: string,  page = 0, limit = 10,
      sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}
    ): Promise<DeploymentDto[]> {
        const knex = await this.databaseService.getConnection();

        const sortFieldMap = {
            'id': 'd.id',
            'name': 'd.name',
            'namespace': 'd.namespace',
            'generation': 'd.generation',
            'creationTime':'d.creation_timestamp',
            'compliant': 'd.compliant'
        };

        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';

        return await knexnest(knex
            .select([
                'd.id as _id',
                'd.name as _name',
                'd.self_link as _selfLink',
                'd.uid as _uid',
                'd.resource_version as _resourceVersion',
                'd.namespace as _namespace',
                'd.generation as _generation',
                'd.cluster_id as _clusterId',
                'd.creation_timestamp as _creationTimestamp',
                'd.compliant as _compliant'
            ])
            .from('kubernetes_deployments as d')
            .where('d.cluster_id', clusterId)
            .andWhere('d.namespace', namespace)
            .limit(limit)
            .offset(page * limit)
            .orderByRaw(`${sort.field} ${sort.direction}`))
            .then( deployments => plainToInstance(DeploymentDto, deployments));
    }

    async getAllDeploymentsBySelectedDate(clusterId: number, namespace: string, startTime: string, endTime: string,
                                          page = 0, limit = 10,
                                          sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}): Promise<DeploymentDto[]>{
        const knex = await this.databaseService.getConnection();
        const sortFieldMap = {
            'id': 'd.id',
            'name': 'd.name',
            'namespace': 'd.namespace',
            'generation': 'd.generation',
            'creationTime':'d.creation_timestamp',
            'compliant': 'd.compliant'
        };

        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';

        return await knexnest(knex
            .select([
                'd.id as _id',
                'd.name as _name',
                'd.self_link as _selfLink',
                'd.uid as _uid',
                'd.resource_version as _resourceVersion',
                'd.namespace as _namespace',
                'd.generation as _generation',
                'd.cluster_id as _clusterId',
                'd.creation_timestamp as _creationTimestamp',
                'd.compliant as _compliant'
            ])
            .from('history_kubernetes_deployments as d')
            .where('d.cluster_id', clusterId)
            .andWhere('d.namespace', namespace)
            .andWhere('d.saved_date', '>=', startTime)
            .andWhere('d.saved_date', '<=', endTime)
            .limit(limit)
            .offset(page * limit)
            .orderByRaw(`${sort.field} ${sort.direction}`))
            .then( deployments => plainToInstance(HistoryDeploymentDto, deployments));
    }

    async getAllDeploymentsHistory(): Promise<HistoryDeploymentDto[]>{
        const knex = await this.databaseService.getConnection();
        return await knexnest(knex
            .select([
                'd.id as _id',
                'd.name as _name',
                'd.self_link as _selfLink',
                'd.uid as _uid',
                'd.resource_version as _resourceVersion',
                'd.creation_timestamp as _creationTimestamp',
                'd.cluster_name as _clusterName',
                'd.namespace as _namespace',
                'd.generation as _generation',
                'd.compliant as _compliant',
                'd.cluster_id as _clusterId',
                'd.saved_date as _savedDate'
            ])
            .from('history_kubernetes_deployments as d')
            .orderBy('d.id', 'desc'))
            .then( deployments => plainToInstance(HistoryDeploymentDto, deployments));
    }

    async getCurrentDeployments(): Promise<DeploymentDto[]>{
        const knex = await this.databaseService.getConnection();
        return await knexnest(knex
            .select([
                'd.id as _id',
                'd.name as _name',
                'd.self_link as _selfLink',
                'd.uid as _uid',
                'd.resource_version as _resourceVersion',
                'd.namespace as _namespace',
                'd.generation as _generation',
                'd.cluster_id as _clusterId',
                'd.cluster_name as _clusterName',
                'd.creation_timestamp as _creationTimestamp',
                'd.compliant as _compliant'
            ])
            .from('kubernetes_deployments as d')
            .orderBy('d.id', 'desc'))
            .then( deployments => plainToInstance(DeploymentDto, deployments));
    }

    async saveK8sDeploymentsHistory(deployment: DeploymentDto, startTime: string): Promise<number> {
        const knex = await this.databaseService.getConnection();
                const deploymentHistoryDTO = new HistoryDeploymentDto();
                deploymentHistoryDTO.name = deployment.name;
                deploymentHistoryDTO.namespace = deployment.namespace;
                deploymentHistoryDTO.generation = deployment.generation;
                deploymentHistoryDTO.selfLink = deployment.selfLink;
                deploymentHistoryDTO.uid = deployment.uid;
                deploymentHistoryDTO.resourceVersion = deployment.resourceVersion;
                deploymentHistoryDTO.creationTimestamp = deployment.creationTimestamp;
                deploymentHistoryDTO.compliant = deployment.compliant;
                deploymentHistoryDTO.clusterId = deployment.clusterId;
                deploymentHistoryDTO.clusterName = deployment.clusterName;
                deploymentHistoryDTO.savedDate = startTime;
                const dtoToPlain = instanceToPlain(deploymentHistoryDTO);
                await knex.insert(dtoToPlain).into('history_kubernetes_deployments')
                  .returning('id').then(results => !!results ? results[0]?.id : null)
                  .catch(e => {
                    Promise.reject(e);
                });
        return 0;
    }

    async clearDeploymentHistory(date: string): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex.del().from('history_kubernetes_deployments')
            .where({saved_date: date});
    }

    async checkDeployment(deploymentName: string, namespaceName: string, clusterId: number): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return knex.select('name')
            .from('kubernetes_deployments')
            .where('name', deploymentName)
            .where('namespace', namespaceName)
            .andWhere('cluster_id', clusterId);
    }

    async saveK8sDeployments(deployment: DeploymentDto): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const dtoToPlain = instanceToPlain(deployment);
        await knex.insert(dtoToPlain).into('kubernetes_deployments').returning('id')
          .then(results => !!results ? results[0]?.id : null)
          .catch(e => {
            console.log(e);
            Promise.reject(0);
        });
        return 0;
    }
}
