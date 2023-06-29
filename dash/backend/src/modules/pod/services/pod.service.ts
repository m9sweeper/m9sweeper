import { Injectable } from '@nestjs/common';
import { PodDao } from '../dao/pod.dao';
import { PodDto } from '../dto/pod-dto';
import { V1Pod } from '@kubernetes/client-node/dist/gen/model/v1Pod';
import { lastThirtyDaysFromYesterDayAsStr, previousDayDate, yesterdaysDate } from '../../../util/date_util';
import { PodComplianceSummaryDto } from '../dto/pod-compliance-summary-dto';
import { PodComplianceSummaryGroupDto } from '../dto/pod_compliance_sumamry_group_dto';
import { format } from 'date-fns';
import {ImageIdInClusterMap} from "../../k8s-image/classes/imageIdInClusterMap";
import {V1ContainerStatus} from "@kubernetes/client-node";
import {V1Container} from "@kubernetes/client-node/dist/gen/model/v1Container";
import {UtilitiesService} from "../../shared/services/utilities.service";
import { MineLoggerService } from '../../shared/services/mine-logger.service';


@Injectable()
export class PodService {
    constructor(
      private readonly podDao:PodDao,
      protected readonly utilities: UtilitiesService,
      private logger: MineLoggerService,
    ) {}

    async getAllPods(
      clusterId: number, namespace: string,
      sort: {field: string; direction: string; } = {field: 'id', direction: 'desc'},
      page?: number, limit?: number,
    ): Promise<PodDto[]> {
        return await this.podDao.getAllPods(clusterId, namespace, sort, page, limit);
    }
    async countAllPods(clusterId: number, namespace: string): Promise<number> {
        return await this.podDao.countAllPods(clusterId, namespace);
    }

    async getPodsByDate(
      clusterId: number, namespace: string,
      startTime: string, endTime: string,
      sort: {field: string; direction: string; } = {field: 'id', direction: 'desc'},
      page?: number, limit?: number,
    ): Promise<PodDto[]> {
        return await this.podDao.getPodsByDate(clusterId, namespace, startTime, endTime, sort, page, limit);
    }
    async countPodsByDate(clusterId: number, namespace: string, startTime: string, endTime: string,): Promise<number> {
        return await this.podDao.countPodsByDate(clusterId, namespace, startTime, endTime);
    }

    async getPodById(podId: number): Promise<PodDto> {
        return await this.podDao.getPodById(podId);
    }

    async getPodByName(clusterId: number, namespace: string, podName: string): Promise<PodDto> {
        return await this.podDao.getPodByName(clusterId, namespace, podName);
    }
    async getHistoricalPodByName(clusterId: number, namespace: string, podName: string, startTime: string, endTime: string): Promise<PodDto> {
        return await this.podDao.getHistoricalPodByName(clusterId, namespace, podName, startTime, endTime);
    }

    async getAllPodsBySelectedDate(clusterId: number, namespace: string, startTime:number, endTime: number): Promise<PodDto[]> {
        return await this.podDao.getAllPodsBySelectedDate(clusterId, namespace, startTime, endTime);
    }

    async deleteDeadPods(clusterId: number, runningPodNames: Array<string>) {
        return await this.podDao.deleteDeadPods(clusterId, runningPodNames);
    }

    async savePod(pod: V1Pod, clusterId: number, imageIdMap: ImageIdInClusterMap): Promise<any> {
        const podDTO = new PodDto();
        podDTO.uid = pod.metadata.uid;
        podDTO.name = pod.metadata.name;
        podDTO.namespace = pod.metadata.namespace;
        podDTO.resourceVersion = pod.metadata.resourceVersion;
        podDTO.generateName = pod.metadata.generateName;
        podDTO.compliant = false;
        podDTO.selfLink = pod.metadata.selfLink;
        podDTO.creationTimestamp = String(pod.metadata.creationTimestamp.valueOf());
        podDTO.clusterId = clusterId;
        podDTO.podStatus = pod.status.phase;

        const checkPodExistOrNot = await this.podDao.checkPodExists(podDTO.name, clusterId, podDTO.namespace);

        // Combine all varieties of containers
        const containers: V1Container[] = pod.spec.containers
            .concat(pod.spec.initContainers ?? [])
            .concat(pod.spec.ephemeralContainers ?? [])
            .filter(c => c.image !== null);
        // Combine all varieties of container statuses
        const statuses: V1ContainerStatus[] = pod.status.containerStatuses
          .concat(pod.status.initContainerStatuses ?? [])
          .concat(pod.status.ephemeralContainerStatuses ?? [])

        // Find the image IDS for the images in the containers
        const imageIds = Array.from(new Set<number>(containers.map(c => {
            const status = statuses.find(s => s.name === c.name);
            const hash = this.utilities.extractImageHash(status?.imageID);
            return imageIdMap.getIdForImage(c.image, hash);
        })))
          // clear out null/undefined values
          .filter(x => !!x);

        // pods can't change, so no reason to update. Just create.
        if (checkPodExistOrNot.length == 0) {
            await this.podDao.savePod(podDTO, imageIds);
        } else {
            await this.podDao.linkExistingPodImages(checkPodExistOrNot[0].id, imageIds);
        }
    }

    async updatePod(pod: PodDto): Promise<void> {
        await this.podDao.updatePod(pod, pod.id);
    }

    async deletePod(condition: {cluster_id?:  number; namespace?: string; pod_status?: string;}): Promise<void> {
        await this.podDao.deletePod(condition);
    }

    async savePodHistory(dayStr: string):Promise<void> {
        // Get yesterday's date as a string formatted yyyy-mm-dd
        //const dayStr: string = yesterdaysDateAsStr();

        // clear pod history
        try {
            this.logger.log({label: 'Clearing pod history for yesterday', data: { date: dayStr }}, 'PodService.savePodHistory');
            await this.podDao.clearPodHistory(dayStr);
        } catch (e) {
            this.logger.error({label: 'Error clearing K8s namespace history for yesterday', data: { date: dayStr }}, e, 'PodService.savePodHistory');
        }

        // copy all pods
        const pods = await this.podDao.actuallyGetAllPods();

        if (pods) {
            for (const pod of pods) {
                try {
                    this.logger.log({label: 'Saving pod history', data: { pod }}, 'PodService.savePodHistory');
                    await this.podDao.savePodHistory(pod, dayStr);
                } catch (e) {
                    this.logger.error({label: 'Error saving history for Pod', data: { pod }}, e, 'PodService.savePodHistory');
                }
            }
        }
    }

    async getPodByNamespace(namespace: string): Promise<any> {
        return this.podDao.getPodByNamespace(namespace);
    }

    async getPodsComplianceSummary(clusterId: number): Promise<PodComplianceSummaryDto[]> {
        let yesterDayDate = yesterdaysDate();
        let dateBack30Days = previousDayDate(28);

        let historyPodsOf30Days: PodComplianceSummaryGroupDto[];

        if (clusterId) {
            historyPodsOf30Days = await this.podDao.getPodsComplianceSummaryBetweenDates(clusterId,
                format(dateBack30Days, 'yyyy-MM-dd'), format(yesterDayDate, 'yyyy-MM-dd'));
        }
        else {
            historyPodsOf30Days = await this.podDao.getPodsComplianceSummaryBetweenDates(undefined,
                format(dateBack30Days, 'yyyy-MM-dd'), format(yesterDayDate, 'yyyy-MM-dd'));
        }

        let podsSummaries: PodComplianceSummaryDto[] = [];

        if (historyPodsOf30Days) {
            let last30Days = lastThirtyDaysFromYesterDayAsStr(28);

            for (let dayStr of last30Days) {
                let summaryDto = new PodComplianceSummaryDto();
                summaryDto.dateString = dayStr;
                summaryDto.percentage = 0;

                let historyPods = historyPodsOf30Days.filter(p => format(p.savedDate, 'yyyy-M-d') === dayStr);

                if (!!historyPods === false) {
                    podsSummaries.push(summaryDto);

                    continue;
                }

                let total = historyPods.reduce((sum, element) => {
                    return sum + (+element.count);
                }, 0);

                let compliantPodsCount = historyPods.filter(p => p.compliant).reduce((sum, element) => {
                    return sum + (+element.count);
                }, 0);

                let percentage = 0;

                if (total > 0) {
                    percentage = (compliantPodsCount * 100) / total;
                }

                summaryDto.dateString = dayStr;
                summaryDto.percentage = percentage;

                podsSummaries.push(summaryDto);
            }

        }


        return podsSummaries;
    }
}
