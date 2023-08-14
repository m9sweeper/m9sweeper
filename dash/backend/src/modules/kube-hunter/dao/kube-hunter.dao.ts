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

    /** Retrieves the most recent kube-hunter report for the cluster (after the minDate if specified) */
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

    async countReport(clusterId:number): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex('kube_hunter as kh')
            .where('kh.cluster_id', clusterId)
            .count('kh.id', {as: 'count'})
            .returning('count')
            .then(res => res?.[0]?.count ? +res[0].count : 0);
    }

}
