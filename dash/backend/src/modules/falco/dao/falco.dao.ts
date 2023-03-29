import {DatabaseService} from '../../shared/services/database.service';
import {Injectable} from '@nestjs/common';
import {FalcoDto} from '../dto/falco.dto';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {FalcoCountDto} from "../dto/falco-count.dto";
import {format, set, sub, add} from "date-fns";
import {FalcoSettingDto} from "../dto/falco-setting.dto";
import * as knexnest from 'knexnest'
import {FalcoEmailDto} from "../dto/falco-email.dto";


@Injectable()
export class FalcoDao {
    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

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
        eventId?: number
    ): Promise<{ logCount: number, list: FalcoDto[]}> {
        const knex = await this.databaseService.getConnection();

        let query = knex.select()
            .from('project_falco_logs')
            .where('cluster_id', clusterId);

        if (priorities) {
            query = query.whereIn('level', priorities);
        }
        if (orderBy == 'Priority Desc' || orderBy =='Priority Asc' ||  orderBy =='Date Desc'||  orderBy =='Date Asc' ||  orderBy == null ||  orderBy == undefined) {
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
                case 'Date Desc':
                    query = query.orderBy([{column: 'creation_timestamp', order: 'desc'}]);
                    break;
                case 'Date Asc':
                    query = query.orderBy([{column: 'creation_timestamp', order: 'asc'}]);
                    break;
                default:
                    query = query.orderBy([{column: 'id', order: 'desc'}]);
            }
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

        if(signature){
            query.where('anomaly_signature', signature);
        }

        if (limit){
            query = query.limit(limit).offset(page * limit)
        }

        // Find filtered list with pagination
        const list = await query.then(data => {
            return plainToInstance(FalcoDto, data);
        });

        // "fake" the calculation of the logCount since count queries in
        // postgresql are slow with WHERE clauses on large tables
        // https://wiki.postgresql.org/wiki/Count_estimate
        let logCount = limit * page + list?.length;
        if (list?.length === limit) {
            logCount += 1; // this implies that there probably is another page of results
        }

        return {
            list: list,
            logCount: +logCount
        }
    }

    async getFalcoLogByEventId(
       eventId: number
    ): Promise<FalcoDto> {
        const knex = await this.databaseService.getConnection();

       const result= knex.select(
            ['p.id as id', 'p.calendar_date as calendarDate', 'p.namespace as namespace', 'p.container as container',
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

    async getFalcoLogsForExport(clusterId: number): Promise<{ logCount: number; fullList: FalcoDto[] }> {

        const knex = await this.databaseService.getConnection();

        let query = knex.select()
            .from('project_falco_logs')
            .where('cluster_id', clusterId);

        // Find log count and full list for csv export
        const findCount = await knex
            .select( [knex.raw( 'count (*)')])
            .from(query.as("q"));

        const logCount = ( findCount && findCount[0] && findCount[0].count) ? findCount[0].count : 0;

        const fullList = await query.then(data => {
            return plainToInstance(FalcoDto, data);
        });


        return {
            fullList: fullList,
            logCount: +logCount
        }
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
        const query = plainToInstance(FalcoSettingDto, await knex.select().from('falco_settings').where('cluster_id', clusterId));

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
        let falcoEmailObj = new FalcoEmailDto();
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
}
