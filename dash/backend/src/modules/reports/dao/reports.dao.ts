import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../shared/services/database.service';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ReportsVulnerabilityExportDto } from '../dto/reports-vulnerability-export-dto';
import { VulnerabilitySeverity } from '../../shared/enums/vulnerability-severity';
import { ReportsVulnerabilityExportPreviewDto } from '../dto/reports-vulnerability-export-preview-dto';
import {ReportsRunningVulnerabilitiesDto} from '../dto/reports-running-vulnerabilities-dto';
import {
    ReportsHistoricalVulnerabilitiesPreviewDto,
    ReportsRunningVulnerabilitiesPreviewDto
} from '../dto/reports-running-vulnerabilities-preview-dto';
import {ReportsHistoricalVulnerabilitiesDto} from '../dto/reports-historical-vulnerabilities-dto';
import {ReportsWorstImagesDto} from '../dto/reports-worst-images-dto';
import { format, parseISO } from 'date-fns';
import {ReportsDifferenceByDateDto} from '../dto/reports-difference-by-date-dto';
import knex, { Knex } from 'knex';
import { ReportsRunningVulnerabilitiesSummaryDto } from '../dto/reports-running-vulnerabilities-summary-dto';


@Injectable()
export class ReportsDao {
    constructor(
        private databaseService: DatabaseService,
    ) {}

    async getVulnerabilityExport(clusterId?: number, namespaces?: Array<string>,
                                 severityLevels?: Array<VulnerabilitySeverity>, fixAvailable?: string, limit?: number)
        : Promise<ReportsVulnerabilityExportPreviewDto>
    {
        const knex = await this.databaseService.getConnection();

        let subQuery = knex
            .select([
                'i.id',
                knex.raw("concat(i.name,':', i.tag) as image"),
                'i.running_in_cluster',
                knex.raw("array_agg(distinct ki.namespace) as namespaces")
            ])
            .from('images as i')
            .leftJoin(knex.raw('clusters as c on c.id=i.cluster_id'))
            .innerJoin(knex.raw('kubernetes_images as ki on ki.image_id = i.id'))
            .where('i.running_in_cluster', true)
            .andWhere('i.deleted_at', null)
            .andWhere('c.deleted_at', null);
        if (clusterId) {
            subQuery = subQuery.andWhere('i.cluster_id', clusterId);
        }
        if (namespaces) {
            subQuery = subQuery.whereIn('ki.namespace', namespaces);
        }
        subQuery = subQuery
            .groupBy([
                'i.id',
                'i.name',
                'ki.name'
            ])
            .orderByRaw("concat(i.name,':', i.tag) desc");

        let query = knex
            .select([
                'isrs.scanner_name',
                'image_details.id as image_id',
                'image_details.image',
                'image_details.running_in_cluster',
                'isrs.type',
                'isrs.severity',
                'isrs.is_fixable',
                'image_details.namespaces',
                'isrs.data'
            ])
            .from(subQuery.as('image_details'));
        if (severityLevels) {
            if (severityLevels.includes(VulnerabilitySeverity.MAJOR)) {
                /** Major vulnerabilities are stored as 'High' on this database, ensures that the proper values
                 * are being searched for */
                severityLevels.push(VulnerabilitySeverity.HIGH);
            }
            query = query.whereIn('isrs.severity', severityLevels);
        }
        if (fixAvailable) {
            query = query.andWhere('isrs.is_fixable', fixAvailable);
        }
        query = query.leftJoin(knex.raw('image_scan_results as isr on isr.image_id = image_details.id and isr.is_latest=true'))
            .innerJoin(knex.raw('image_scan_results_issues as isrs on isrs.image_results_id = isr.id'));

        const count = await knex
            .count('*', {as: 'entries'})
            .from(query.as('results'))
            .returning('entries')
            .then(resp => parseInt(resp[0].entries, 10));
        if (limit) {
            query.limit(limit);
        }

        const queryResults = await query.then((response) => {
            return plainToClass(ReportsVulnerabilityExportDto, response);
        });

        return {count, results: queryResults};
    }

    async getHistoricalVulnerabilityExport(targetDate: string, clusterId?: number, namespaces?: Array<string>,
                                     severityLevels?: Array<VulnerabilitySeverity>, fixAvailable?: string, limit?: number)
        : Promise<ReportsVulnerabilityExportPreviewDto> {
        const knex = await this.databaseService.getConnection();

        let subQuery = knex
            .select([
                'i.id',
                knex.raw("concat(i.name,':', i.tag) as image"),
                'i.running_in_cluster',
                knex.raw("array_agg(distinct hki.namespace) as namespaces")
            ])
            .from('images as i')
            .leftJoin(knex.raw('clusters as c on c.id=i.cluster_id'))
            .innerJoin(knex.raw('history_kubernetes_images as hki on hki.image_id = i.id'))
            .where('i.deleted_at', null)
            .andWhere('c.deleted_at', null)
            .andWhere('hki.saved_date', targetDate);
        if (clusterId) {
            subQuery = subQuery.andWhere('i.cluster_id', clusterId);
        }
        if (namespaces) {
            subQuery = subQuery.whereIn('hki.namespace', namespaces);
        }
        subQuery = subQuery
            .groupBy([
                'i.id',
                'i.name',
                'hki.name'
            ])
            .orderByRaw("concat(i.name,':', i.tag) desc");

        let query = knex
            .select([
                'isrs.scanner_name',
                'image_details.id as image_id',
                'image_details.image',
                'image_details.running_in_cluster',
                'isrs.type',
                'isrs.severity',
                'isrs.is_fixable',
                'image_details.namespaces',
                'isrs.data'
            ])
            .from(subQuery.as('image_details'));
        if (severityLevels) {
            if (severityLevels.includes(VulnerabilitySeverity.MAJOR)) {
                /** Major vulnerabilities are stored as 'High' on this database, ensures that the proper values
                 * are being searched for */
                severityLevels.push(VulnerabilitySeverity.HIGH);
            }
            query = query.whereIn('isrs.severity', severityLevels);
        }
        if (fixAvailable) {
            query = query.andWhere('isrs.is_fixable', fixAvailable);
        }
        query = query.leftJoin(
            knex.raw('image_scan_results as isr on isr.image_id = image_details.id and isr.is_latest=true')
        )
            .innerJoin(knex.raw('image_scan_results_issues as isrs on isrs.image_results_id = isr.id'));

        const count = await knex
            .count('*', {as: 'entries'})
            .from(query.as('results'))
            .returning('entries')
            .then(resp => parseInt(resp[0].entries, 10));

        if (limit) {
            query.limit(limit);
        }

        const queryResults = await query.then((response) => {
            return plainToClass(ReportsVulnerabilityExportDto, response);
        });

        return {count, results: queryResults};
    }

    async getRunningVulnerabilitiesQuery(
      clusterId?: number, options?: {namespaces?: Array<string>, limit?: number, isCompliant?: string}
    ): Promise<{ query: Knex.QueryBuilder, knex: Knex<any, any[]>}> {
      const knex = await this.databaseService.getConnection();

      let subQuery = knex.select([
        'i.id',
        knex.raw("concat(i.name,':', i.tag) as image"),
        'i.running_in_cluster',
        'i.scan_results',
        'i.last_scanned',
        knex.raw("array_agg(distinct ki.namespace) as namespaces")
      ])
        .from('images as i')
        .innerJoin('clusters as c', 'c.id', 'i.cluster_id')
        .innerJoin('kubernetes_images as ki', 'ki.image_id', 'i.id')
        .where('i.running_in_cluster', true)
        .andWhere('i.deleted_at', null)
        .andWhere('c.deleted_at', null)
        .andWhere('i.cluster_id', clusterId)
        .andWhere('c.id', clusterId)
        .andWhere('ki.cluster_id', clusterId);

      if (options?.namespaces) {
        subQuery = subQuery.whereIn('ki.namespace', options.namespaces);
      }
      if (options?.isCompliant) {
        subQuery = subQuery.andWhere('i.scan_results',
          options.isCompliant === 'true'? 'Compliant' : 'Non-compliant');
      }

      subQuery = subQuery
        .groupBy([
          'i.id',
          'i.name',
          'ki.name'
        ])
        .orderByRaw("concat(i.name,':', i.tag) desc");

      const query = knex.select([
        'image_details.id as image_id',
        'image_details.image',
        'image_details.running_in_cluster',
        'image_details.namespaces',
        'image_details.scan_results',
        'image_details.last_scanned',
        knex.raw("sum(case when severity = 'Critical' then 1 else 0 end) as total_critical"),
        knex.raw("sum(case when severity = 'Critical' and is_fixable=true then 1 else 0 end) as total_fixable_critical"),
        knex.raw("sum(case when severity = 'High' then 1 else 0 end) as total_major"),
        knex.raw("sum(case when severity = 'High' and is_fixable=true then 1 else 0 end) as total_fixable_major"),
        knex.raw("sum(case when severity = 'Medium' then 1 else 0 end) as total_medium"),
        knex.raw("sum(case when severity = 'Medium' and is_fixable=true then 1 else 0 end) as total_fixable_medium"),
        knex.raw("sum(case when severity = 'Low' then 1 else 0 end) as total_low"),
        knex.raw("sum(case when severity = 'Low' and is_fixable=true then 1 else 0 end) as total_fixable_low"),
        knex.raw("sum(case when severity = 'Negligible' then 1 else 0 end) as total_negligible"),
        knex.raw("sum(case when severity = 'Negligible' and is_fixable=true then 1 else 0 end) as total_fixable_negligible")
      ])
        .from(subQuery.as('image_details'))
        .leftJoin(knex.raw("image_scan_results as isr on isr.image_id = image_details.id and isr.is_latest=true"))
        .leftJoin(knex.raw('image_scan_results_issues as isrs on isrs.image_results_id = isr.id'))
        .groupBy([
          'image_details.id',
          'image_details.image',
          'image_details.running_in_cluster',
          'image_details.namespaces',
          'image_details.scan_results',
          'image_details.last_scanned'
        ])
        .orderBy('image_details.last_scanned', 'desc');

      return { query, knex };
    }

    async getRunningVulnerabilities(
      clusterId?: number, options?: {namespaces?: Array<string>, limit?: number, isCompliant?: string, page?: number, }
    ): Promise<ReportsRunningVulnerabilitiesPreviewDto> {
        const {  query, knex } = await this.getRunningVulnerabilitiesQuery(clusterId, options);

        const count = await knex
            .count('*', {as: 'entries'})
            .from(query.as('results'))
            .returning('entries')
            .then(resp => parseInt(resp[0].entries.toString(), 10));

        if (options?.limit) {
            query.limit(options.limit);
        }
        if (options?.page && options?.limit) {
            query.offset(options.page * options.limit);
        }

        // @ts-ignore
        const queryResults: ReportsRunningVulnerabilitiesDto[] = await query.then((response) => {
          return plainToInstance(ReportsRunningVulnerabilitiesDto, response);
        });

        return {count, results: queryResults};
    }

    async getRunningVulnerabilitiesSummary(
      clusterId?: number, options?: {namespaces?: Array<string>, limit?: number, isCompliant?: string}
    ): Promise<ReportsRunningVulnerabilitiesSummaryDto> {
      const {  query, knex } = await this.getRunningVulnerabilitiesQuery(clusterId, options);
      const outerquery = knex.select([
        knex.raw('SUM(summary_info.total_critical) AS total_critical'),
        knex.raw('SUM(summary_info.total_fixable_critical) AS total_fixable_critical'),
        knex.raw('SUM(summary_info.total_major) AS total_major'),
        knex.raw('SUM(summary_info.total_fixable_major) AS total_fixable_major'),
        knex.raw('SUM(summary_info.total_medium) AS total_medium'),
        knex.raw('SUM(summary_info.total_fixable_medium) AS total_fixable_medium'),
        knex.raw('SUM(summary_info.total_low) AS total_low'),
        knex.raw('SUM(summary_info.total_fixable_low) AS total_fixable_low'),
        knex.raw('SUM(summary_info.total_negligible) AS total_negligible'),
        knex.raw('SUM(summary_info.total_fixable_negligible) AS total_fixable_negligible')
      ]).from(query.as('summary_info'));
      return outerquery.first().then(result => plainToInstance(ReportsRunningVulnerabilitiesSummaryDto, result));
    }

    async getHistoricalRunningVulnerabilities(clusterId: number, date: string, options: {limit?: number, namespaces?: string[], isCompliant?: string, page?: number})
        : Promise<ReportsRunningVulnerabilitiesPreviewDto> {
        const knex = await this.databaseService.getConnection();

        let subQuery = knex.select([
            "history_kubernetes_images.image",
            "history_kubernetes_images.cluster_id",
            "history_kubernetes_images.saved_date as last_scanned",
            knex.raw("array_agg(distinct history_kubernetes_images.namespace) as namespaces"),
            "i.id", "i.scan_results", "history_kubernetes_images.image_id"])
            .from("history_kubernetes_images")
            .leftJoin("images as i", function() {
                this.on(
                    knex.raw("i.id = history_kubernetes_images.image_id " +
                        "AND i.cluster_id = history_kubernetes_images.cluster_id")
                );
            })
            .where("history_kubernetes_images.cluster_id", clusterId)
            .andWhere("history_kubernetes_images.saved_date", date)
            .andWhere("i.running_in_cluster", true)
            .groupBy(["history_kubernetes_images.image", "history_kubernetes_images.cluster_id",
                "history_kubernetes_images.saved_date", "i.id", "i.scan_results",
                "history_kubernetes_images.image_id"])
            .orderBy("history_kubernetes_images.saved_date");

        if (options?.namespaces) {
            subQuery = subQuery.whereIn('history_kubernetes_images.namespace', options.namespaces);
        }
        if (options?.isCompliant) {
            subQuery = subQuery.andWhere('i.scan_results',
                options.isCompliant === 'true'? 'Compliant' : 'Non-compliant');
        }

        const query = knex.select([
            "hki.last_scanned", "hki.image", "hki.scan_results", "hki.namespaces",
            knex.raw("sum(case when severity = 'Critical' then 1 else 0 end) as total_critical, " +
                "sum(case when severity = 'Critical' and is_fixable=true then 1 else 0 end) as total_fixable_critical, " +
                "sum(case when severity = 'High' then 1 else 0 end) as total_major, " +
                "sum(case when severity = 'High' and is_fixable=true then 1 else 0 end) as total_fixable_major, " +
                "sum(case when severity = 'Medium' then 1 else 0 end) as total_medium, " +
                "sum(case when severity = 'Medium' and is_fixable=true then 1 else 0 end) as total_fixable_medium, " +
                "sum(case when severity = 'Low' then 1 else 0 end) as total_low, " +
                "sum(case when severity = 'Low' and is_fixable=true then 1 else 0 end) as total_fixable_low, " +
                "sum(case when severity = 'Negligible' then 1 else 0 end) as total_negligible, " +
                "sum(case when severity = 'Negligible' and is_fixable=true then 1 else 0 end) as total_fixable_negligible"
            )
        ])
            .from(subQuery.as("hki"))
            .leftJoin(knex.raw("image_scan_results as r on hki.id = r.image_id and r.is_latest = true"))
            .leftJoin("image_scan_results_issues as isrs", "isrs.image_results_id", "r.id")
            .whereRaw(`hki.id is not null and hki.image is not null and r.deleted_at is null`)
            .groupBy(["hki.last_scanned", "hki.image", "hki.scan_results", "hki.namespaces"])
            .orderBy("hki.last_scanned");

        const count = await knex
            .count('*', {as: 'entries'})
            .from(query.as('results'))
            .returning('entries')
            .then(resp => parseInt(resp[0].entries.toString(), 10));

        if (options?.limit) {
            query.limit(options.limit);
        }
        if (options?.page && options?.limit) {
            query.offset(options.page * options.limit);
        }

        const queryResults = await query.then((response) => {
            return plainToClass(ReportsRunningVulnerabilitiesDto, response);
        });

        return {count, results: queryResults};
    }


    async getHistoricalVulnerabilities(clusterId: number, limit?: number, namespaces?: string[], startDate?: string, endDate?: string)
        : Promise<ReportsHistoricalVulnerabilitiesPreviewDto> {
        const knex = await this.databaseService.getConnection();

        let subQuery = knex.select([
            "history_kubernetes_images.image",
            "history_kubernetes_images.cluster_id",
            "history_kubernetes_images.saved_date",
            knex.raw("array_agg(distinct history_kubernetes_images.namespace) as namespaces"), "i.id",
            "history_kubernetes_images.image_id"])
            .from("history_kubernetes_images")
            .leftJoin("images as i", function() {
                this.on(
                    knex.raw("i.id = history_kubernetes_images.image_id " +
                        "AND i.cluster_id = history_kubernetes_images.cluster_id")
                );
            })
            .where("history_kubernetes_images.cluster_id", clusterId)
            .groupBy(["history_kubernetes_images.image", "history_kubernetes_images.cluster_id", "history_kubernetes_images.saved_date", "i.id",
                "history_kubernetes_images.image_id"])
            .orderBy("history_kubernetes_images.saved_date");

        if (namespaces) {
            subQuery = subQuery.whereIn('history_kubernetes_images.namespace', namespaces);
        }
        if (startDate && endDate) {
            subQuery = subQuery.andWhereRaw(`history_kubernetes_images.saved_date between '${startDate}' and '${endDate}'`);
        }

        const query = knex.select([
            "hki.saved_date as saved_date",
            knex.raw("sum(case when severity = 'Critical' then 1 else 0 end) as total_critical, " +
                "sum(case when severity = 'Critical' and is_fixable=true then 1 else 0 end) as total_fixable_critical, " +
                "sum(case when severity = 'High' then 1 else 0 end) as total_major, " +
                "sum(case when severity = 'High' and is_fixable=true then 1 else 0 end) as total_fixable_major, " +
                "sum(case when severity = 'Medium' then 1 else 0 end) as total_medium, " +
                "sum(case when severity = 'Medium' and is_fixable=true then 1 else 0 end) as total_fixable_medium, " +
                "sum(case when severity = 'Low' then 1 else 0 end) as total_low, " +
                "sum(case when severity = 'Low' and is_fixable=true then 1 else 0 end) as total_fixable_low, " +
                "sum(case when severity = 'Negligible' then 1 else 0 end) as total_negligible, " +
                "sum(case when severity = 'Negligible' and is_fixable=true then 1 else 0 end) as total_fixable_negligible"
            )
        ])
            .from(subQuery.as("hki"))
            .leftJoin(knex.raw("image_scan_results as r on hki.id = r.image_id and r.is_latest = true"))
            .leftJoin("image_scan_results_issues as isrs", "isrs.image_results_id", "r.id")
            .whereRaw(`hki.id is not null and hki.image is not null and r.deleted_at is null`)
            .andWhere("hki.cluster_id", clusterId)
            .groupBy("hki.saved_date")
            .orderBy("hki.saved_date", "desc");

        const count = await knex
            .count('*', {as: 'entries'})
            .from(query.as('results'))
            .returning('entries')
            .then(resp => parseInt(resp[0].entries.toString(), 10));

        if (limit) {
            query.limit(limit);
        }

        const queryResults = await query.then((response) => {
            return plainToClass(ReportsHistoricalVulnerabilitiesDto, response);
        });

        return {count, results: queryResults};
    }

    async getWorstImages(clusterId: number, startDate?: string, endDate?: string, namespaces?: Array<string>)
        : Promise<ReportsWorstImagesDto[]>{

        const knex = await this.databaseService.getConnection();

        let innerSubQuery = knex
            .select([
                'history_kubernetes_images.image',
                'history_kubernetes_images.image_hash',
                'history_kubernetes_images.cluster_id',
                'history_kubernetes_images.saved_date',
                'history_kubernetes_images.image_id'
            ])
            .from('history_kubernetes_images');
        if (namespaces?.length > 0) {
            innerSubQuery = innerSubQuery.whereIn('history_kubernetes_images.namespace', namespaces);
        }
        innerSubQuery = innerSubQuery.groupBy([
                'history_kubernetes_images.image',
                'history_kubernetes_images.image_hash',
                'history_kubernetes_images.cluster_id',
                'history_kubernetes_images.saved_date',
                'history_kubernetes_images.image_id'
            ])

        let subQuery = knex
            .select([
                'hki.image',
                'hki.saved_date',
                knex.raw('SUM(r.critical_issues) as sum_critical_issues'),
                knex.raw('SUM(r.major_issues) as sum_major_issues'),
                knex.raw('SUM(r.medium_issues) as sum_medium_issues'),
                knex.raw('SUM(r.low_issues) as sum_low_issues'),
                knex.raw('SUM(r.negligible_issues) as sum_negligible_issues')
            ])
            .from('image_scan_results as r')
            .leftJoin(knex.raw('images AS i ON i.id = r.image_id'))
            .leftJoin(innerSubQuery.as('hki'), function() {
                this.on('i.id', '=', 'hki.image_id')
                    .andOn('i.docker_image_id', '=', 'hki.image_hash')
                    .andOn('i.cluster_id', '=', 'hki.cluster_id');
            })
            .whereNotNull('i.id')
            .whereNotNull('hki.image')
            .whereNull('r.deleted_at')
            .andWhere('i.cluster_id', clusterId);
        if (startDate) {
            subQuery = subQuery.andWhere('hki.saved_date', '>=', startDate);
        }
        if (endDate) {
            subQuery = subQuery.andWhere('hki.saved_date', '<=', endDate);
        }
        subQuery = subQuery.andWhere('i.running_in_cluster', true)
            .andWhere('r.is_latest', true)
            .groupBy([
                'hki.saved_date',
                'hki.image'
            ]);

        const query = knex
            .select([
                'vrs.saved_date as savedDate',
                knex.raw('COUNT (CASE WHEN vrs.vuln_rating = 5 THEN vrs.vuln_rating END) as "criticalImages"'),
                knex.raw('COUNT (CASE WHEN vrs.vuln_rating = 4 THEN vrs.vuln_rating END) as "majorImages"'),
                knex.raw('COUNT (CASE WHEN vrs.vuln_rating = 3 THEN vrs.vuln_rating END) as "mediumImages"'),
                knex.raw('COUNT (CASE WHEN vrs.vuln_rating = 2 THEN vrs.vuln_rating END) as "lowImages"'),
                knex.raw('COUNT (CASE WHEN vrs.vuln_rating = 1 THEN vrs.vuln_rating END) as "negligibleImages"'),
                knex.raw('COUNT (CASE WHEN vrs.vuln_rating = 0 THEN vrs.vuln_rating END) as "safeImages"')
            ])
            .from(knex.select([
                'vr.image',
                'vr.saved_date',
                knex.raw(`
                    CASE
                        WHEN vr.sum_critical_issues > 0 THEN 5
                        WHEN vr.sum_major_issues > 0 THEN 4
                        WHEN vr.sum_medium_issues > 0 THEN 3
                        WHEN vr.sum_low_issues > 0 THEN 2
                        WHEN vr.sum_negligible_issues > 0 THEN 1
                        ELSE 0 
                    END AS vuln_rating
                `)
            ])
            .from(subQuery.as('vr'))
                .as('vrs'))
            .groupBy('vrs.saved_date')
            .orderBy('vrs.saved_date', 'asc');

        return query.then((response) => {
            return plainToClass(ReportsWorstImagesDto, response);
        });
    }

    async getVulnerabilityDifferenceSummaryByDate(
      startDate: string, endDate: string, clusterId?: number, namespaces?: Array<string>,
      severityLevels?: Array<VulnerabilitySeverity>, fixAvailable?: string,
    ): Promise<{ countOfFixedVulnerabilities: number, countOfNewVulnerabilities: number }> {
      const knex = await this.databaseService.getConnection();

      const image_details_query = knex.select([
        'i.id',
        knex.raw("concat(i.name,':', i.tag) as image"),
        'i.running_in_cluster',
        knex.raw("array_agg(distinct hki.namespace) as namespaces"),
        knex.raw("array_agg(distinct hki.saved_date) as saved_dates")
      ])
        .from('images as i')
        .leftJoin(knex.raw('clusters as c on c.id=i.cluster_id'))
        .innerJoin(knex.raw('history_kubernetes_images as hki on hki.image_id = i.id'))
        .where('i.deleted_at', null)
        .andWhere('c.deleted_at', null)
        .whereIn('hki.saved_date', [startDate, endDate]);

      if (clusterId) {
        image_details_query.andWhere('i.cluster_id', clusterId);
      }
      if (namespaces) {
        image_details_query.whereIn('hki.namespace', namespaces);
      }
      image_details_query.groupBy(['i.id', 'i.name', 'hki.name']);

      const scan_results_query = knex.select([
        "image_details.saved_dates",
        "isrs.scanner_name",
        knex.raw('image_details.id as image_id'),
        "image_details.image",
        "image_details.running_in_cluster",
        "isrs.type",
        "isrs.severity",
        "isrs.is_fixable",
        "image_details.namespaces"
      ])
        .from(image_details_query.as('image_details'))
        .leftJoin(knex.raw('image_scan_results as isr on isr.image_id = image_details.id and isr.is_latest=true'))
        .innerJoin(knex.raw('image_scan_results_issues as isrs on isrs.image_results_id = isr.id'));

      if (severityLevels) {
          if (severityLevels.includes(VulnerabilitySeverity.MAJOR)) {
              /** Major vulnerabilities are stored as 'High' on this database, ensures that the proper values
               * are being searched for */
              severityLevels.push(VulnerabilitySeverity.HIGH);
          }
        scan_results_query.whereIn('isrs.severity', severityLevels);
      }
      if (fixAvailable) {
          scan_results_query.andWhere('isrs.is_fixable', fixAvailable);
      }
      const endDateAsDate = parseISO(endDate);
      const validatedEndDate = endDateAsDate.toISOString().split('T')[0];
      const startDateAsDate = parseISO(startDate);
      const validatedStartDate = startDateAsDate.toISOString().split('T')[0];
      const final_query = knex.select([
        knex.raw(`SUM(CASE WHEN NOT saved_dates @> '{"${validatedEndDate}"}' THEN 1 ELSE 0 END) AS fixed`),
        knex.raw(`SUM(CASE WHEN NOT saved_dates @> '{"${validatedStartDate}"}' THEN 1 ELSE 0 END) AS new`),
        knex.raw(`SUM(CASE WHEN saved_dates @> '{"${validatedEndDate}", "${validatedStartDate}"}' THEN 1 ELSE 0 END) AS "persistent"`),
      ])
        .from(scan_results_query.as('scan_results'));

      const finalQueryResults: { fixed: string, new: string, total: string } = await final_query.then(results => results[0]);
      return {
        countOfFixedVulnerabilities: parseInt(finalQueryResults.fixed),  // should be 18
        countOfNewVulnerabilities: parseInt(finalQueryResults.new),  // should be 20
      };
    }

    async getDifferencesInVulnerabilities(
      startDate: string, endDate: string, clusterId?: number, namespaces?: Array<string>,
      severityLevels?: Array<VulnerabilitySeverity>, fixAvailable?: string,
      limit?: number,
    ): Promise<{ fixedVulnerabilities: ReportsVulnerabilityExportDto[], newVulnerabilities: ReportsVulnerabilityExportDto[] }> {
        const knex = await this.databaseService.getConnection();

        let baseSubQuery = knex
            .select([
                'i.id',
                knex.raw("concat(i.name,':', i.tag) as image"),
                'i.running_in_cluster',
                knex.raw("array_agg(distinct hki.namespace) as namespaces")
            ])
            .from('images as i')
            .leftJoin(knex.raw('clusters as c on c.id=i.cluster_id'))
            .where('i.deleted_at', null)
            .andWhere('c.deleted_at', null);
        if (clusterId) {
            baseSubQuery = baseSubQuery.andWhere('i.cluster_id', clusterId);
        }
        if (namespaces) {
            baseSubQuery = baseSubQuery.whereIn('hki.namespace', namespaces);
        }
        baseSubQuery = baseSubQuery
            .groupBy([
                'i.id',
                'i.name',
                'hki.name'
            ])

        let startSubQuery = baseSubQuery.clone();
        let endSubQuery = baseSubQuery.clone();
        startSubQuery = startSubQuery
            .innerJoin(knex.raw('history_kubernetes_images as hki on hki.image_id = i.id'))
            .andWhere('hki.saved_date', startDate);

        if (endDate !== format(new Date(), 'yyyy-MM-dd')) {
            endSubQuery = endSubQuery
                .innerJoin(knex.raw('history_kubernetes_images as hki on hki.image_id = i.id'))
                .andWhere('hki.saved_date', endDate);
        } else {
            endSubQuery = endSubQuery
                .innerJoin(knex.raw('kubernetes_images as hki on hki.image_id = i.id'));
        }

        let baseQuery = knex
            .select([
                'isrs.scanner_name',
                'image_details.id as image_id',
                'image_details.image',
                'image_details.running_in_cluster',
                'isrs.type',
                'isrs.severity',
                'isrs.is_fixable',
                'image_details.namespaces'
            ]);
        if (severityLevels) {
            if (severityLevels.includes(VulnerabilitySeverity.MAJOR)) {
                /** Major vulnerabilities are stored as 'High' on this database, ensures that the proper values
                 * are being searched for */
                severityLevels.push(VulnerabilitySeverity.HIGH);
            }
            baseQuery = baseQuery.whereIn('isrs.severity', severityLevels);
        }
        if (fixAvailable) {
            baseQuery = baseQuery.andWhere('isrs.is_fixable', fixAvailable);
        }
        baseQuery = baseQuery.leftJoin(
            knex.raw('image_scan_results as isr on isr.image_id = image_details.id and isr.is_latest=true')
        )
            .innerJoin(knex.raw('image_scan_results_issues as isrs on isrs.image_results_id = isr.id'))

        const startQuery = baseQuery.clone().from(startSubQuery.as('image_details'));
        const endQuery = baseQuery.clone().from(endSubQuery.as('image_details'));

        const rawQuery = limit ? '(? EXCEPT ALL ?) ORDER BY image_id, type LIMIT ?' :
            '(? EXCEPT ALL ?) ORDER BY image_id, type';

        const fixedVulns = await knex.raw(rawQuery,
            limit ? [startQuery, endQuery, limit] : [startQuery, endQuery])
            .then(response => {
            return plainToClass(ReportsVulnerabilityExportDto, response.rows);
        });

        const newVulns = await knex.raw(rawQuery,
            limit ? [endQuery, startQuery, limit] : [endQuery, startQuery])
            .then(response => {
            return plainToClass(ReportsVulnerabilityExportDto, response.rows);
        });

        return {
            fixedVulnerabilities: Array.isArray(fixedVulns) ? fixedVulns : [fixedVulns],
            newVulnerabilities: Array.isArray(newVulns) ? newVulns : [newVulns],
        }
    }
}
