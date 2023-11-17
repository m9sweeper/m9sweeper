import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../shared/services/database.service';
import { ImageScanResultsIssueDto } from '../dto/image-scan-results-issue-dto';
import { plainToInstance } from 'class-transformer';
import * as knexnest from 'knexnest';
import {PodIssueSummaryDto} from '../dto/pod-issue-summary.dto';

@Injectable()
export class ImageScanResultsIssueDao {
    constructor(private readonly databaseService: DatabaseService) {
    }

    async getCountOfImageScanResultsIssues(imageScanResultsId: number, policyId?: number): Promise<any> {
        const knex = await this.databaseService.getConnection();
        let query = knex('image_scan_results_issues as i').count('i.id as count')
           .where('i.image_results_id', imageScanResultsId)
           .andWhere('i.deleted_at', null);

        if (policyId) {
            query = query
                .leftJoin('image_scan_results as im', function () {
                    this.on('im.id', '=', 'i.image_results_id')
                })
                .leftJoin('scanners as s', function () {
                    this.on('s.id', '=', 'i.scanner_id')
                })
                .andWhere('im.policy_id', policyId);
        }

        const result = await query;
        return (result && result[0] && result[0].count) ? result[0].count : 0;
    }

    async getCountOfImageScanResultsIssuesByImageId(imageId: number): Promise<any> {
        const knex = await this.databaseService.getConnection();
        const result = await knex('image_scan_results_issues as i').count('i.id as count')
            .leftJoin('image_scan_results as im', function (){
                this.on('im.id', '=', 'i.image_results_id')
            })
            .where('im.image_id', imageId);
        return (result && result[0] && result[0].count) ? result[0].count : 0;
    }

    async getImageScanResultsIssuesByImageResultsId(
        imageResultsId: number,
        page = 0, limit = 10,
        sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'},
        policyId?: number): Promise<ImageScanResultsIssueDto[]> {
        const knex = await this.databaseService.getConnection();

        sort.direction = sort.direction?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        const sortFieldMap = {
            'id': [{column: 'i.id', order: sort.direction}],
            'scanner': [{ column: 's.name', order: sort.direction}, 'i.id'],
            'required_for_compliance': [{column: 'i.is_compliant', order: sort.direction}, 'i.id'],
            'scanner_name': [{column: 'i.name', order: sort.direction}, 'i.id'],
            'type': [{column: 'i.type', order: sort.direction}, 'i.id'],
            'severity': [{column: 'severity_index', order: sort.direction}, 'i.id'],
            'description': [{column: 'i.description', order: sort.direction}, 'i.id'],
            'is_fixable': [{column: 'i.is_fixable', order: sort.direction}, 'i.id'],
            'was_fixed': [{column: 'i.was_fixed', order: sort.direction}, 'i.id'],
            'package_name': [{column: 'i.package_name', order: sort.direction}, 'i.id'],
            'installed_version': [{column: 'i.installed_version', order: sort.direction}, 'i.id']
        };

        const sortArray = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        let query = knex
            .select([
                'i.id as _id',
                'i.image_results_id as _imageResultsId',
                'i.scanner_id as _scannerId',
                'i.name as _name',
                'i.vulnerability_desc_url as _vulnerabilityDescUrl',
                's.name as _scannerName',
                'i.type as _type',
                'i.severity as _severity',
                'i.description as _description',
                'i.is_compliant as _isCompliant',
                'i.is_fixable as _isFixable',
                'i.was_fixed as _wasFixed',
                'i.data as _extraData',
                'i.package_name as _packageName',
                'i.installed_version as _installedVersion',
                'i.fixed_version as _fixedVersion',
                'i.compliance_reason as _complianceReason',
                knex.raw(`
                    CASE
                        WHEN i.severity='Critical' THEN 5
                        WHEN i.severity='High' THEN 4
                        WHEN i.severity='Medium' THEN 3
                        WHEN i.severity='Low' THEN 2
                        WHEN i.severity='Negligible' THEN 1
                        ELSE 0
                    END AS severity_index
                `)
            ])
            .from('image_scan_results_issues as i');
        if (policyId) {
        query = query.leftJoin('image_scan_results as im', function () {
                this.on('im.id', '=', 'i.image_results_id')
            });
        }
        query = query.leftJoin('scanners as s', function (){
                this.on('s.id', '=', 'i.scanner_id')
            })
            .where({
                'i.image_results_id': imageResultsId,
                'i.deleted_at': null
            });
        if (policyId) {
            query = query.andWhere('im.policy_id', policyId);
        }
        query = query.limit(limit)
            .offset(page * limit)
            .orderBy(sortArray);

        return knexnest(query).then(data => plainToInstance(ImageScanResultsIssueDto, data));
    }

    async getAllImageScanResults(
        imageId: number, page = 0, limit = 10,
        sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}
    ): Promise<ImageScanResultsIssueDto[]>{
        const knex = await this.databaseService.getConnection();

        sort.direction = sort.direction?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        const sortFieldMap = {
            'id': [{column: 'i.id', order: sort.direction}],
            'scanner': [{column: 's.name', order: sort.direction}, 'i.id'],
            'required_for_compliance': [{column: 'i.is_compliant', order: sort.direction}, 'i.id'],
            'scanner_name': [{column: 'i.name', order: sort.direction}, 'i.id'],
            'type': [{column: 'i.type', order: sort.direction}, 'i.id'],
            'severity': [{column: 'severity_index', order: sort.direction}, 'i.id'],
            'description': [{column: 'i.description', order: sort.direction}, 'i.id'],
            'is_fixable': [{column: 'i.is_fixable', order: sort.direction}, 'i.id'],
            'was_fixed': [{column: 'i.was_fixed', order: sort.direction}, 'i.id']
        };

        const sortArray = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];

        return knexnest(knex
            .select([
                'i.id as _id',
                'i.image_results_id as _imageResultsId',
                'i.scanner_id as _scannerId',
                'i.name as _name',
                knex.raw('coalesce(s.name, i.scanner_name) as "_scannerName"'),
                'i.type as _type',
                'i.vulnerability_desc_url as _vulnerabilityDescUrl',
                'i.severity as _severity',
                'i.description as _description',
                'i.is_compliant as _isCompliant',
                'i.is_fixable as _isFixable',
                'i.was_fixed as _wasFixed',
                'i.compliance_reason as _complianceReason',
                knex.raw(`
                    CASE
                        WHEN i.severity='Critical' THEN 5
                        WHEN i.severity='High' THEN 4
                        WHEN i.severity='Medium' THEN 3
                        WHEN i.severity='Low' THEN 2
                        WHEN i.severity='Negligible' THEN 1
                        ELSE 0
                    END AS severity_index
                `)
            ])
            .from('image_scan_results_issues as i')
            .leftJoin('image_scan_results as im', function () {
                this.on('im.id', '=', 'i.image_results_id')
            })
            .leftJoin('scanners as s', function (){
                this.on('s.id', '=', 'i.scanner_id')
            })
            .where({
                'im.image_id': imageId,
                'i.deleted_at': null
            })
            .limit(limit)
            .offset(page * limit)
            .orderBy(sortArray))
            .then(data => plainToInstance(ImageScanResultsIssueDto, data));
    }

    async getCountOfImageScanResultsIssuesByImageIdFilteredByDate(imageId: number, scanDate: number): Promise<any> {
        const knex = await this.databaseService.getConnection();
        const result = await knex('image_scan_results_issues as i').count('i.id as count')
            .leftJoin('image_scan_results as im', function (){
                this.on('im.id', '=', 'i.image_results_id')
            })
            .where({
                'i.deleted_at': null,
                'im.image_id': imageId,
                'im.created_at': scanDate
            })
        return (result && result[0] && result[0].count) ? result[0].count : 0;
    }

    async getAllImageScanResultsFilteredByScanDate(
        imageId: number, scanDate: number,
        sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}
    ): Promise<ImageScanResultsIssueDto[]>{
        const knex = await this.databaseService.getConnection();

        sort.direction = sort.direction?.toLowerCase() === 'desc' ? 'desc' : 'asc';
        const sortFieldMap = {
            'id': [{column: 'i.id', order: sort.direction}],
            'scanner': [{column: 's.name', order: sort.direction}, 'i.id'],
            'required_for_compliance': [{column: 'i.is_compliant'}, 'i.id'],
            'scanner_name': [{column: 'i.name', order: sort.direction}, 'i.id'],
            'type': [{column: 'i.type', order: sort.direction}, 'i.id'],
            'severity': [{column: 'severity_index', order: sort.direction}, 'i.id'],
            'description': [{column: 'i.description', order: sort.direction}, 'i.id'],
            'is_fixable': [{column: 'i.is_fixable', order: sort.direction}, 'i.id'],
            'was_fixed': [{column: 'i.was_fixed', order: sort.direction}, 'i.id'],
            'package_name': [{column: 'i.package_name', order: sort.direction}, 'i.id'],
            'installed_version': [{column: 'i.installed_version', order: sort.direction}, 'i.id']
        };
        const sortArray = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];

        return await knexnest(knex
            .select([
                'i.id as _id',
                'i.image_results_id as _imageResultsId',
                'i.scanner_id as _scannerId',
                'i.name as _name',
                's.name as _scannerName',
                'i.type as _type',
                'i.vulnerability_desc_url as _vulnerabilityDescUrl',
                'i.severity as _severity',
                'i.description as _description',
                'i.is_compliant as _isCompliant',
                'i.is_fixable as _isFixable',
                'i.was_fixed as _wasFixed',
                'i.data as _extraData',
                'i.package_name as _packageName',
                'i.installed_version as _installedVersion',
                'i.fixed_version as _fixedVersion',
                'i.compliance_reason as _complianceReason',
                knex.raw(`
                    CASE
                        WHEN i.severity='Critical' THEN 5
                        WHEN i.severity='High' THEN 4
                        WHEN i.severity='Medium' THEN 3
                        WHEN i.severity='Low' THEN 2
                        WHEN i.severity='Negligible' THEN 1
                        ELSE 0
                    END AS severity_index
                `)
            ])
            .from('image_scan_results_issues as i')
            .leftJoin('image_scan_results as im', function () {
                this.on('im.id', '=', 'i.image_results_id')
            })
            .leftJoin('scanners as s', function () {
                this.on('s.id', '=', 'i.scanner_id')
            })
            .where({
                'im.image_id': imageId,
                'i.deleted_at': null,
                'im.created_at': scanDate
            })
            .orderBy(sortArray))
            .then(data => plainToInstance(ImageScanResultsIssueDto, data));
    }

    async getImageScanResultsIssuesByPolicyId(
        imageScanResultId: number, policyId: number, page = 0, limit = 10,
        sort: { field: string; direction: string; } = {field: 'id', direction: 'asc'}
    ): Promise<ImageScanResultsIssueDto[]> {
        const knex = await this.databaseService.getConnection();

        const sortFieldMap = {
            'id': 'i.id',
            'scanner': 's.name',
            'required_for_compliance': 'i.is_compliant',
            'scanner_name': 'i.name',
            'type': 'i.type',
            'severity': 'i.severity',
            'description': 'i.description',
            'is_fixable': 'i.is_fixable',
            'was_fixed': 'i.was_fixed'
        };

        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction?.toLowerCase() === 'desc' ? 'desc' : 'asc';

        const query = knex
            .select([
                'i.id as _id',
                'i.image_results_id as _imageResultsId',
                'i.scanner_id as _scannerId',
                'i.name as _name',
                's.name as _scannerName',
                'i.type as _type',
                'i.vulnerability_desc_url as _vulnerabilityDescUrl',
                'i.severity as _severity',
                'i.description as _description',
                'i.is_compliant as _isCompliant',
                'i.is_fixable as _isFixable',
                'i.was_fixed as _wasFixed',
                'i.data as _extraData',
                'i.package_name as _packageName',
                'i.installed_version as _installedVersion',
                'i.fixed_version as _fixedVersion',
                'i.compliance_reason as _complianceReason'
            ])
            .from('image_scan_results_issues as i')
            .leftJoin('image_scan_results as im', function () {
                this.on('im.id', '=', 'i.image_results_id')
            })
            .leftJoin('scanners as s', function () {
                this.on('s.id', '=', 'i.scanner_id')
            })
            .where({
                'im.id': imageScanResultId,
                'im.policy_id': policyId,
                'i.deleted_at': null
            })
            // .limit(limit)
            // .offset(page * limit)
            .orderByRaw(`${sort.field} ${sort.direction}`);
        return await knexnest(query)
            .then(data => plainToInstance(ImageScanResultsIssueDto, data));
    }

    async getAllIssuesForKubernetesPod(podId: number): Promise<PodIssueSummaryDto[]> {
      const knex = await this.databaseService.getConnection();
      const query = knex.select([
          knex.raw('i.url || \'/\' || i.name || \':\' || i.tag as image'),
        'isrs.severity as severity',
        'isrs.type as cve',
        'isrs.fixed_version as fixedVersion'
      ])
        .from('pod_images as pi')
        .leftJoin('images as i', 'i.id', 'pi.image_id')
        .leftJoin('image_scan_results as isr', knex.raw('isr.image_id = i.id AND isr.is_latest'))
        // Inner joining here prevents us from returning images that do not have any issues scan
        .innerJoin('image_scan_results_issues as isrs', 'isrs.image_results_id', 'isr.id')
        .where('pi.pod_id', '=', podId)
        .orderByRaw(`CASE
          WHEN isrs.severity ='Critical' THEN 5000
          WHEN isrs.severity ='High' THEN 4000
          WHEN isrs.severity ='Medium' THEN 3000
          WHEN isrs.severity ='Low' THEN 2000
          WHEN isrs.severity ='Negligible' THEN 1000
          END DESC`)
        // with a sort column of 1, it uses the 1st returned column, so this effectively sorts by the built image
        // name without having to redo the concatenation
        .orderByRaw('1 ASC')
        .orderBy('isrs.type', 'ASC');
      return query
        .then(res => plainToInstance(PodIssueSummaryDto, res));
    }
}
