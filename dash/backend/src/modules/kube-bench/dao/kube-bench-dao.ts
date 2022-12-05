import {Injectable} from "@nestjs/common";
import {DatabaseService} from "../../shared/services/database.service";
import {instanceToPlain, plainToInstance} from "class-transformer";
import {KubeBenchDto} from "../dto/kube-bench-dto";
import * as fs from "fs";
import {ConfigService} from "@nestjs/config";


@Injectable()
export class KubeBenchDao {
    constructor(private readonly databaseService: DatabaseService,
                private readonly configService: ConfigService) {
    }

    async saveKubeBenchReport(report: KubeBenchDto): Promise<KubeBenchDto[]> {
        const knex = await this.databaseService.getConnection();
        const plainReport = instanceToPlain(Object.assign(new KubeBenchDto(), report));
        return knex.insert(plainReport).into('kube_bench').returning('*').then(report => plainToInstance(KubeBenchDto, report));
    }

    /** Deprecated */
    async getBenchReportByUuid(uuid: string): Promise<KubeBenchDto[]> {
        const knex = await this.databaseService.getConnection();
        return knex.select('*').from('kube_bench').where('uuid', uuid).then(report => plainToInstance(KubeBenchDto, report));
    }

    async getBenchReportById(id: number): Promise<KubeBenchDto> {
        const knex = await this.databaseService.getConnection();
        return knex.select('*')
            .from('kube_bench')
            .where('id', id)
            .then(results => plainToInstance(KubeBenchDto, results[0]));
    }

    async deleteBenchReportById(id: number): Promise<KubeBenchDto> {
        const knex = await this.databaseService.getConnection();
        return knex.select('*')
            .from('kube_bench')
            .where('id', id)
            .del().returning('*').then(results => plainToInstance(KubeBenchDto, results[0]));
    }

    async getAllBenchReportsByCluster(clusterId: number, page = 0, limit = 20):
        Promise<KubeBenchDto[]> {
        const knex = await this.databaseService.getConnection();
        return knex.select('*').from('kube_bench')
            .where('cluster_id', clusterId)
            .limit(limit)
            .offset(page * limit)
            .orderBy('created_at', 'DESC')
            .then(report => plainToInstance(KubeBenchDto, report));
    }

    async countReport(clusterId: number): Promise<Number> {
        const knex = await this.databaseService.getConnection();
        const result = await knex('kube_bench as kb')
            .count('kb.id', {as: 'count'})
            .returning('count');
        return (result && result[0] && result[0].count) ? result[0].count : 0;
    }

    async getLastBenchReportSummary(clusterId: number): Promise<KubeBenchDto[]> {
        const knex = await this.databaseService.getConnection();
        const mostRecentEntry = knex('kube_bench').where('cluster_id', '=', clusterId).max('created_at');
        return knex.select('*').from('kube_bench').where('created_at', mostRecentEntry).then(report => plainToInstance(KubeBenchDto, report));
    }

    async getConfigFileContents(filename: string): Promise<string> {
        if (filename.indexOf('/') !== -1 || filename.indexOf('\\') !== -1) {
            throw 'Invalid Filename!';
        }

        const dir = process.cwd() + '/' + this.configService.get('kubebench.kubeBenchConfigDirectory');
        return new Promise<any>((resolve, reject) => {
            fs.readFile(dir + '/' + filename, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    async getConfigFileList(): Promise<{ name: string, value: string }[]> {
        // const dir = process.cwd() + '/' + this.configService.get('kubebench.kubeBenchConfigDirectory');
        // return new Promise<any>((resolve, reject) => {
        //     fs.readdir(dir, (err, files: string[]) => {
        //         if (err) {
        //             reject(err);
        //         } else {
        //             resolve(files);
        //         }
        //     });
        // });

        /*
        # aks = Azure Kubernetes Service
        # gke = Google kubernetes Engine
        # eks = Elastic kubernetes Service
        # eksasf = Elastic kubernetes Service with own kube-config provided
        # ack = Alibaba Cloud Container Service
        # unmanaged = run on nodes
        # unmanaged = run on master
        # commonjob = run on both
        */
        return [
            {name: 'Azure Kubernetes Service', value: 'aks'},
            {name: 'Google kubernetes Engine', value: 'gke'},
            {name: 'Elastic kubernetes Service', value: 'eks'},
            {name: 'Elastic kubernetes Service with own kube-config provided', value: 'eksasf'},
            {name: 'Alibaba Cloud Container Service', value: 'ack'},
            {name: 'Unmanaged Kubernetes Environment', value: 'unmanaged'},
            {name: 'Common Job Kubernetes Environment', value: 'commonjob'},
        ];
    }

}
