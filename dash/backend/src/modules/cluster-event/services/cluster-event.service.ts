import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {ClusterEventDto} from '../dto/cluster-event-dto';
import {ClusterEventDao} from '../dao/cluster-event.dao';
import {instanceToPlain} from 'class-transformer';
import {ClusterEventCreateDto} from '../dto/cluster-event-create-dto';
import {KubeConfig} from '@kubernetes/client-node/dist/config';
import {
    CoreV1Event,
    V1EventSource,
    V1ObjectMeta,
    V1ObjectReference
} from '@kubernetes/client-node';
import {uuid} from 'uuidv4';
import {ClusterDto} from '../../cluster/dto/cluster-dto';
import {ClusterDao} from "../../cluster/dao/cluster.dao";
import {CoreV1Api} from "@kubernetes/client-node/dist/gen/api/coreV1Api";
import { MineLoggerService } from '../../shared/services/mine-logger.service';
import { ClusterService } from '../../cluster/services/cluster.service';

@Injectable()
export class ClusterEventService {
    constructor(
      private readonly clusterEventDao: ClusterEventDao,
      private readonly clusterDao: ClusterDao,
      private logger: MineLoggerService,
      @Inject(forwardRef(() => ClusterService)) private readonly clusterService: ClusterService,
    ) {}

    async createClusterEvent(clusterEvent: ClusterEventCreateDto, clusterId: number): Promise<{id: number}[]> {
        const clusterEventObject: any = instanceToPlain(clusterEvent);
        clusterEventObject.entity_id = clusterId;
        return await this.clusterEventDao.createClusterEvent(clusterEventObject);
    }

    async getAllClusterEvents( limit: number, page: number, clusterId: number): Promise<ClusterEventDto[]> {
        const eventLimit = isNaN(limit) ? 10 : limit;
        const eventPage = isNaN(page) ? 0 : page;
        const offset =  eventLimit * eventPage;
        return await this.clusterEventDao.getAllClusterEvents(offset, eventLimit, clusterId);
    }

    createClusterEventObject(organizationId: number, entityType: string, type: string, level: string, description: string, data: any) : ClusterEventCreateDto {
        const clusterEventData = new ClusterEventCreateDto();
        clusterEventData.organizationId = organizationId || 0;
        clusterEventData.entityType = entityType;
        clusterEventData.type = type;
        clusterEventData.level = level;
        clusterEventData.description = description;
        clusterEventData.data = data;

        return clusterEventData;
    }

    /**
     * @param eventName: ImageScanned/ ClusterCreated/ ExceptionCreated/ ImageBlocked/ FailedPolicy
     * @param eventType: Normal/ Warning
     * @param regardingKind the first part of Pod/my-pod-name
     * @param regardingName the second part of Pod/my-pod-name
     * @param message
     * @param clusterId
     * @param namespace
     */
    async createK8sClusterEvent(eventName: string,
                                eventType: string,
                                regardingKind: string | null,
                                regardingName: string | null,
                                message: string,
                                clusterId: number,
                                namespace: string): Promise<any> {
        try {
            const kubeConfig: KubeConfig = await this.clusterService.getKubeConfig(clusterId);
            const eventsApi = kubeConfig.makeApiClient(CoreV1Api);

            const eventBody = new CoreV1Event();
            eventBody.type = eventType;
            eventBody.reason = eventName;
            eventBody.message = message;
            eventBody.kind = 'Event';
            eventBody.apiVersion = 'v1';
            eventBody.firstTimestamp = new Date();

            eventBody.related = new V1ObjectReference();
            eventBody.related.name = `${eventName}.${new Date().getTime()}`;
            eventBody.related.namespace = namespace;
            eventBody.related.uid = uuid();

            eventBody.involvedObject = new V1ObjectReference();
            eventBody.involvedObject.namespace = namespace;
            eventBody.involvedObject.kind = regardingKind ?? 'Deployment';
            eventBody.involvedObject.name = regardingName ?? `dash`;
            eventBody.involvedObject.uid = uuid();

            eventBody.metadata = new V1ObjectMeta();
            eventBody.metadata.name = `${eventName}.${new Date().getTime()}`;
            eventBody.metadata.namespace = namespace;
            eventBody.metadata.uid = uuid();
            eventBody.metadata.creationTimestamp = new Date();

            eventBody.source = new V1EventSource();
            eventBody.source.component = 'm9sweeper';
            eventBody.source.host = kubeConfig.getCurrentContext();

            const response = await eventsApi.createNamespacedEvent(namespace, eventBody);
            this.logger.log({label: 'Cluster event created', data: { response }}, 'ClusterEventService.createK8sClusterEvent');
        } catch (e) {
            this.logger.error({label: 'Error creating cluster event'}, e, 'ClusterEventService.createK8sClusterEvent');
        }
    }
}
