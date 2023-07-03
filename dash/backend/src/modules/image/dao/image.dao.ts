import {Injectable} from '@nestjs/common';
import * as knexnest from 'knexnest';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {DatabaseService} from '../../shared/services/database.service';
import {ListOfImagesDto} from '../dto/image-result.dto';
import {ImageCreateDto} from '../dto/image-create.dto';
import {ImageScanResultScannerDto} from '../dto/image-scan-result-scanner.dto';
import {ImageScanResultsDto, ImageScanResultWithIssuesDto, TotalSeverityResultsDto} from '../dto/image-scan-results.dto';
import {ImageScanCountDto} from '../dto/Image-scan-count.dto';
import {ImageDto} from '../dto/image-dto';
import { ImageRescanDto } from '../dto/image-rescan.dto';
import {MineLoggerService} from "../../shared/services/mine-logger.service";


@Injectable()
export class ImageDao {
    constructor(
      private readonly databaseService: DatabaseService,
      private logger: MineLoggerService,
    ) {}

    private imageSortFieldMap = {
        'id': 'img.id',
        'name': 'img.name',
        'namespace': 'img.namespace'
    };
    private fieldsToRetrieveInAGetAll = [
        'img.id as id',
        'img.url as url',
        'img.name as name',
        'img.tag as tag',
        'img.docker_image_id as docker_image_id',
        'img.cluster_id as cluster_id',
        'img.summary as summary',
        'img.running_in_cluster as running_in_cluster',
        'img.last_scanned as last_scanned',
        'img.scan_results as scan_results',
    ];
    private setSortFieldAndDirection(sort: {field: string; direction: string; } = {field: 'id', direction: 'desc'}): {field: string; direction: string; } {
        const field = this.imageSortFieldMap[sort.field] !== undefined ? this.imageSortFieldMap[sort.field] : this.imageSortFieldMap['id'];
        const direction = sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';
        return { field, direction };
    }

    async getAllRunningImagesByPodId(
      clusterId: number, namespace: string, podId: number,
      page?: number, limit?: number,
      sort: {field: string; direction: string; } = {field: 'id', direction: 'desc'},
    ): Promise<ListOfImagesDto[]>{
        const parsedSort = this.setSortFieldAndDirection(sort);
        const knex = await this.databaseService.getConnection();
        const query = knex
          .select(this.fieldsToRetrieveInAGetAll)
          .from('images as img')
          .join('pod_images as pod_image', 'pod_image.image_id', 'img.id')
          .where('pod_image.pod_id', podId)
          .andWhere('pod.cluster_id', clusterId)
          .andWhere('pod.namespace', namespace)
          .andWhere('img.deleted_at', null);
        if (page && limit) {
            query.limit(limit).offset(page * limit);
        }
        query.orderByRaw(`${parsedSort.field} ${parsedSort.direction}`);
        return await knexnest(query).then(image => plainToInstance(ListOfImagesDto, image));
    }

    async getAllRunningImages(clusterId: number): Promise<ListOfImagesDto[]>{
          const knex = await this.databaseService.getConnection();
          const query = knex
            .select([
                'img.id as _id',
                'img.url as _url',
                'img.name as _name',
                'img.tag as _tag',
                'img.docker_image_id as _dockerImageId',
                'img.cluster_id as _clusterId',
                'img.summary as _summary',
                'img.running_in_cluster as _runningInCluster',
                'img.last_scanned as _lastScanned',
                'img.scan_results as _scanResults',
            ])
            .from('images as img')
            .andWhere('img.deleted_at', null)
            .andWhere('img.cluster_id', clusterId)
            .andWhere('img.running_in_cluster', true);

          return await knexnest(query).then(image => plainToInstance(ListOfImagesDto, image));
      }

    async getAllRunningImagesByPodName(
      clusterId: number, namespace: string, podName: string,
      page?: number, limit?: number,
      sort: {field: string; direction: string; } = {field: 'id', direction: 'desc'},
    ): Promise<ListOfImagesDto[]>
    {
        const parsedSort = this.setSortFieldAndDirection(sort);const knex = await this.databaseService.getConnection();
        const query = knex
          .select(this.fieldsToRetrieveInAGetAll)
          .from('images as img')
          .leftJoin('pod_images as pi', function() {
              this.on('img.id', '=', 'pi.image_id');
          })
          .leftJoin('kubernetes_pods as kp', function(){
              this.on('kp.id','=','pi.pod_id')
          })
          .where('kp.name', podName)
          .andWhere('kp.cluster_id', clusterId)
          .andWhere('kp.namespace', namespace)
          .andWhere('img.deleted_at', null);
        if (page && limit) {
            query.limit(limit).offset(page * limit);
        }
        query.orderByRaw(`${parsedSort.field} ${parsedSort.direction}`);
        return await query.then(images => {
            const processedImages = [];
            for (const image of images) {
                processedImages.push(plainToInstance(ListOfImagesDto, image));
            }
            return processedImages;
        });
    }

    async getHistoricalImagesByPodIdAndDAte(
      clusterId: number, namespace: string, podId: number,
      startTime: string, endTime: string,
      page?: number, limit?: number,
      sort: {field: string; direction: string; } = {field: 'id', direction: 'desc'},
    ): Promise<ListOfImagesDto[]>{
        const knex = await this.databaseService.getConnection();
        const parsedSort = this.setSortFieldAndDirection(sort);
        const query = knex
          .select(this.fieldsToRetrieveInAGetAll)
          .from('images as img')
          .join('history_pod_images as pod_image', 'pod_image.image_id', 'img.id')
          .where('pod_image.history_pod_id', podId)
          .andWhere('pod.cluster_id', clusterId)
          .andWhere('pod.namespace', namespace)
          .andWhere('p.saved_date', '>=', startTime)
          .andWhere('p.saved_date', '<=', endTime)
          .andWhere('img.deleted_at', null);
        if (page && limit) {
            query.limit(limit).offset(page * limit);
        }
        query.orderByRaw(`${parsedSort.field} ${parsedSort.direction}`);
        return await knexnest(query).then(image => plainToInstance(ListOfImagesDto, image));
    }

    async getHistoricalImagesByPodNameAndDAte(
      clusterId: number, namespace: string, podName: string,
      startTime: string, endTime: string,
      page?: number, limit?: number,
      sort: {field: string; direction: string; } = {field: 'id', direction: 'desc'},
    ): Promise<ListOfImagesDto[]>
    {
        const knex = await this.databaseService.getConnection();
        const parsedSort = this.setSortFieldAndDirection(sort);
        const query = knex
          .select(this.fieldsToRetrieveInAGetAll)
          .from('images as img')
          .join('history_pod_images as pod_image', 'pod_image.image_id', 'img.id')
          .join('history_kubernetes_pods as pod', 'pod.id', 'pod_image.history_pod_id')
          .where('pod.name', podName)
          .andWhere('pod.cluster_id', clusterId)
          .andWhere('pod.namespace', namespace)
          .andWhere('pod.saved_date', '>=', startTime)
          .andWhere('pod.saved_date', '<=', endTime)
          .andWhere('img.deleted_at', null);
        if (page && limit) {
            query.limit(limit).offset(page * limit);
        }
        query.orderByRaw(`${parsedSort.field} ${parsedSort.direction}`);
        return await query.then(images => {
            const processedImages = [];
            for (const image of images) {
                processedImages.push(plainToInstance(ListOfImagesDto, image));
            }
            return processedImages;
        });
    }

    async countImage(searchClause: any): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const result = await knex('images as i')
          .count('i.id', {as: 'count'}).where(searchClause)
          .returning('count');
        return (result && result[0] && result[0].count) ? parseInt(result[0].count) : 0;
    }

    async loadImage(imageSearchClause?: any): Promise<ListOfImagesDto[]> {
        const knex = await this.databaseService.getConnection();
        const query = knex
          .select([
              'i.id as _id',
              'i.url as _url',
              'i.cluster_id as _clusterId',
              'i.name as _name',
              'i.tag as _tag',
              'i.docker_image_id as _dockerImageId',
              'i.summary as _summary',
              knex.raw(`TO_CHAR(TO_TIMESTAMP(i.updated_at/1000), 'MM/DD/YYYY HH:MI PM') as "_lastScanned"`),
              knex.raw(`CASE WHEN i.running_in_cluster IS TRUE THEN 'YES' ELSE 'NO' END as "_runningInCluster"`),
              'i.scan_results as _scanResults',
              'i.scan_queued as _scanQueued'
          ])
          .from('images as i')
          .where(imageSearchClause)
          .orderBy('i.id', 'desc');

        if (imageSearchClause.hasOwnProperty('ki.namespace')) {
            query.leftJoin('kubernetes_images as ki', function() {
                this.on('ki.cluster_id', '=', 'i.cluster_id');
                this.on('ki.image_id', '=', 'i.id');
            });
        }

        return knexnest(query).then(image => plainToInstance(ListOfImagesDto, image));
    }

    async loadImageWithId(imageId: number, clusterId: number): Promise<ImageDto[]> {
        const knex = await this.databaseService.getConnection();
        const query = knex
          .select([
              'i.id as _id',
              'i.url as _url',
              'i.cluster_id as _clusterId',
              'i.name as _name',
              'i.tag as _tag',
              'i.docker_image_id as _dockerImageId',
              'i.summary as _summary',
              'i.last_scanned as _lastScanned',
              knex.raw(`CASE WHEN i.running_in_cluster IS TRUE THEN 'YES' ELSE 'NO' END as "_runningInCluster"`),
              'i.scan_results as _scanResults',
              'i.scan_queued as _scanQueued',
              'i.scan_results as _scanResults',
              'i.scan_queued as _scanQueued',
              knex.raw(`COALESCE(i.critical_issues, 0) as "_criticalIssues"`),
              knex.raw(`COALESCE(i.major_issues, 0) as "_majorIssues"`),
              knex.raw(`COALESCE(i.medium_issues, 0) as "_mediumIssues"`),
              knex.raw(`COALESCE(i.low_issues, 0) as "_lowIssues"`),
              knex.raw(`COALESCE(i.negligible_issues, 0) as "_negligibleIssues"`),
          ])
          .from('images as i')
          .where('i.id', imageId)
          .andWhere('i.deleted_at', null)
          .andWhere('i.cluster_id', clusterId);

        return knexnest(query).then(image => plainToInstance(ImageDto, image));
    }


    async getImageDetailsByImageId(imageSearchClause?: any): Promise<any>{
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
          .select([
              'i.id as _id',
              'i.url as _url',
              'i.cluster_id as _clusterId',
              'i.name as _name',
              'i.tag as _tag'
          ])
          .from('images as i')
          .where(imageSearchClause))
          .then(image => plainToInstance(ListOfImagesDto, image));
    }

    async getImageDetailsForScanImage(imageSearchClause?: any):Promise<any>{
        const knex = await this.databaseService.getConnection();
        const registryQuery = knex.select([
            'dr.id',
            'dr.name',
            'dr.hostname',
            'dr.login_required',
            'dr.username',
            'dr.password',
            'dr.auth_type',
            'dr.auth_details',
            knex.raw('array_remove(array_agg(ra.alias), NULL) as aliases')
        ])
            .from('docker_registries AS dr')
            .leftJoin('docker_registry_aliases as ra', 'ra.docker_registry_id', 'dr.id')
            .where('deleted_at', null)
            .groupBy('dr.id');

        const query = knex.select([
            'i.id as _image_id',
            'i.name as _image_name',
            'i.tag as _image_tag',
            'i.docker_image_id as _image_hash',
            'i.url as _image_url',
            'c.id as _cluster_id',
            'c.name as _cluster_name',
            knex.raw('COALESCE(r.id, 0) as "_dockerRegistry_id"'),
            knex.raw(`COALESCE(r.name, '') as "_dockerRegistry_name"`),
            knex.raw(`COALESCE(r.hostname, '') as "_dockerRegistry_hostname"`),
            'r.aliases as _dockerRegistry_aliases',
            knex.raw('COALESCE(r.login_required, false) as "_dockerRegistry_loginRequired"'),
            knex.raw(`COALESCE(r.username, '') as "_dockerRegistry_username"`),
            knex.raw(`COALESCE(r.password, '') as "_dockerRegistry_password"`),
            knex.raw(`COALESCE(active_policy.total, 0) as "_policyCount"`),
        ])
          .from('images as i')
          .leftJoin('clusters as c', function (){
              this.on('i.cluster_id', '=', 'c.id')
          })
            .leftJoin(registryQuery.as('r'),
                function () {
                this.on('i.url', '=', 'r.hostname')
                .orOn(knex.raw('ARRAY[i.url] && r.aliases'));
            })
          .leftJoin('policy_cluster as pc', function () {
              this.on('pc.cluster_id', '=', 'c.id')
          })
          .leftJoin(
            knex.select(
              'cluster_id',
              knex.raw('count(1) as total')
            ).from('policy_cluster').leftJoin('policies', function() {
                this.on('policy_cluster.policy_id', '=', 'policies.id')
            }).where({'policy_cluster.active': true, 'policies.enabled': true, 'policies.deleted_at': null})
              .groupBy('cluster_id')
              .as('active_policy'), 'active_policy.cluster_id', 'c.id'
          ).where(imageSearchClause);
        return knexnest(query);
    }

    /*
        The purpose of this function:
        . When we create a policy relevant for all clusters, we map that policy for every cluster in policy_cluster table.
        . But when we create a new cluster, we are not updating the policy_cluster table to map the existing global
          policies with the new cluster.
        That's why we are creating this function to count the global policies that has no mapping in cluster_policy table
        with a certain cluster id.
        ---------------------------------------------------------------------------------------------------------------------
        We could create a cron job to update the policy cluster mapping.
    */
    async countGlobalPoliciesNotIncludedInPolicyCluster(clusterId: number): Promise<{globalPolicyCount: number}> {
        const knex = await this.databaseService.getConnection();
        const query = knex.select([
            knex.raw(`count(*) as "_globalPolicyCount"`)
        ])
          .from('policies as p')
          .where('p.relevant_for_all_clusters', true)
          .andWhere('p.deleted_at', null)
          .andWhereRaw(`p.id NOT IN (select policy_id from policy_cluster where policy_cluster.cluster_id = ?)`,[clusterId]);
        // console.log(query.toSQL());
        return knexnest(query).then(data => data[0]);
    }

    async createImage(imageDto: any, clusterId: number): Promise<Array<{id: number}>> {
        this.logger.debug({label: 'About to create new image', data: {imageDto, clusterId}});
        imageDto.cluster_id = clusterId;
        imageDto.image = imageDto.url + '/' + imageDto.name + ':' + imageDto.tag;
        const knex = await this.databaseService.getConnection();
        return knex.insert(imageDto).into('images').returning(['id']);
    }

    async updateImage(updateImageData: ImageCreateDto, searchClause: any): Promise<number> {
        const knex = await this.databaseService.getConnection();

        return knexnest(knex
          .where(searchClause)
          .whereNull('deleted_at')
          .update(updateImageData, ['id'])
          .into('images')).then(image => image.id);
    }

    async updateImageForRescan(updateImageData: ImageRescanDto, searchClause: any): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const updateImageDataPlain = instanceToPlain(updateImageData)

        this.logger.debug({label: 'Updating image for rescan', data: {updateImageDataPlain}});

        return knexnest(knex
          .where(searchClause)
          .whereNull('deleted_at')
          .update(updateImageDataPlain, ['id'])
          .into('images')).then(image => image.id);
    }

    async massUpdateImages(updateImageData: any, searchConditions: Array<{field: string; condition: string; value: string | number | Array<number>}>): Promise<Array<number>> {
        const knex = await this.databaseService.getConnection();
        const query = knex.whereNull('deleted_at').into('images');
        searchConditions.forEach(param => {
            if (param.condition.toLowerCase() === 'in' && Array.isArray(param.value) && param.value.length > 0) {
                query.whereIn(param.field, param.value);
            }

            if (param.condition.toLowerCase() === '=') {
                query.where(param.field, param.condition, param.value);
            }
        });

        if (!updateImageData.hasOwnProperty('updated_at')) {
            updateImageData['updated_at'] = knex.raw('getCurrentUnixTimestamp() * 1000')
        }

        query.update(updateImageData, ['id']);
        return await knexnest(query).then(result => result.id);
    }

    async deleteImageById(searchClause: any): Promise<number> {
        const deletedTime = {
            deleted_at: Math.round((new Date()).getTime())
        };
        const knex = await this.databaseService.getConnection();
        return knexnest(knex.where(searchClause).update(deletedTime, ['id']).into('images as i')).then(image => image.id);
    }

    async saveImageScanByImageId(scanImageData: any): Promise<number[]> {
        const knex = await this.databaseService.getConnection();

        return knexnest(knex.transaction(async trx => {
            // update all scan is_latest = false for previous scans
            await trx.into('image_scan_results').update({'is_latest': false}).where({
                'image_id': scanImageData.image_id
            });

            scanImageData['is_latest'] = true; // set the new scan result to is_latest = true

            const issuesData: any = JSON.parse(scanImageData.issues);
            delete scanImageData.issues;
            delete scanImageData.docker_image_id;
            const createdSaveImageIds: any = await trx.into('image_scan_results').insert(scanImageData)
              .returning(['id']).then(results => !!results ? results.map(r => r?.id) : []);
            if (issuesData?.length) {
              await trx.into('image_scan_results_issues').insert(issuesData.map(issue => {
                const issueDataToJson = JSON.parse(issue.data);
                return {
                  ...issue,
                  image_results_id: createdSaveImageIds[0],
                  package_name: issueDataToJson.PkgName,
                  installed_version: issueDataToJson.InstalledVersion,
                  fixed_version: issueDataToJson.FixedVersion
                };
              }));
            }
            return createdSaveImageIds;
        }));
    }

    async getCountOfImageScanData(imageId: number): Promise<number>{
        const knex = await this.databaseService.getConnection();
        const result =  await knex('image_scan_results as i').count('i.id', {as: 'count'})
          .where('i.image_id', imageId)
          .andWhere('i.deleted_at', null)
          .returning('count');

        return (result && result[0] && result[0].count) ? result[0].count : 0;
    }

    async getCountOfImageScanDataWithScanDate(imageId: number, scanDate: number): Promise<number>{
        const knex = await this.databaseService.getConnection();
        const result =  await knex('image_scan_results as i').count('i.id', {as: 'count'})
          .where({
              'i.image_id': imageId,
              'i.deleted_at': null,
              'i.created_at': scanDate
          })
          .returning('count');

        return (result && result[0] && result[0].count) ? result[0].count : 0;
    }

    async totalVulnerabilitySeverityByCluster(clusterId: number,
                                              sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
      Promise<TotalSeverityResultsDto[]> {
        const knex = await this.databaseService.getConnection();
        const sortFieldMap = {
            'namespace': 'kn.name'
        };

        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['namespace'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';

        const query = knex('kubernetes_namespaces as kn')
          .select([
              'kn.name as namespace',
          ]).sum({
              criticalIssues: 'i.critical_issues',
              majorIssues: 'i.major_issues',
              mediumIssues: 'i.medium_issues',
              lowIssues: 'i.low_issues',
              negligibleIssues: 'i.negligible_issues'
          })
          .leftJoin('kubernetes_images as ki', function () {
              this.on('kn.name', '=', 'ki.namespace')
                .andOn('kn.cluster_id', '=', 'ki.cluster_id')
          })
          .leftJoin('images as i', 'i.id', 'ki.image_id')
          .groupByRaw('kn.name')
          .orderByRaw(`${sort.field} ${sort.direction}`)
          .where({
              'kn.cluster_id': clusterId
          });
        // console.log(query.toSQL());
        return query;
    }

    async getCountOfFilteredImagesVulnerabilities(filters: any, groupBy: string): Promise<any> {
        const fields = {
            'clusterId': 'hki.cluster_id',
            'runningInCluster': 'hki.running_in_cluster'
        };

        const searchParams = {};

        Object.keys(fields).forEach(key => {
            if (filters && filters.hasOwnProperty(key)) {
                searchParams[fields[key]] = filters[key];
            }
        });

        const knex = await this.databaseService.getConnection();

        let subQuery = knex
            .select([
                'history_kubernetes_images.image',
                'history_kubernetes_images.image_hash',
                'history_kubernetes_images.cluster_id',
                'history_kubernetes_images.saved_date',
                'history_kubernetes_images.image_id',
                'i.running_in_cluster'
            ])
            .from('history_kubernetes_images')
            .leftJoin('images as i', 'i.id', 'history_kubernetes_images.image_id');
        if (filters['namespace']?.length > 0) {
            subQuery = subQuery.whereIn('history_kubernetes_images.namespace', filters['namespace']);
        }
        subQuery = subQuery.groupBy([
            'history_kubernetes_images.image',
            'history_kubernetes_images.image_hash',
            'history_kubernetes_images.cluster_id',
            'history_kubernetes_images.saved_date',
            'history_kubernetes_images.image_id',
            'i.running_in_cluster'
        ]).as('hki');

        let query = knex(subQuery)
            .select(
                knex.raw(`hki.saved_date as "savedAtDate",
                SUM(r.critical_issues) as "criticalIssues",
                SUM(r.major_issues) as "majorIssues",
                SUM(r.medium_issues) as "mediumIssues",
                SUM(r.low_issues) as "lowIssues",
                SUM(r.negligible_issues) as "negligibleIssues"`)
            )
            .leftJoin('image_scan_results as r', function () {
                this.on('hki.image_id', '=', 'r.image_id');
            })
            .whereNotNull('hki.image_id')
            .whereNotNull('hki.image')
            .where({
                'r.is_latest': true,
                'r.deleted_at': null
            });

        Object.keys(searchParams).forEach(value => {
            if (Array.isArray(searchParams[value])) {
                if (searchParams[value].length > 0) {
                    query = query.whereIn(value, searchParams[value]);
                }
            } else {
                query = query.where(value, searchParams[value]);
            }
        });

        if (filters.hasOwnProperty('startDate')) {
            query = query.andWhere('hki.saved_date', '>=', filters['startDate']);
        }

        if (filters.hasOwnProperty('endDate')) {
            query = query.andWhere('hki.saved_date', '<=', filters['endDate']);
        }

        if (groupBy === 'savedAtDate') {
            query = query.groupByRaw(`hki.saved_date`);
        }

        query = query.orderBy('hki.saved_date', 'asc');

        return query;
    }

    async getCountOfTotalImagesRunningCount(filters: any): Promise<any>{
        const knex = await this.databaseService.getConnection();
        const query = knex('images').count('id as count')
          .where(filters);
        return query;
    }

    async getImageScanDataByImageId(imageId: number,
                                    scanDate: number,
                                    page = 0, limit = 10,
                                    sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
      Promise<ImageScanResultsDto[]>{
        const knex = await this.databaseService.getConnection();

        const sortFieldMap = {
            'id': 'i.id',
            'policy': 'p.name',
            'critical_issues': 'i.critical_issues',
            'major_issues': 'i.major_issues',
            'low_issues': 'i.low_issues',
            'negligible_issues': 'i.negligible_issues',
            'medium_issues': 'i.medium_issues',
            'status': 'i.policy_status'
        };

        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';

        return knexnest(knex
          .select([
              'i.id as _id',
              'i.image_id as _imageId',
              'i.summary as _summary',
              'i.critical_issues as _criticalIssues',
              'i.major_issues as _majorIssues',
              'i.medium_issues as _mediumIssues',
              'i.low_issues as _lowIssues',
              'i.negligible_issues as _negligibleIssues',
              'i.encounter_error as _encounterError',
              'i.started_at as _startedAt',
              'i.finished_at as _finishedAt',
              'i.policy_id as _policyId',
              'i.policy_status as _policyStatus',
              'p.name as _policyName',
              'p.enforcement as _policyRequirement'
          ])
          .from('image_scan_results as i')
          .leftJoin('policies as p', function () {
              this.on('i.policy_id', '=', 'p.id')
          })
          .where({
              'i.image_id': imageId,
              'i.deleted_at': null,
              'i.created_at': scanDate
          })
          .limit(limit)
          .offset(page * limit)
          .orderByRaw(`${sort.field} ${sort.direction}`))
          .then( imageScanResults => {
              return imageScanResults;
          });
    }

    async getLatestImageScanDataByImageId(imageId: number, policyId: number, scannerId: number): Promise<ImageScanResultsDto[]>{
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
          .select([
              'i.id as _id',
              //'i.scanner_name as _scannerName',
              'i.image_id as _imageId',
              'i.summary as _summary',
              //'i.scan_results as _scanResults',
              'i.critical_issues as _criticalIssues',
              'i.major_issues as _majorIssues',
              'i.medium_issues as _mediumIssues',
              'i.low_issues as _lowIssues',
              'i.negligible_issues as _negligibleIssues',
              'i.encounter_error as _encounterError',
              'i.started_at as _startedAt',
              'i.finished_at as _finishedAt',
              'i.policy_id as _policyId',
              'i.policy_status as _policyStatus',
              'p.name as _policyName',
              'p.enforcement as _policyRequirement'
          ])
          .from('image_scan_results as i')
          .where({
              'i.image_id': imageId,
              'i.policy_id': policyId,
              // 'i.scanner_id': scannerId, // @TODO: Need to save this scanner in here someday
              'i.deleted_at': null
          }).leftJoin('policies as p', function () {
              this.on('i.policy_id', '=', 'p.id')
          })
          .orderBy('i.created_at', 'desc'))
          .then( imageScanResults => imageScanResults);
    }

    async getLatestImageScanDataByPolicy(imageId: number, policyId: number): Promise<ImageScanResultWithIssuesDto[]>{
        const knex = await this.databaseService.getConnection();

        const query = knexnest(knex
          .select([
              'i.id as _id',
              //'i.scanner_name as _scannerName',
              'i.image_id as _imageId',
              'i.summary as _summary',
              //'i.scan_results as _scanResults',
              'i.critical_issues as _criticalIssues',
              'i.major_issues as _majorIssues',
              'i.medium_issues as _mediumIssues',
              'i.low_issues as _lowIssues',
              'i.negligible_issues as _negligibleIssues',
              'i.encounter_error as _encounterError',
              'i.started_at as _startedAt',
              'i.finished_at as _finishedAt',
              'i.policy_id as _policyId',
              'i.policy_status as _policyStatus',
              'p.name as _policyName',
              'p.enforcement as _policyRequirement',
              'p.id as _policyId',
              'isc.id as _issues__id',
              'isc.scanner_id as _issues__scannerId',
              'isc.type as _issues__type',
              'isc.severity as _issues__severity',
              'isc.is_fixable as _issues__isFixable'
          ])
          .from('image_scan_results as i')
          .leftJoin('policies as p', 'i.policy_id', 'p.id')
          .leftJoin('image_scan_results_issues as isc', 'isc.image_results_id', 'i.id')
          .where('i.image_id', imageId)
          .where('i.policy_id', policyId)
          .whereNull('i.deleted_at')
          .where('i.is_latest', true));

          return query.then(result => {
              return plainToInstance(ImageScanResultWithIssuesDto, result)
          });
    }

    async updateImageScanDateByImageId(imageId: number, scanResults: string,
                                       critical_issues: number,
                                       major_issues: number,
                                       medium_issues: number,
                                       low_issues: number,
                                       negligible_issues: number,
                                       imageHash?: string): Promise<any> {
        const knex = await this.databaseService.getConnection();
        let updates = {
            updated_at: knex.raw('getCurrentUnixTimestamp() * 1000'),
            scan_results: scanResults,
            last_scanned: knex.raw('getCurrentUnixTimestamp() * 1000'),
            critical_issues, major_issues, medium_issues, low_issues, negligible_issues
        };
        if (imageHash) {
            updates = Object.assign({}, updates, {docker_image_id: imageHash});
        }

        const query = knex
          .where('id', +imageId)
          .update(updates, ['id'])
          .into('images');
        return query;
    }

    async searchImageUnderClusterId(clusterId: number, searchTerm: string,
                                    page = 0, limit = 10,
                                    sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'},
                                    options?: {cve?: string, onlyRunning?: boolean}):
      Promise<{totalCount: number, list: ImageDto[]}>{
        const knex = await this.databaseService.getConnection();
        const sortFieldMap = {
            'id':'i.id',
            'name': 'i.name',
            'date': 'i.updated_at',
            'runningCluster': 'i.running_in_cluster',
            'scanResult': 'i.scan_results'
        };

        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';
        const query = knex
          .select([
              'i.id as id',
              'i.url as url',
              'i.cluster_id as clusterId',
              'i.name as name',
              'i.tag as tag',
              'i.docker_image_id as dockerImageId',
              'i.summary as summary',
              'i.last_scanned as lastScanned',
              knex.raw(`CASE WHEN i.running_in_cluster IS TRUE THEN 'YES' ELSE 'NO' END as "runningInCluster"`),
              'i.scan_results as scanResults',
              'i.scan_queued as scanQueued',
              'i.scan_results as scanResults',
              'i.scan_queued as scanQueued',
              knex.raw(`COALESCE(i.critical_issues, 0) as "criticalIssues"`),
              knex.raw(`COALESCE(i.major_issues, 0) as "majorIssues"`),
              knex.raw(`COALESCE(i.medium_issues, 0) as "mediumIssues"`),
              knex.raw(`COALESCE(i.low_issues, 0) as "lowIssues"`),
              knex.raw(`COALESCE(i.negligible_issues, 0) as "negligibleIssues"`),
          ])
          .from('images as i')
          // .whereRaw(`i.url ~* ? and i.cluster_id = ?`, [searchTerm.trim(), clusterId])
          // .orWhereRaw(`i.name ~* ? and i.cluster_id = ?`, [searchTerm.trim(), clusterId])
          // .orWhereRaw(`i.tag ~* ? and i.cluster_id = ?`, [searchTerm.trim(), clusterId])
          .where('i.deleted_at', null);
        if(options?.onlyRunning) {
            query.where('i.running_in_cluster', true);
        }
        if(searchTerm) {
            query.whereRaw(`CONCAT(i.url, '/', i.name, ':', i.tag) LIKE ?`,  [`%${searchTerm.trim()}%`]);
        }
        if (options?.cve.length > 0) {
            query.leftJoin('image_scan_results as imr', 'imr.image_id', 'i.id')
                .leftJoin('image_scan_results_issues as imi', 'imi.image_results_id', 'imr.id')
                .where('imi.type', 'ilike', `%${options?.cve}%`)
                .groupBy('i.id');
        }

        query.where('i.cluster_id', clusterId)
            .andWhereRaw(`i.cluster_id IN (select id from clusters as c where c.deleted_at IS NULL)`)

        const findCount = await knex
            .select( [knex.raw( 'count (*)')])
            .from(query.as("q"));
        const totalCount = ( findCount && findCount[0] && findCount[0].count) ? findCount[0].count : 0;

        if (limit) {
            query.limit(limit)
                .offset(page * limit)
                .orderByRaw(`${sort.field} ${sort.direction} nulls last`);
        }

        const list = await query.then(data => {
            return plainToInstance(ImageDto, data);
        });

        return {
            list: list,
            totalCount: +totalCount
        }
    }

    async getScanImageScannerDetails(searchClause: any): Promise<ImageScanResultScannerDto[]>{
        const knex = await this.databaseService.getConnection();

        return knexnest(knex.select([
            'scan.id as _id',
            //'scan.scanner_name as _scannerName',
            'scan.image_id as _imageId',
            'scan.summary as summary',
            'scan.issues as _issues',
            'scan.scan_results as _scanResult',
            'scan.critical_issues as _criticalIssues',
            'scan.major_issues as _majorIssues',
            'scan.medium_issues as _mediumIssues',
            'scan.low_issues as _lowIssues',
            'scan.negligible_issues as _negligibleIssues',
            'scan.created_at as _createdAt',
            'scan.updated_at as _updatedAt'

        ]).from('image_scan_results as scan')
          .where(searchClause))
          .then(scanner=> plainToInstance(ImageScanResultScannerDto, scanner));
    }

    async getTotalVulnerabilities(clusterId: number, filters: any = {}): Promise<any> {
        const fields = {}

        const searchParams = {};

        Object.keys(fields).forEach(key => {
            if(filters && filters.hasOwnProperty(key)) {
                searchParams[fields[key]] = filters[key];
            }
        });

        const knex = await this.databaseService.getConnection();
        const query = knex('images')
          .select(
            knex.raw(`SUM(images.critical_issues + images.major_issues + images.medium_issues + 
                images.low_issues + images.negligible_issues) AS "totalVulnerabilities"`)
          )
          .where({
              'images.running_in_cluster': true,
              'images.cluster_id': clusterId,
              'images.deleted_at': null
          })

        Object.keys(searchParams).forEach(value => {
            if(Array.isArray(searchParams[value])) {
                if(searchParams[value].length > 0) {
                    query.whereIn(value, searchParams[value]);
                }
            } else {
                query.where(value, searchParams[value]);
            }
        });

        if (filters.hasOwnProperty('startDate')) {
            query.whereRaw(`TO_TIMESTAMP(CAST(isr.created_at/1000 AS BIGINT))::DATE >= ?`, [filters['startDate']]);
        }

        if (filters.hasOwnProperty('endDate')) {
            query.whereRaw(`TO_TIMESTAMP(CAST(isr.created_at/1000 AS BIGINT))::DATE <= ?`, [filters['endDate']]);
        }
        console.log(query.toSQL());
        return query;
    }

    async getPolicyViolationCount(cluster_id: number): Promise<any>{
        const knex = await this.databaseService.getConnection();
        const query = knex('image_scan_results as isr')
          .count('isr.policy_status as count')
          .leftJoin('images as i', function(){
              this.on('isr.image_id', '=', 'i.id')
          })
          .where({
              'i.cluster_id': cluster_id,
              'i.running_in_cluster': true,
              'isr.policy_status': false,
              'isr.is_latest': true,
              'isr.deleted_at': null
          });
        return query;
    }

    async getCountOfImageScan(clusterIds : any): Promise<ImageScanCountDto[]> {
        const knex = await this.databaseService.getConnection();
        const query = knex('image_scan_results as i')
          .select(
            knex.raw(`TO_TIMESTAMP(CAST(i.created_at/1000 AS BIGINT))::DATE as "date",
                COUNT(i.id) as "count"`)
          )
          .groupByRaw('TO_TIMESTAMP(CAST(i.created_at/1000 AS BIGINT))::DATE')
          .whereRaw(`
                TO_TIMESTAMP(CAST(i.created_at/1000 AS BIGINT))::DATE >= (CURRENT_TIMESTAMP::DATE - 28)
                AND TO_TIMESTAMP(CAST(i.created_at/1000 AS BIGINT))::DATE <= CURRENT_TIMESTAMP::DATE
            `)
          .leftJoin('images as image', function () {
              this.on('i.image_id', '=', 'image.id')
          })
          .whereRaw(`image.id IS NOT NULL`)
          .andWhere('i.deleted_at', null);

        Object.keys(clusterIds).forEach(value => {
            if (Array.isArray(clusterIds[value])) {
                if (clusterIds[value].length > 0) {
                    query.whereIn('image.cluster_id', clusterIds[value]);
                }
            } else {
                query.where(value, clusterIds[value]);
            }
        });

        query.orderBy('date', 'asc');

        return await query.then(imageScan => plainToInstance(ImageScanCountDto, imageScan));
    }

    async getDistinctDatesForImageScan(imageId: number): Promise<Array<{created_at: number}[]>> {
        const knex = await this.databaseService.getConnection();
        const query = knex('image_scan_results as i')
          .distinct('i.created_at')
          .where({'i.image_id': imageId, 'i.deleted_at': null})
          .orderBy('i.created_at', 'desc');
        return query.then(result => result);

    }

    async setImageScanQueueStatus(imageId: number, status: boolean): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const query = knex('images')
          .where({'id': imageId})
          .update({'scan_queued': status}, ['id']);
        // console.log(query.toSQL());
        return await query
          .then(result => result[0].id);
    }

    async getImageSanQueueStatus(imageId: number): Promise<boolean> {
        const knex = await this.databaseService.getConnection();
        const query = knex('images as i')
          .select('i.scan_queued as _scanQueued')
          .where('i.id', imageId)
        return knexnest(query)
          .then(result => result[0].scanQueued);
    }

    async getImagesForPod(podId: number): Promise<ListOfImagesDto[][]> {
        const knex = await this.databaseService.getConnection();
        const query = knex
          .select([
              'i.id as _id',
              'i.url as _url',
              'i.cluster_id as _clusterId',
              'i.name as _name',
              'i.tag as _tag',
              'i.docker_image_id as _dockerImageId',
              'i.summary as _summary',
              knex.raw(`TO_CHAR(TO_TIMESTAMP(i.updated_at/1000), 'MM/DD/YYYY HH:MIPM') as "_lastScanned"`),
              'i.running_in_cluster as "_runningInCluster"',
              'i.scan_results as _scanResults',
              'i.scan_queued as _scanQueued'
          ])
          .from('images as i')
          .leftJoin('pod_images as pi', function() { this.on('pi.image_id', '=', 'i.id')})
          .where({'pi.pod_id': podId});

        return knexnest(query).then(image => plainToInstance(ListOfImagesDto, image));
    }

    /**
     * Mark images as not running in cluster (and remove kubernetes_images entries) that are no longer running in the cluster
     * @param clusterId
     * @param imageIds
     * @param k8sImageIds
     */
    async updateRunningImages(clusterId: number, imageIds: Array<number>, k8sImageIds: Array<number>) {
        const knex = await this.databaseService.getConnection();
        return Promise.all([

            // mark some as NOT RUNNING in cluster
            knex.where({ 'cluster_id': clusterId })
              .whereNotIn('id', imageIds)
              .update({ 'running_in_cluster': false })
              .into('images'),

            // and mark some as RUNNING in cluster
            knex.where({ 'cluster_id': clusterId })
              .whereIn('id', imageIds)
              .update({ 'running_in_cluster': true })
              .into('images'),

            // clear out old k8s images data
            knex('kubernetes_images')
              .whereNotIn('id', k8sImageIds)
              .andWhere('cluster_id', clusterId)
              .delete()
        ]);

    }

    async getK8sImageByDockerImageHash(imageHash: string): Promise<any> {
        const knex = await this.databaseService.getConnection();
        const query = knex
          .select([
              'ki.namespace',
              'ki.image'
          ])
          .from('kubernetes_images as ki')
          .where('ki.image_hash', imageHash);
        // console.log(query.toSQL());
        return query.then(data => {
            return data;
        });
    }

    async getNamespaceByImageHash(imageHash: string): Promise<{ name: string }[]> {
        const knex = await this.databaseService.getConnection();
        const query = knex
          .select([
              'ki.namespace',
          ])
          .from('kubernetes_images as ki')
          .where('ki.image_hash', imageHash);
        // console.log(query.toSQL());
        return query.then(data => {
            return data;
        });
    }

    async getAllImagesByCompliance(complianceType: string|null): Promise<any> {
        const knex = await this.databaseService.getConnection();
        const query = knex
            .count('i.id as count')
            .from('images as i')
            .where('i.scan_results', complianceType);
        // console.log(query.toSQL());
        return query.then(data => {
            return data;
        });

    }

}
