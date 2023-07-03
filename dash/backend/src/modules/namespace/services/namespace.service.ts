import { Injectable } from '@nestjs/common';
import { NamespaceDao } from '../dao/namespace.dao';
import { NamespaceDto } from '../dto/namespace-dto';
import { ClusterEventService } from '../../cluster-event/services/cluster-event.service';
import { yesterdaysDateAsStr } from '../../../util/date_util';
import { Exception } from 'handlebars';
import { MineLoggerService } from '../../shared/services/mine-logger.service';

@Injectable()
export class NamespaceService {
    constructor(private readonly namespaceDao:NamespaceDao,
                private readonly clusterEventService: ClusterEventService,
                private logger: MineLoggerService,
    ) {}

    async getAllNamespaces(clusterId: number,
                           page  = 0,
                           limit  = 10,
                           sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<NamespaceDto[]> {
        return await this.namespaceDao.getAllNamespaces(clusterId, page, limit, sort);
    }

    async getAllNamespacesBySelectedDate(clusterId: number ,startTime: string, endTime: string, page: number, limit: number,
                                         sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<NamespaceDto[]> {
        return await this.namespaceDao.getAllNamespacesBySelectedDate(clusterId, startTime, endTime, page, limit, sort);
    }

    async getCountOfCurrentNamespaces(clusterId: number): Promise<number> {
        const namespace = await this.namespaceDao.getCountOfCurrentNamespaces(clusterId);
        return namespace[0].count;
    }

    async getCountOfNamespaces(clusterId: number, startTime: string, endTime: string): Promise<number> {
        const namespace = await this.namespaceDao.getCountOfNamespaces(clusterId, startTime, endTime);
        return namespace[0].count;
    }

    async setNamespacesContents(namespaceList: any, clusterId: number): Promise<NamespaceDto[]> {
        return namespaceList.body.items.map(namespace => {
            const k8sNamespace = new NamespaceDto();
            k8sNamespace.uid = namespace.metadata.uid;
            k8sNamespace.name = namespace.metadata.name;
            k8sNamespace.selfLink = namespace.metadata.selfLink;
            k8sNamespace.resourceVersion = namespace.metadata.resourceVersion;
            k8sNamespace.creationTimestamp = namespace.metadata.creationTimestamp.valueOf();
            k8sNamespace.clusterId = clusterId;
            return k8sNamespace;
        });
    }

    async getDistinctNamespaces(): Promise<NamespaceDto[]> {
        return this.namespaceDao.getDistinctNamespaces();
    }

    async getNamespaceById(clusterId: number, namespaceId: number): Promise<NamespaceDto> {
        let results = this.namespaceDao.getNamespaceById(clusterId, namespaceId);

        if (results && (await results).length > 0) {
            return results[0];
        }

        return null;
    }

    async getNamespaceByName(clusterId: number, namespaceName: string): Promise<NamespaceDto[]> {
        let results = this.namespaceDao.getNamespaceByName(clusterId, namespaceName);

        if (results && (await results).length > 0) {
            return results[0];
        }

        return null;
    }

    async getCommonNamespaces(): Promise<NamespaceDto[]> {
        return this.namespaceDao.getCommonNamespaces();
    }

    async getNamespacesByClusterId(clusterId: number): Promise<NamespaceDto[]> {
        return this.namespaceDao.getNamespacesByClusterId(clusterId);
    }

    async deleteDeadNamespaces(clusterId: number, namespacesToBeDeleted: string[]): Promise<void>{
        return this.namespaceDao.deleteDeadNamespaces(clusterId, namespacesToBeDeleted);
    }

    async saveK8sNamespaces(namespace: NamespaceDto, clusterId: number): Promise<void> {
        const checkNamespaceExistOrNot = await this.namespaceDao.checkNamespace(namespace, clusterId);
        if (checkNamespaceExistOrNot.length > 0) {
        } else {
            try {
                await this.namespaceDao.saveK8sNamespaces(namespace);
                const clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Batch Job', 'Create', 'Info', `Namespace ${namespace.name} is created`, namespace);
                await this.clusterEventService.createClusterEvent(clusterEventData, clusterId);
            } catch (e) {
                const clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Batch Job', 'Create', 'Error', `Error while creating ${namespace.name}`, namespace);
                await this.clusterEventService.createClusterEvent(clusterEventData, clusterId);
            }
        }
    }

    async saveK8sNamespacesHistory(dayStr: string): Promise<void> {
        // Get yesterday's date as a string formatted yyyy-mm-dd
        //const dayStr: string = yesterdaysDateAsStr();

        try {
            this.logger.log({label: 'Clearing k8s namespace history for date', data: { numDays: dayStr }}, 'NamespaceService.saveK8sNamespacesHistory');
            await this.namespaceDao.clearNamespaceHistory(dayStr);
        } catch (e) {
            this.logger.error({label: 'Error clearing K8s namespace history for date', data: { numDays: dayStr }}, e, 'NamespaceService.saveK8sNamespacesHistory');
        }

        const currentNamespaces = await this.namespaceDao.getCurrentNamespaces();

        if (currentNamespaces) {
           for (const namespace of currentNamespaces) {
             try {
                 this.logger.log({label: 'Saving k8s namespace history for date', data: { namespace, numDays: dayStr }}, 'NamespaceService.saveK8sNamespacesHistory');
                 await this.namespaceDao.saveK8sNamespacesHistory(namespace, dayStr);
                 //const clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Namespace History', 'History', 'Info', `History of ${namespace.name}`, null );
                 //await this.clusterEventService.createClusterEvent(clusterEventData, namespace.clusterId);
             } catch (e) {
                 const clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Namespace History', 'History', 'Error', `Error with ${namespace.name}.`, e.message);
                 await this.clusterEventService.createClusterEvent(clusterEventData, namespace.clusterId);
             }
           }
        }
    }
}
