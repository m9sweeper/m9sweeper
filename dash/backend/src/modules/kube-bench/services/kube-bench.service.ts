import {Injectable} from '@nestjs/common';
import {KubeBenchDto} from "../dto/kube-bench-dto";
import {KubeBenchDao} from "../dao/kube-bench-dao";
import {Observable} from "rxjs";


@Injectable()
export class KubeBenchService {
    constructor(
        private readonly kubeBenchDao: KubeBenchDao
    ) {}

    async saveKubeBenchReport(report: KubeBenchDto): Promise<KubeBenchDto[]> {
        return await this.kubeBenchDao.saveKubeBenchReport(report);
    }

    /** Deprecated */
    async getBenchReportByUuid(uuid : string): Promise<KubeBenchDto[]> {
        return await this.kubeBenchDao.getBenchReportByUuid(uuid);
    }

    async getBenchReportById(id: number): Promise<KubeBenchDto> {
        return this.kubeBenchDao.getBenchReportById(id);
    }

    async deleteBenchReportById(id: number): Promise<KubeBenchDto> {
        return this.kubeBenchDao.deleteBenchReportById(id);
    }

    async getAllBenchReportsByCluster(clusterId : number, page =0, limit = 20):
        Promise<{ reportCount: number, list: KubeBenchDto[] }> {
        const list = await this.kubeBenchDao.getAllBenchReportsByCluster(clusterId, page, limit);
        const reportCount = await this.kubeBenchDao.countReport(clusterId);
        return{
            list: list,
            reportCount: +reportCount
        }
    }

    async getLastBenchReportSummary(clusterId: number): Promise<KubeBenchDto[]> {
        return await this.kubeBenchDao.getLastBenchReportSummary(clusterId);
    }

    async getConfigFileList(): Promise<{name: string, value: string}[]> {
        return await this.kubeBenchDao.getConfigFileList();
    }

    async getConfigFileContents(filename: string): Promise<string> {
        return await this.kubeBenchDao.getConfigFileContents(filename);
    }

}
