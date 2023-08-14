import { Injectable } from '@nestjs/common';
import {KubeHunterDao} from "../dao/kube-hunter.dao";
import {KubeHunterDto} from "../dto/kube-hunter-dto";

@Injectable()
export class KubeHunterService {
    constructor(
        private readonly kubeHunterDao: KubeHunterDao,
    ) {}

    async saveKubeHunterReport(report: KubeHunterDto): Promise<number[]> {
        return await this.kubeHunterDao.saveKubeHunterReport(report);
    }

    /** Deprecated */
    async getKubeHunterReportByUuid(uuid: string): Promise<KubeHunterDto> {
        return (await this.kubeHunterDao.getKubeHunterReportByUuid(uuid))[0];
    }

    async getKubeHunterReportById(id: number): Promise<KubeHunterDto> {
        return this.kubeHunterDao.getKubeHunterReportById(id);
    }

    async getRecentKubeHunterReportForCluster(clusterId: number, minDate?: number): Promise<KubeHunterDto> {
        return this.kubeHunterDao.getRecentKubeHunterReportForCluster(clusterId, minDate);
    }

    async getAllReportsForCluster(clusterId: number,
                                  page  = 0,
                                  limit  = 10):
        Promise<{reportCount: number, list: KubeHunterDto[] }> {
        const list = await this.kubeHunterDao.getAllReportsForCluster(clusterId, page, limit);
        const reportCount =await this.kubeHunterDao.countReport(clusterId);
        return{
            list: list,
            reportCount: reportCount
        }
        //return await this.kubeHunterDao.getAllReportsForCluster(clusterId, page, limit);
    }

}
