import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import * as knexnest from 'knexnest';
import { DatabaseService } from '../../shared/services/database.service';
import { PodDto } from '../dto/pod-dto';
import { PodComplianceDto } from '../dto/pod-history-compliance-dto';
import {PodHistoryDto} from "../dto/pod-history-dto";
import { PodComplianceSummaryGroupDto } from '../dto/pod_compliance_sumamry_group_dto';
import { MineLoggerService } from '../../shared/services/mine-logger.service';
import { PodComplianceForNamespace } from '../dto/pod-compliance-for-namespace';

@Injectable()
export class PodDao {
    constructor(
      private databaseService: DatabaseService,
      private logger: MineLoggerService,
    ) {}

    async getAllPods(clusterId: number, namespace: string, sort, page?: number, limit?: number): Promise<PodDto[]>{
        const knex = await this.databaseService.getConnection();
        const sortFieldMap = {
          'id': 'p.id',
          'name': 'p.name',
          'namespace': 'p.namespace'
        };
        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';

        const query = knex
            .select([
                'p.id as _id',
                'p.name as _name',
                'p.self_link as _selfLink',
                'p.uid as _uid',
                'p.cluster_id as _clusterId',
                'p.resource_version as _resourceVersion',
                'p.namespace as _namespace',
                'p.generate_name as _generateName',
                'p.creation_timestamp as _creationTimestamp',
                'p.compliant as _compliant',
                'p.pod_status as _podStatus'
            ])
            .from('kubernetes_pods as p')
            .where('p.cluster_id', clusterId)
            .andWhere('p.namespace', namespace);
        if (page && limit) {
          query.limit(limit).offset(page * limit);
        }
        query.orderByRaw(`${sort.field} ${sort.direction}`);
        return await knexnest(query).then( pods => plainToInstance(PodDto, pods));
    }

    async countAllPods(clusterId: number, namespace: string,): Promise<number> {
      const knex = await this.databaseService.getConnection();
      const queryResult = await knex('kubernetes_pods as p')
        .count('p.id as count')
        .where('p.cluster_id', clusterId)
        .andWhere('p.namespace', namespace)
        .then( totalPods => totalPods);
      return parseInt(queryResult[0].count.toString(), 10);
    }

    async getPodsByDate(
      clusterId: number, namespace: string,
      startTime: string, endTime: string,
      sort: {field: string; direction: string; } = {field: 'id', direction: 'desc'},
      page?: number, limit?: number,
    ): Promise<PodDto[]> {
        const knex = await this.databaseService.getConnection();
        const sortFieldMap = {
          'id': 'p.id',
          'name': 'p.name',
          'namespace': 'p.namespace'
        }
        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';

        const query = knex
          .select([
            'p.id as _id',
            'p.name as _name',
            'p.self_link as _selfLink',
            'p.uid as _uid',
            'p.cluster_id as _clusterId',
            'p.resource_version as _resourceVersion',
            'p.namespace as _namespace',
            'p.generate_name as _generateName',
            'p.creation_timestamp as _creationTimestamp',
            'p.compliant as _compliant',
            'p.pod_status as _podStatus'
          ])
          .from('history_kubernetes_pods as p')
          .where('p.cluster_id', clusterId)
          .andWhere('p.namespace', namespace)
          .andWhere('p.saved_date', '>=', startTime)
          .andWhere('p.saved_date', '<=', endTime);
        if (page && limit) {
          query.limit(limit).offset(page * limit);
        }
        query.orderByRaw(`${sort.field} ${sort.direction}`);
        return await knexnest(query).then( pods => plainToInstance(PodDto, pods));
    }

    async countPodsByDate(clusterId: number, namespace: string, startTime: string, endTime: string): Promise<any> {
      const knex = await this.databaseService.getConnection();
      return await knex('history_kubernetes_pods as p').count('p.id as count')
        .where('p.cluster_id', clusterId)
        .andWhere('p.namespace', namespace)
        .andWhere('p.saved_date', '>=', startTime)
        .andWhere('p.saved_date', '<=', endTime)
        .then( totalPods => totalPods[0].count);
    }

    async getPodById(id: number): Promise<PodDto> {
      const knex = await this.databaseService.getConnection();
      return await knex('kubernetes_pods as p').select([
          'p.id as id',
          'p.name as name',
          'p.self_link as selfLink',
          'p.uid as uid',
          'p.cluster_id as clusterId',
          'p.resource_version as resourceVersion',
          'p.namespace as namespace',
          'p.generate_name as generateName',
          'p.creation_timestamp as creationTimestamp',
          'p.compliant as compliant',
          'p.pod_status as podStatus'
      ])
          .where('p.id', id)
          .then(pod => {
              const parsedPod = plainToInstance(PodDto, pod);
              return parsedPod[0];
          });
      // return await knexnest(knex
      //   .select([
      //     'p.id as id',
      //     'p.name as name',
      //     'p.self_link as selfLink',
      //     'p.uid as uid',
      //     'p.cluster_id as clusterId',
      //     'p.resource_version as resourceVersion',
      //     'p.namespace as namespace',
      //     'p.generate_name as generateName',
      //     'p.creation_timestamp as creationTimestamp',
      //     'p.compliant as compliant',
      //     'p.pod_status as podStatus'
      //   ])
      //   .from('kubernetes_pods as p')
      //   .where('p.id', id)
      //   .then(pod => {
      //       const parsedPod = plainToInstance(PodDto, pod);
      //       return parsedPod;
      //   }))
    }

    async getPodByName(clusterId: number, namespace: string, name: string): Promise<PodDto> {
      const knex = await this.databaseService.getConnection();
      return await knex
        .select([
          'p.id as id',
          'p.name as name',
          'p.self_link as selfLink',
          'p.uid as uid',
          'p.resource_version as resourceVersion',
          'p.namespace as namespace',
          'p.generate_name as generateName',
          'p.creation_timestamp as creationTimestamp',
          'p.compliant as compliant',
          'p.cluster_id as clusterId',
          'p.pod_status as podStatus'
        ])
        .from('kubernetes_pods as p')
        .where('p.name', name)
        .where('p.cluster_id', clusterId)
        .andWhere('p.namespace', namespace)
        .then(pod => {
          const parsedPod = plainToInstance(PodDto, pod);
          return parsedPod[0];
        });
    }
    async getHistoricalPodByName(clusterId: number, namespace: string, name: string, startTime: string, endTime: string): Promise<PodDto> {
      const knex = await this.databaseService.getConnection();
      return await knex
        .select([
          'p.id as id',
          'p.name as name',
          'p.self_link as selfLink',
          'p.uid as uid',
          'p.resource_version as resourceVersion',
          'p.namespace as namespace',
          'p.generate_name as generateName',
          'p.creation_timestamp as creationTimestamp',
          'p.compliant as compliant',
          'p.cluster_id as clusterId',
          'p.pod_status as podStatus'
        ])
        .from('history_kubernetes_pods as p')
        .where('p.name', name)
        .where('p.cluster_id', clusterId)
        .andWhere('p.namespace', namespace)
        .andWhere('p.saved_date', '>=', startTime)
        .andWhere('p.saved_date', '<=', endTime)
        .then(pod => {
          const parsedPod = plainToInstance(PodDto, pod);
          return parsedPod[0];
        });
    }

    async actuallyGetAllPods(): Promise<PodDto[]>{
      const knex = await this.databaseService.getConnection();
      return knexnest(knex
        .select([
          'p.id as _id',
          'p.name as _name',
          'p.self_link as _selfLink',
          'p.uid as _uid',
          'p.cluster_id as _clusterId',
          'p.resource_version as _resourceVersion',
          'p.namespace as _namespace',
          'p.generate_name as _generateName',
          'p.creation_timestamp as _creationTimestamp',
          'p.compliant as _compliant',
          'p.pod_status as _podStatus'
        ])
        .from('kubernetes_pods as p')
        .orderBy('p.id', 'desc'))
        .then( pods => plainToInstance(PodDto, pods));
    }

    async getAllPodsInCluster(clusterId: number): Promise<PodDto[]>{
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                'p.id as _id',
                'p.name as _name',
                'p.self_link as _selfLink',
                'p.uid as _uid',
                'p.cluster_id as _clusterId',
                'p.resource_version as _resourceVersion',
                'p.namespace as _namespace',
                'p.generate_name as _generateName',
                'p.creation_timestamp as _creationTimestamp',
                'p.compliant as _compliant',
                'p.pod_status as _podStatus'
            ])
            .from('kubernetes_pods as p')
            .where('p.cluster_id', clusterId)
            .orderBy('p.id', 'desc'))
            .then( pods => plainToInstance(PodDto, pods));
    }

    async getAllPodsInClusterForNamespaceCompliance(clusterId: number): Promise<PodComplianceDto[]>{
      const knex = await this.databaseService.getConnection();

      let query = knexnest(knex
        .select([
          'p.id as _id',
          'p.name as _name',
          'p.self_link as _selfLink',
          'p.uid as _uid',
          'p.cluster_id as _clusterId',
          'p.resource_version as _resourceVersion',
          'p.namespace as _namespace',
          'p.generate_name as _generateName',
          'p.creation_timestamp as _creationTimestamp',
          'p.compliant as _compliant',
          'p.pod_status as _podStatus',
          'img.id as _images__id',
          'img.url as _images__url',
          'img.name as _images__name',
          'img.tag as _images__tag',
          'img.docker_image_id as _images__dockerImageId',
          'img.summary as _images__summary',
          'img.running_in_cluster as _images__runningInCluster'

        ])
        .from('kubernetes_pods as p')
        .leftJoin('pod_images as pi', 'pi.pod_id', 'p.id')
        .leftJoin('images as img', 'img.id', 'pi.image_id')
        .where('p.pod_status', 'Running')
        .where('p.cluster_id', clusterId)
        .where('img.running_in_cluster', true));


        return query.then( pods => plainToInstance(PodComplianceDto, pods));
  }

    async getAllPodsBySelectedDate(clusterId: number, namespace: string, startTime:number, endTime: number): Promise<PodDto[]>{
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                'p.id as _id',
                'p.name as _name',
                'p.self_link as _selfLink',
                'p.uid as _uid',
                'p.cluster_id as _clusterId',
                'p.resource_version as _resourceVersion',
                'p.namespace as _namespace',
                'p.generate_name as _generateName',
                'p.creation_timestamp as _creationTimestamp',
                'p.compliant as _compliant',
                'p.pod_status as _podStatus'
            ])
            .from('kubernetes_pods as p')
            .where('p.cluster_id', clusterId)
            .andWhere('p.namespace', namespace)
            .andWhere('p.creation_timestamp', '>=', startTime)
            .andWhere('p.creation_timestamp', '<=', endTime)
            .orderBy('p.id', 'desc'))
            .then( pods => plainToInstance(PodDto, pods));
    }

    async checkPodExists(podName:string, clusterId: number, namespace: string): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return knex.select(['name', 'id'])
            .from('kubernetes_pods')
            .where('name', podName)
            .andWhere('namespace', namespace)
            .andWhere('cluster_id', clusterId);
    }

    async savePod(pod: PodDto, imageIds: Array<number>): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const dtoToPlain = instanceToPlain(pod);
        const id = await knex.insert(dtoToPlain)
            .into('kubernetes_pods')
            .returning('id')
            .then(results => !!results ? results[0]?.id : null)
            .catch(e => {
                this.logger.error({label: 'Error saving pod', data: { pod }}, e, 'PodDao.savePod');
                Promise.reject(0);
            });
        if (id) {
          await this.linkImagesToPod(id, imageIds);
        }
        return id;
    }

    async linkExistingPodImages(podId: number, imageIds: Array<number>): Promise<void> {
      const knex = await this.databaseService.getConnection();

      const links = imageIds.map(id => ({pod_id: podId, image_id: id}));

      await knex.transaction(async function(trx){
        try {
          // Clear all existing links to the pod
          await knex.delete()
            .from('pod_images')
            .where({ pod_id: podId });
          // Add the currently existing links to the pod
          await knex('pod_images').insert(links);

          await trx.commit();
        }
        catch (e) {
          await trx.rollback();
          throw e;
        }
      });
    }

    async linkImagesToPod(podId: number, imageIds: Array<number>): Promise<void> {
      const knex = await this.databaseService.getConnection()
      const links = imageIds.map(id => ({pod_id: podId, image_id: id}));
      await knex('pod_images').insert(links);
    }

    async updatePod(pod: PodDto, id: number): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const clusterToPlain = instanceToPlain(pod);
        return knex.update(clusterToPlain, ['pod_status'])
            .where('id', +id)
            .into('kubernetes_pods')
            .returning('id').then(results => !!results ? results[0]?.id : null);
    }


  /**
   * UNUSED
   */
  async updateHistoryk8PodCompliance(id: number, compliant: boolean): Promise<number> {
      const knex = await this.databaseService.getConnection();
      return knex('history_kubernetes_pods')
          .update({compliant: compliant})
          .where('id', id)
          .returning('id')
          .then(results => !!results ? results[0]?.id : null);
  }

  async updateBatchHistoryk8PodCompliance(ids: number[], compliant: boolean) {
    const knex = await this.databaseService.getConnection();
    return knex('history_kubernetes_pods')
          .update({compliant: compliant})
          .whereIn('id', ids);

  }

  async updateBatchk8PodCompliance(ids: number[], compliant: boolean) {
    const knex = await this.databaseService.getConnection();
    return knex('kubernetes_pods')
          .update({compliant: compliant})
          .whereIn('id', ids);

  }

    async deleteDeadPods(clusterId: number, runningPodNames: Array<string>) {
      const knex = await this.databaseService.getConnection();
      const toDelete = await knex
        .select()
        .from('kubernetes_pods')
        .where({ 'cluster_id': clusterId })
        .whereNotIn('name', runningPodNames)
        .select('id')
        .returning(['id']);
      const idsToDelete = toDelete.map(obj => obj.id);

      if (!idsToDelete.length) {
        return;
      }
      this.logger.log({label: 'Deleting dead pods', data: { clusterId, runningPodNames, idsToDelete, numPodsToDelete: idsToDelete.length }}, 'PodDao.deleteDeadPods');

      // delete pods and their image associations
      await knex.from('pod_images')
        .whereIn('pod_id', idsToDelete)
        .delete();
      await knex.from('kubernetes_pods')
        .whereIn('id', idsToDelete)
        .delete();
    }

    async deletePod(condition: {cluster_id?:  number; namespace?: string; pod_status?: string;}): Promise<number[]> {
        const knex = await this.databaseService.getConnection();
        return knex('kubernetes_pods').where(condition)
            .del(['id']);
    }

    async clearPodHistory(day: string) {
        const knex = await this.databaseService.getConnection();
        await knex.transaction(async trx => {
          const historyIdsToDelete = (await knex('history_kubernetes_pods')
            .pluck('id')
            .where({'saved_date': day}));
          await knex('history_pod_images')
            .del().whereIn('history_pod_id', historyIdsToDelete)
            .transacting(trx);
          await knex('history_kubernetes_pods')
            .del().whereIn('id', historyIdsToDelete)
            .transacting(trx);
        })
        .then(() => {
          this.logger.log({label: 'Successfully cleared pod history for date', data: { date: day }}, 'PodDao.clearPodHistory');
        })
        .catch(e => {
          this.logger.error({label: 'Error clearing pod history', data: { date: day }}, e, 'PodDao.clearPodHistory');
        });

    }

    async savePodHistory(pod: PodDto, day: string) {
        const history = new PodHistoryDto();
        history.savedDate = day;
        history.uid = pod.uid;
        history.name = pod.name;
        history.clusterId = pod.clusterId;
        history.compliant = pod.compliant;
        history.creationTimestamp = pod.creationTimestamp;
        history.generateName = pod.generateName;
        history.namespace = pod.namespace;
        history.resourceVersion = pod.resourceVersion;
        history.podStatus = pod.podStatus;
        history.selfLink = pod.selfLink;

        const plainHistory = instanceToPlain(history);
        const knex = await this.databaseService.getConnection();
        return await knex.transaction(async trx => {
            const createdHistoryPodIdArray = await knex('history_kubernetes_pods')
                .insert(plainHistory)
                .returning('id')
                .transacting(trx)
                .then(results => !!results ? results.map(r => r?.id) : []);

            const imageIds = await knex('pod_images')
                .select('image_id')
                .where({'pod_id': pod.id});

            const historyLinks = imageIds.map(result => ({
              history_pod_id: createdHistoryPodIdArray[0],
              image_id: result.image_id
            }));
            if (historyLinks) {
              await knex('history_pod_images').insert(historyLinks).transacting(trx);
            }
        })
    }

    async getPodByNamespace(namespace: string): Promise<any> {
        const knex = await this.databaseService.getConnection();
        const query = knex
            .select([
                'kp.namespace',
                'kp.cluster_id as clusterId'
            ])
            .from('kubernetes_pods as kp')
            .where('kp.namespace', namespace);

        return query.then(data => data);

    }

    async getAllHistoricalK8RunningPodsForNamespaceCompliance(dayStr: string): Promise<PodComplianceDto[]> {
      const knex = await this.databaseService.getConnection();

      let query = knexnest(knex
        .select([
          'p.id as _id',
          'p.name as _name',
          'p.self_link as _selfLink',
          'p.uid as _uid',
          'p.cluster_id as _clusterId',
          'p.resource_version as _resourceVersion',
          'p.namespace as _namespace',
          'p.generate_name as _generateName',
          'p.creation_timestamp as _creationTimestamp',
          'p.compliant as _compliant',
          'p.pod_status as _podStatus',
          'img.id as _images__id',
          'img.url as _images__url',
          'img.name as _images__name',
          'img.tag as _images__tag',
          'img.docker_image_id as _images__dockerImageId',
          'img.summary as _images__summary',
          'img.running_in_cluster as _images__runningInCluster'

        ])
        .from('history_kubernetes_pods as p')
        .leftJoin('history_pod_images as pi', 'pi.history_pod_id', 'p.id')
        .leftJoin('images as img', 'img.id', 'pi.image_id')
        .where('p.pod_status', 'Running')
        .where({'saved_date': dayStr})
        .where('img.running_in_cluster', true));


        return query.then( pods => plainToInstance(PodComplianceDto, pods));
    }

    async getPodsComplianceSummaryBetweenDates(daySmall: string, dayLarge: string, options?: { clusterId?: number, clusterGroupId?: number }): Promise<PodComplianceSummaryGroupDto[]> {
      const knex = await this.databaseService.getConnection();

      let sql = knex
        .select([
          'p.compliant as compliant',
          'p.saved_date as savedDate',
        ])
        .from('history_kubernetes_pods as p')
        .count<Record<number, string | number>>('p.id', {as: 'count'});

      if (options?.clusterGroupId) {
        sql = sql.groupBy('p.saved_date', 'p.compliant', 'p.cluster_id', 'c.group_id');
      }
      else if (options?.clusterId) {
          sql = sql.groupBy('p.saved_date', 'p.compliant', 'p.cluster_id');
        }
        else {
          sql = sql.groupBy('p.saved_date', 'p.compliant');
        }

        if (options?.clusterId) {
          sql.select('p.cluster_id as clusterId')
          sql = sql.where('p.cluster_id', '=', options.clusterId);
        }

        if (options?.clusterGroupId) {
          sql.leftJoin('clusters as c', 'c.id', 'p.cluster_id');
          sql.where('c.group_id', '=', options.clusterGroupId);
        }

        sql = sql.whereBetween('p.saved_date', [daySmall, dayLarge]);

        sql = sql.orderBy('p.saved_date', 'asc');
        console.log(sql.toQuery());
        return sql.then();
    }

  async getCurrentPodsComplianceSummary(clusterId: number): Promise<PodComplianceForNamespace[]> {
    const knex = await this.databaseService.getConnection();

    const complianceQuery = knex
      .select([
        'pods.cluster_id as cluster_id',
        'pods.namespace as namespace',
        knex.raw('COUNT(pods.id) AS num_pods'),
        knex.raw('COUNT(CASE WHEN pods.compliant=True THEN 1 END) AS num_compliant_pods'),
        knex.raw('COUNT(CASE WHEN pods.compliant=False THEN 1 END) AS num_noncompliant_pods')
      ])
      .from('kubernetes_pods as pods')
      .where('pods.pod_status', "Running")
      .andWhere('pods.cluster_id', clusterId)
      .groupBy('pods.cluster_id', 'pods.namespace')
      .orderBy('pods.cluster_id', 'pods.namespace');

    return complianceQuery.then((result: any[]) => {
      const summariesAsObjects: PodComplianceForNamespace[] = [];
      for (const summary of result) {
        summariesAsObjects.push(plainToInstance(PodComplianceForNamespace, summary));
      }
      return summariesAsObjects;
    });
  }
}
