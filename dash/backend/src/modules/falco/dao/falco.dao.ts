import {DatabaseService} from '../../shared/services/database.service';
import {Injectable} from '@nestjs/common';
import {FalcoDto} from '../dto/falco.dto';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {VulnerabilitySeverity} from "../../shared/enums/vulnerability-severity";


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
        signature?: string
    ): Promise<{ logCount: number, list: FalcoDto[]}> {
        const knex = await this.databaseService.getConnection();

        let query = knex.select()
            .from('project_falco_logs')
            .where('cluster_id', clusterId);

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
            case 'Date Desc':
                query = query.orderBy([{column: 'calendar_date', order: 'desc'}]);
                break;
            case 'Date Asc':
                query = query.orderBy([{column: 'calendar_date', order: 'asc'}]);
                break;
            default:
                query = query.orderBy([{column: 'id', order: 'desc'}]);

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

        const findCount = await knex
            .select( [knex.raw( 'count (*)')])
            .from(query.as("q"));

        const logCount = ( findCount && findCount[0] && findCount[0].count) ? findCount[0].count : 0;

        if (limit){
            query = query.limit(limit).offset(page * limit)
        }

        // Find filtered list with pagination
        const list = await query.then(data => {
            return plainToInstance(FalcoDto, data);
        });

        return {
            list: list,
            logCount: +logCount
        }
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

        async createFalcoLog(falcoLog: FalcoDto): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex
            .insert(instanceToPlain(falcoLog))
            .into('project_falco_logs')
            .returning(['id']);
    }
}
