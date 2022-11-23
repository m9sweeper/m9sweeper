import { Injectable} from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import * as knexnest from 'knexnest';
import { DatabaseService } from '../../shared/services/database.service';
import { K8sImageDto } from '../dto/k8s-image-dto';
import { HistoryK8sImageDto } from '../dto/history-k8s-image-dto';

@Injectable()
export class K8sImageDao {
    constructor(private databaseService: DatabaseService) {}

    async getCountOfCurrentImages(clusterId: number, namespace: string, deployment: string): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return knex('kubernetes_images as i').count('i.id as count')
            .where('i.cluster_id', clusterId)
            .andWhere('i.namespace', namespace)
            .andWhere('i.deployment_name', deployment)
            .then( totalK8sImage => totalK8sImage);
    }

    async getCountOfImages(clusterId: number, namespace: string, deployment: string, startTime: string, endTime: string): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return knex('history_kubernetes_images as i').count('i.id as count')
            .where('i.cluster_id', clusterId)
            .andWhere('i.namespace', namespace)
            .andWhere('i.deployment_name', deployment)
            .andWhere('i.saved_date', '>=', startTime)
            .andWhere('i.saved_date', '<=', endTime);
    }

    async getAllK8sImages(clusterId: number, namespace: string, deployment: string,
                          page = 0, limit = 10,
                          sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<K8sImageDto[]>{
        const knex = await this.databaseService.getConnection();

        const sortFieldMap = {
            'id': 'i.id',
            'name': 'i.name',
            'deploymentName': 'i.deployment_name',
            'namespace': 'i.namespace',
            'compliant': 'i.compliant'
        };
        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';

        return knexnest(knex
            .select([
                'i.id as _id',
                'i.name as _name',
                'i.image as _image',
                'i.deployment_name as _deploymentName',
                'i.namespace as _namespace',
                'i.compliant as _compliant',
                'im.id as _imageId'
            ])
            .from('kubernetes_images as i')
            .leftJoin('images as im', function (){
                    this.on('im.id', '=', 'i.image_id')
                })
            .where('i.cluster_id', clusterId)
            .andWhere('i.namespace', namespace)
            .andWhere('i.deployment_name', deployment)
            .limit(limit)
            .offset(page * limit)
            .orderByRaw(`${sort.field} ${sort.direction}`))
            .then( k8sImages => plainToInstance(K8sImageDto, k8sImages));
    }

    async getAllK8sImagesBySelectedDate(clusterId: number,
                                        namespace: string,
                                        deployment: string,
                                        startTime: string,
                                        endTime: string,
                                        page = 0,
                                        limit = 10,
                                        sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<K8sImageDto[]>{
        const knex = await this.databaseService.getConnection();

        const sortFieldMap = {
            'id': 'i.id',
            'name': 'i.name',
            'deploymentName': 'i.deployment_name',
            'namespace': 'i.namespace',
            'compliant': 'i.compliant'
        };
        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';

        return knexnest(knex
            .select([
                'i.id as _id',
                'i.name as _name',
                'i.image as _image',
                'i.deployment_name as _deploymentName',
                'i.namespace as _namespace',
                'i.compliant as _compliant',
                'im.id as _imageId'
            ])
            .from('history_kubernetes_images as i')
            .leftJoin('images as im', function (){
                this.on('im.id', '=', 'i.image_id')
            })
            .where('i.cluster_id', clusterId)
            .andWhere('i.namespace', namespace)
            .andWhere('i.deployment_name', deployment)
            .andWhere('i.saved_date', '>=', startTime)
            .andWhere('i.saved_date', '<=', endTime)
            .limit(limit)
            .offset(page * limit)
            .orderByRaw(`${sort.field} ${sort.direction}`))
            .then( k8sImages => plainToInstance(HistoryK8sImageDto, k8sImages));
    }

    async getAllK8sImagesHistory(): Promise<HistoryK8sImageDto[]> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                'i.id as _id',
                'i.name as _name',
                'i.image as _image',
                'i.deployment_name as _deploymentName',
                'i.namespace as _namespace',
                'i.compliant as _compliant',
                'i.cluster_name as _clusterName',
                'i.cluster_id as _clusterId',
                'i.saved_date as _savedDate'
            ])
            .from('history_kubernetes_images as i'))
            .then(K8sImages => plainToInstance(HistoryK8sImageDto, K8sImages));
    }

    async clearK8sImagesHistory(date: string): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex.del().from('history_kubernetes_images')
            .where({saved_date: date});
    }

    async getCurrentK8sImages(): Promise<K8sImageDto[]> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                'i.id as _id',
                'i.name as _name',
                'i.image as _image',
                'i.deployment_name as _deploymentName',
                'i.namespace as _namespace',
                'i.compliant as _compliant',
                'i.cluster_name as _clusterName',
                'i.cluster_id as _clusterId',
                'i.image_hash as _imageHash',
                'i.image_id as _imageId'
            ])
            .from('kubernetes_images as i'))
            .then(K8sImages => plainToInstance(K8sImageDto, K8sImages));
    }

    async saveK8sImagesHistory(k8sImage:K8sImageDto, startTime:string): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const k8sImagesHistoryDTO = new HistoryK8sImageDto();
        k8sImagesHistoryDTO.name = k8sImage.name;
        k8sImagesHistoryDTO.image = k8sImage.image;
        k8sImagesHistoryDTO.namespace = k8sImage.namespace;
        k8sImagesHistoryDTO.deploymentName = k8sImage.deploymentName;
        k8sImagesHistoryDTO.compliant = k8sImage.compliant;
        k8sImagesHistoryDTO.clusterId = k8sImage.clusterId;
        k8sImagesHistoryDTO.clusterName = k8sImage.clusterName;
        k8sImagesHistoryDTO.savedDate = startTime;
        k8sImagesHistoryDTO.imageHash = k8sImage.imageHash;
        k8sImagesHistoryDTO.imageId = k8sImage.imageId;
        const dtoToPlain = instanceToPlain(k8sImagesHistoryDTO);
        return knex.insert(dtoToPlain).into('history_kubernetes_images')
          .returning('id').then(results => !!results ? results[0]?.id : null);
    }

    async checkK8sImage(conditions: { [key: string]: string|number|boolean }): Promise<any[]> {
        const knex = await this.databaseService.getConnection();
        return knex.select('name', 'id')
            .from('kubernetes_images')
            .where(conditions);
    }

    async saveK8sImages(k8Image: K8sImageDto): Promise<number[]> {
      const knex = await this.databaseService.getConnection();
      const dtoToPlain = instanceToPlain(k8Image);
      return knex.insert(dtoToPlain).into('kubernetes_images')
        .returning('id').then(results => !!results ? results.map(r => r?.id) : []);
    }
}

