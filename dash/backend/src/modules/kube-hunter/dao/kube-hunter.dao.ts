import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../shared/services/database.service';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {KubeHunterDto} from "../dto/kube-hunter-dto";

@Injectable()
export class KubeHunterDao {
    constructor(private readonly databaseService: DatabaseService) {}

    async saveKubeHunterReport(report: KubeHunterDto): Promise<number[]> {
        const knex = await this.databaseService.getConnection();
        const plainReport = instanceToPlain(report);
        return knex.insert(plainReport).into('kube_hunter');
    }

    /** Deprecated */
    async getKubeHunterReportByUuid(uuid: string) : Promise<KubeHunterDto[]> {
        const knex = await this.databaseService.getConnection();
        return knex.select('*').from('kube_hunter').where('uuid', uuid).then(report => plainToInstance(KubeHunterDto, report));
    }

    async getKubeHunterReportById(id: number): Promise<KubeHunterDto> {
        const knex = await this.databaseService.getConnection();
        return knex.select('*')
            .from('kube_hunter')
            .where('id', id)
            .then(reports => plainToInstance(KubeHunterDto, reports[0]));
    }

    /** Retrieves the most recent kubehunter report for the cluster (after the minDate if specified) */
    async getRecentKubeHunterReportForCluster(clusterId: number, minDate?: number): Promise<KubeHunterDto> {
        const knex = await this.databaseService.getConnection();
        const query =  knex
            .select('*')
            .from('kube_hunter')
            .where('cluster_id', clusterId);

        if (minDate) {
            query.andWhere('created_at', '>=', minDate)
        }

        return query.then(report => plainToInstance(KubeHunterDto, report)[0]);
    }

    async getAllReportsForCluster(clusterId: number,
                                  page = 0,
                                  limit = 20):
        Promise<KubeHunterDto[]> {

        const knex = await this.databaseService.getConnection();

        return knex.select('*').from('kube_hunter')
            .where('cluster_id', clusterId)
            .limit(limit)
            .offset(page * limit)
            .orderBy('created_at', 'DESC')
            .then(report => plainToInstance(KubeHunterDto, report));
    }

    async countReport(clusterId:number): Promise<Number> {
        const knex = await this.databaseService.getConnection();
        const result = await knex('kube_hunter as kh')
            .count('kh.id', {as: 'count'})
            .returning('count');

        return (result && result[0] && result[0].count) ? result[0].count : 0;
    }

}
