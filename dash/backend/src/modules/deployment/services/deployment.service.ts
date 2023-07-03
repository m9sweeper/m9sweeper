import { Injectable } from '@nestjs/common';
import { DeploymentDao } from '../dao/deployment.dao';
import { DeploymentDto } from '../dto/deployment-dto';
import { V1Deployment } from '@kubernetes/client-node/dist/gen/model/v1Deployment';
import { MineLoggerService } from '../../shared/services/mine-logger.service';

@Injectable()
export class DeploymentService {
    constructor(
      private readonly deploymentDao:DeploymentDao,
      private logger: MineLoggerService,
    ) {}

    async getAllDeployments(clusterId: number, namespace: string, page = 0, limit = 10,
                            sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<DeploymentDto[]> {
        return await this.deploymentDao.getAllDeployments(clusterId, namespace, page, limit, sort);
    }

    async getAllDeploymentsBySelectedDate(clusterId: number, namespace: string, startTime: string, endTime: string,
                                          page = 0, limit = 10,
                                          sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<DeploymentDto[]> {
        return await this.deploymentDao.getAllDeploymentsBySelectedDate(clusterId, namespace, startTime, endTime, page, limit, sort);
    }

    async getCountOfCurrentDeployments(clusterId: number, namespace: string): Promise<number> {
        const totalDeployments = await this.deploymentDao.getCountOfCurrentDeployments(clusterId, namespace);
        return totalDeployments[0].count;
    }

    async getCountOfDeployments(clusterId: number, namespace: string, startTime: string, endTime: string): Promise<number> {
        const totalDeployments = await this.deploymentDao.getCountOfDeployments(clusterId, namespace, startTime, endTime);
        return totalDeployments[0].count;
    }

    async getCountOfDeploymentByComplaintStatus(filters: any): Promise<any> {
        const fields = {
            'clusterId': 'cluster_id',
        }

        const searchParams = {};

        Object.keys(fields).forEach(key => {
            if(filters && filters.hasOwnProperty(key)) {
                searchParams[fields[key]] = filters[key];
            }
        });
        return await this.deploymentDao.getCountOfDeploymentByComplaintStatus(searchParams);
    }

    async saveK8sDeployments(deployment:V1Deployment, clusterId:number): Promise<any> {
        const deploymentDTO = new DeploymentDto();
        /** Not available in newer versions of kubernetes client node. Since this
         * function was unused at upgrade time, time was spent finding other source for this info */
        // deploymentDTO.clusterName = deployment.metadata.clusterName;
        deploymentDTO.compliant = false;
        deploymentDTO.creationTimestamp = deployment.metadata.creationTimestamp.valueOf();
        deploymentDTO.generation = deployment.metadata.generation;
        deploymentDTO.name = deployment.metadata.name;
        deploymentDTO.resourceVersion = deployment.metadata.resourceVersion;
        deploymentDTO.selfLink = deployment.metadata.selfLink;
        deploymentDTO.uid = deployment.metadata.uid;
        deploymentDTO.namespace = deployment.metadata.namespace;
        deploymentDTO.clusterId = clusterId;

        const checkDeploymentExistOrNot = await this.deploymentDao.checkDeployment(deploymentDTO.name, deploymentDTO.namespace, deploymentDTO.clusterId);

        if (checkDeploymentExistOrNot.length > 0) {
            this.logger.log({label: 'Deployment already exists ', data: { deploymentDTO, deployment, clusterId }}, 'DeploymentService.saveK8sDeployments');
        } else {
            await this.deploymentDao.saveK8sDeployments(deploymentDTO);
        }
    }

    async saveK8sDeploymentsHistory(dayStr: string): Promise<any> {
        // Get yesterday's date as a string formatted yyyy-mm-dd
        //const dayStr: string = yesterdaysDateAsStr();

        try {
            this.logger.log({label: 'Clearing deployment history for date', data: { date: dayStr }}, 'DeploymentService.saveK8sDeploymentsHistory');
            await this.deploymentDao.clearDeploymentHistory(dayStr);
        } catch (e) {
            this.logger.error({label: 'Error deleting deployments history for date', data: { date: dayStr }}, e, 'DeploymentService.saveK8sDeploymentsHistory');
        }

        const currentDeployments = await this.deploymentDao.getCurrentDeployments();

        if (currentDeployments) {
            for (const deployment of currentDeployments) {
                try {
                    await this.deploymentDao.saveK8sDeploymentsHistory(deployment, dayStr);
                } catch (e) {
                    // @TODO: Should there be an event service for history like with cluster & namespaces
                    this.logger.error({label: 'Error saving history for deployment', data: { deployment }}, e, 'DeploymentService.saveK8sDeploymentsHistory');
                }
            }
        }
    }
}


