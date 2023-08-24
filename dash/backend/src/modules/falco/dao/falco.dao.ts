import {DatabaseService} from '../../shared/services/database.service';
import {Injectable} from '@nestjs/common';
import {FalcoDto} from '../dto/falco.dto';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {FalcoCountDto} from "../dto/falco-count.dto";
import {format, set, sub, add} from "date-fns";
import {FalcoSettingDto} from "../dto/falco-setting.dto";
import * as knexnest from 'knexnest'
import {FalcoEmailDto} from "../dto/falco-email.dto";
import { FalcoRuleCreateDto, FalcoRuleDto } from '../dto/falco-rule.dto';
import { Knex } from 'knex';


@Injectable()
export class FalcoDao {
    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

    private buildFalcoLogQuery(
      query: Knex.QueryBuilder,
      priorities?: string [],
      orderBy?: string,
      startDate?: string,
      endDate?: string,
      namespace?: string,
      pod?: string,
      image?: string,
      ): Knex.QueryBuilder {
        if (priorities) {
            query = query.whereIn('level', priorities);
        }
        switch (orderBy) {
            case 'Priority Desc':
                query = query.orderByRaw(
                  'CASE ' +
                  ' WHEN level = \'Emergency\' then 1' +
                  ' WHEN level = \'Alert\' then 2' +
                  ' WHEN level = \'Critical\' then 3' +
                  ' WHEN level = \'Error\' then 4' +
                  ' WHEN level = \'Warning\' then 5' +
                  ' WHEN level = \'Notice\' then 6' +
                  ' WHEN level = \'Informational\' then 7' +
                  ' WHEN level = \'Debug\' then 8' +
                  'END'
                );
                break;
            case 'Priority Asc':
                query = query.orderByRaw(
                  'CASE ' +
                  ' WHEN level = \'Debug\' then 1' +
                  ' WHEN level = \'Informational\' then 2' +
                  ' WHEN level = \'Notice\' then 3' +
                  ' WHEN level = \'Warning\' then 4' +
                  ' WHEN level = \'Error\' then 5' +
                  ' WHEN level = \'Critical\' then 6' +
                  ' WHEN level = \'Alert\' then 7' +
                  ' WHEN level = \'Emergency\' then 8' +
                  'END'
                );
                break;
            case 'Date Asc':
                query = query.orderBy([{column: 'creation_timestamp', order: 'asc'}]);
                break;
            case 'Date Desc':
            default:
                query = query.orderBy([{column: 'creation_timestamp', order: 'desc'}]);
                break;
        }

        if (startDate) {
            query = query.andWhere('calendar_date', '>=', startDate);
        }
        if (endDate) {
            query = query.andWhere('calendar_date', '<=', endDate);
        }

        if (namespace) {
            query = query.whereRaw(`namespace LIKE ?`, [`%${namespace.trim()}%`]);
        }

        if (pod) {
            query = query.whereRaw(`container LIKE ?`, [`%${pod.trim()}%`]);
        }

        if (image) {
            query = query.whereRaw(`image LIKE ?`, [`%${image.trim()}%`]);
        }

        return query;
    }

    async getFalcoLogs(
        clusterId: number,
        limit = 20,
        page = 0,
        priorities?: string [],
        orderBy?: string,
        startDate?: string,
        endDate?: string,
        namespace?: string,
        pod?: string,
        image?: string,
        signature?: string,
    ): Promise<{ logCount: number, list: FalcoDto[],}> {
        const knex = await this.databaseService.getConnection();

        let query = knex.select()
          .from('project_falco_logs')
          .where('cluster_id', clusterId);

        // for some reason, the returned query never makes it back. it hits the return statement then gets lost somewhere
        query = this.buildFalcoLogQuery(query, priorities, orderBy, startDate, endDate, namespace, pod, image);

        if (signature){
            query.where('anomaly_signature', signature);
        }

        // set limit to whichever is lower: 1000 or whatever is provided
        limit = Math.min(limit, 1000);
        query = query.limit(limit).offset(page * limit) // limit: page size

        // Filtered list per page for pagination
        const filteredPerPageLogList = await query.then(data => {
            return plainToInstance(FalcoDto, data);
        });

        // "fake" the calculation of the logCount since count queries in
        // postgresql are slow with WHERE clauses on large tables
        // https://wiki.postgresql.org/wiki/Count_estimate
        let logCount = limit * page + filteredPerPageLogList?.length; // accumulated log total per forward/backward click
        if (filteredPerPageLogList?.length === limit) {
            logCount += 1; // this implies that there probably is another page of results
        }

        return {
            list: filteredPerPageLogList,
            logCount: +logCount,
        }
    }

    async getFalcoCsvLogs(
        clusterId: number,
        priorities?: string [],
        orderBy?: string,
        startDate?: string,
        endDate?: string,
        namespace?: string,
        pod?: string,
        image?: string,
    ): Promise<{ csvLogList: FalcoDto[] }> {
        const knex = await this.databaseService.getConnection();

        let query = knex.select()
          .from('project_falco_logs')
          .where('cluster_id', clusterId);

        query = this.buildFalcoLogQuery(query, priorities, orderBy, startDate, endDate, namespace, pod, image);

        // Filtered list for csv - limit to 1000 logs
        const filteredCsvLoglist = await query.limit(1000).then(data => {
            return plainToInstance(FalcoDto, data);
        });

        return {
            csvLogList: filteredCsvLoglist,
        }
    }

    async getFalcoLogByEventId(
       eventId: number
    ): Promise<FalcoDto> {
        const knex = await this.databaseService.getConnection();

       const result= knex.select(
            ['p.id as id', 'p.creation_timestamp as timestamp', 'p.calendar_date as calendarDate', 'p.namespace as namespace', 'p.container as container',
                'p.image as image', 'p.message as message', 'p.anomaly_signature as anomalySignature', 'p.raw as raw'])
            .from('project_falco_logs AS p')
            .where('p.id', eventId)
            .then(result => result[0]);

         return result;
    }

    async getCountOfFalcoLogsBySignature(
        clusterId: number, signature: string, daysBack: number
    ): Promise<FalcoCountDto[]> {

        const currentDate = set(new Date(), {hours: 0, minutes: 0, seconds: 0, milliseconds: 0});
        const dates = [];
        for (let date = sub(currentDate, {days: daysBack});
             format(date, 'yyyy-MM-dd') !== format(add(currentDate, {days: 1}), 'yyyy-MM-dd');
             date = add(date, {days: 1})) {
            dates.push(format(date, 'yyyy-MM-dd'));
        }

        const knex = await this.databaseService.getConnection();

        // get all signature logs within the date period
        const signatureCountByDate = await knex
          .select( [knex.raw( 'calendar_date as date, count (calendar_date)')])
          .from(
            knex.select()
            .from('project_falco_logs')
            .where('anomaly_signature', signature)
            .andWhere('cluster_id', clusterId)
            .andWhere('calendar_date', 'IN', dates)
            .as("q")
          )
          .groupByRaw('calendar_date')
          .orderBy('calendar_date', 'asc');

        // handle no query result
        return signatureCountByDate || null;
    }

    async createFalcoLog(falcoLog: FalcoDto): Promise<FalcoDto> {
        const knex = await this.databaseService.getConnection();
        const query = plainToInstance(FalcoDto, await knex
            .insert(instanceToPlain(falcoLog))
            .into('project_falco_logs')
            .returning(['*']));

        // if record is added, return the record
        if (query.length > 0){
            return query[0];
        }

        return null;
    }

    async createFalcoSetting(clusterId: number, falcoSetting: FalcoSettingDto): Promise<any>{
        const knex = await this.databaseService.getConnection();
        const subquery = await knex.raw(`select exists( select 1 from falco_settings where cluster_id =? )`, [clusterId])
            .then(res => res?.rows[0]?.exists);

        if (!subquery){
            const result = knex
                .insert(instanceToPlain(falcoSetting))
                .into('falco_settings')
                .returning(['*']);

            return result;
        } else {
            const result = knex('falco_settings').update(instanceToPlain(falcoSetting)).where('cluster_id', clusterId);
            return result;
        }
    }

    async findFalcoSettingByClusterId(clusterId: number): Promise<FalcoSettingDto> {
        const knex = await this.databaseService.getConnection();

        // see if any settings matches the clusterid
        const query = plainToInstance(
          FalcoSettingDto,
          await knex.select().from('falco_settings').where('cluster_id', clusterId)
        );

        // if there is, return the record
        if (query.length > 0){
            return query[0];
        }

        return null;
    }

    async getAllAdminsToMail(): Promise<any> {
        const knex = await this.databaseService.getConnection();
        const query = knex
            .select([
                'u.email as _email',
                knex.raw(`CONCAT(u.first_name, ' ', u.last_name) as "_fullName"`)
            ])
            .from('users as u')
            .leftJoin('user_authorities as ua', function(){
                this.on('u.id','=','ua.user_id')
            })
            .whereIn('ua.authority_id', [1,2])
        return knexnest(query)
            .then(data => {
                return data;
            });
    }

    async addFalcoEmail(emailSentTime: number, clusterId: number, falcoSignature: string): Promise<any> {
        const falcoEmailObj = new FalcoEmailDto();
        const emailSentDate = format(set(new Date(emailSentTime), {hours: 0, minutes: 0, seconds: 0, milliseconds: 0}),'yyyy-MM-dd');

        falcoEmailObj.creationTimestamp = emailSentTime;
        falcoEmailObj.calendarDate = emailSentDate;
        falcoEmailObj.clusterId = clusterId;
        falcoEmailObj.anomalySignature = falcoSignature;

        const knex = await this.databaseService.getConnection();
        return knex
            .insert(instanceToPlain(falcoEmailObj))
            .into('falco_email')
            .returning(['*']);
    }

    /**
     * Finds when the falco email was las sent for a particular anomoly for a particular cluster
     * @param clusterId
     * @param falcoSignature signature of falco event. corresponds with anomoly_signature field.
     */
    async falcoEmailAlreadySent(clusterId: number, falcoSignature: string): Promise<any> {

        const knex = await this.databaseService.getConnection();
        const query = await knex.raw(`select exists( select 1 from falco_email where cluster_id =? and anomaly_signature =? )`, [clusterId, falcoSignature])
            .then(res => res?.rows[0]?.exists);

        if (query){
            const lastEmailSentTime = await knex
                .select('creation_timestamp')
                .from('falco_email')
                .where('cluster_id', clusterId)
                .andWhere('anomaly_signature', falcoSignature)
                .returning('*');
            return lastEmailSentTime[0].creation_timestamp;
        } else {
            return null;
        }
    }

    async createFalcoRule(rule: FalcoRuleCreateDto): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex.transaction(async (trx) => {
            rule.allNamespaces = !rule?.namespaces?.length;
            rule.allClusters = !rule?.clusters?.length;
            let rawNamespaces = [];
            if (!rule.allNamespaces) {
                rawNamespaces = rule.namespaces.map(ns => ({ namespace: ns }))
            }
            let rawClusters = [];
            if (!rule.allClusters) {
                rawClusters = rule.clusters.map(id => ({ cluster_id: id }))
            }

            delete rule.namespaces;
            delete rule.clusters;
            const raw = instanceToPlain(rule);
            const id = (await trx.insert(raw, 'id').into('falco_rules'))[0]?.id;
            if (!rule.allNamespaces) {
                rawNamespaces.forEach(ns => ns.falco_rule_id = id);
                await trx.insert(rawNamespaces).into('falco_rules_namespace')
            }
            if (!rule.allClusters) {
                rawClusters.forEach(ns => ns.falco_rule_id = id);
                await trx.insert(rawClusters).into('falco_rules_cluster')
            }
            return id;
        });
    }

    async getFalcoRuleById(id: number): Promise<FalcoRuleDto> {
        const knex = await this.databaseService.getConnection();
        const query = this.baseFalcoRuleQuery(knex)
          .where('rule.id', '=', id);

        return knexnest(query)
          .then(rows => plainToInstance(FalcoRuleDto, rows[0]))
    }

    async listActiveFalcoRules(options?: { clusterId?: number, sortField?: string, sortDir?: 'desc' | 'asc' }): Promise<FalcoRuleDto[]> {
        const knex = await this.databaseService.getConnection();
        const query = this.baseFalcoRuleQuery(knex)
          .where('rule.deleted_at', 'IS', null)
          .orderBy(options?.sortField || 'rule.created_at', options?.sortDir || 'asc')
        if (options?.clusterId) {
            query.andWhere(builder => {
                    builder.where('rule.all_clusters', '=', true)
                      .orWhere('rule_cluster.cluster_id', '=', options.clusterId);
                })
        }
        return knexnest(query)
          .then(rows => plainToInstance(FalcoRuleDto, rows))
    }

    async deleteFalcoRule(ruleId: number): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex.update({ deleted_at: Date.now() })
          .into('falco_rules')
          .where('id', '=', ruleId);
    }
    async updateFalcoRule(rule: Partial<FalcoRuleCreateDto>, ruleId: number): Promise<void> {
        // const raw = instanceToPlain(rule);
        const knex = await this.databaseService.getConnection();

        return knex.transaction(async (trx) => {
            rule.allNamespaces = !rule?.namespaces?.length;
            rule.allClusters = !rule?.clusters?.length;
            let rawNamespaces = [];
            if (!rule.allNamespaces) {
                rawNamespaces = rule.namespaces.map(ns => ({ namespace: ns, falco_rule_id: ruleId }))
            }
            let rawClusters = [];
            if (!rule.allClusters) {
                rawClusters = rule.clusters.map(id => ({ cluster_id: id, falco_rule_id: ruleId }))
            }

            // Update the rule
            delete rule.namespaces;
            delete rule.clusters;
            delete rule.id;
            const raw = instanceToPlain(rule);
            await trx.update(raw).into('falco_rules').where('id', '=', ruleId);

            // Clear the namespace and cluster tables of associated entries
            await trx.delete().from('falco_rules_cluster')
              .where('falco_rule_id', '=', ruleId);
            await trx.delete().from('falco_rules_namespace')
              .where('falco_rule_id', '=', ruleId);


            // (Re)-create the entries in the join tables if needed
            if (!rule.allNamespaces) {
                await trx.insert(rawNamespaces).into('falco_rules_namespace')
            }
            if (!rule.allClusters) {
                await trx.insert(rawClusters).into('falco_rules_cluster')
            }
        });
    }

    /**
     * Will use the provided connection to create the basic query for retrieving falco rules.
     * It will alias the tables
     * Table | Alias
     * falco_rules | rule
     * falco_rules_namespace | rule_ns
     * falco_rules_cluster | rule_cluster
     * clusters | cluster
     * */
    protected baseFalcoRuleQuery(knex: Knex) {
        return knex.from({ rule: 'falco_rules' })
          .select({
              '_id': 'rule.id',
              '_deletedAt': 'rule.deleted_at',
              '_createdAt': 'rule.created_at',
              '_image': 'rule.image',
              '_falcoRule': 'rule.falco_rule',
              '_action': 'rule.action',
              '_allNamespaces': 'rule.all_namespaces',
              '_allClusters': 'rule.all_clusters',
              '_namespaces__namespace': 'rule_ns.namespace',
              '_clusters__clusterId': 'rule_cluster.cluster_id',
              '_clusters__name': 'cluster.name'
          })
          .leftJoin({rule_ns: 'falco_rules_namespace'}, function() {
              this.on('rule_ns.falco_rule_id', '=', 'rule.id')
          })
          .leftJoin({rule_cluster: 'falco_rules_cluster'}, function() {
              this.on('rule_cluster.falco_rule_id', '=', 'rule.id')
          })
          .leftJoin({cluster: 'clusters'}, function() {
              this.on('rule_cluster.cluster_id', '=', 'cluster.id')
          });
    }
}
