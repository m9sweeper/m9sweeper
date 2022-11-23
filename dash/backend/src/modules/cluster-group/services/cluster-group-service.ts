import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { ClusterGroupDao } from '../dao/cluster-group-dao';
import { ClusterGroupDto } from '../dto/cluster-group-dto';

@Injectable()
export class ClusterGroupService {
    constructor(private readonly clusterGroupDao: ClusterGroupDao) {}

    async createClusterGroup(clusterGroup: ClusterGroupDto): Promise<ClusterGroupDto> {
        const checkClusterName = await this.clusterGroupDao.getClusterGroupBYClusterGroupName({'name': clusterGroup.name, 'deleted_at': null});
        if(checkClusterName && checkClusterName.length > 0){
           throw new HttpException({status: HttpStatus.NOT_FOUND, message: 'Cluster Group already exist'}, HttpStatus.NOT_FOUND)
        }
        const clusterGroupId = await this.clusterGroupDao.createClusterGroup(clusterGroup);
        return this.getClusterGroupById(clusterGroupId);
    }

    async deleteClusterGroup(id: number): Promise<number> {
        const countClusterByClusterGroupId = await this.clusterGroupDao.countAllClusterByGroupId(id);
        if (countClusterByClusterGroupId && countClusterByClusterGroupId[0].count > 0){
            throw new HttpException({status: HttpStatus.BAD_REQUEST, message: 'Error has clusters'}, HttpStatus.BAD_REQUEST)
        }
        const results = await this.clusterGroupDao.deleteClusterGroupById(id);
        if (results && Array.isArray(results) && results.length > 0) {
            return results[0].id;
        }
        return null;
    }

    async updateClusterGroup(clusterGroupData: ClusterGroupDto, id: number): Promise<number> {
        const checkClusterName = await this.clusterGroupDao.getClusterGroupBYClusterGroupName({'name': clusterGroupData.name});
        if(checkClusterName && checkClusterName.length > 0){
            throw new HttpException({status: HttpStatus.CONFLICT, message: 'Cluster Group name already exists'}, HttpStatus.CONFLICT)
        }
        return  await this.clusterGroupDao.updateClusterGroup(clusterGroupData, id);
    }

    async getClusterGroupById(id: number): Promise<ClusterGroupDto> {
        return this.clusterGroupDao.getClusterGroupById(id);
    }

    async getClusterGroups(): Promise<ClusterGroupDto[]> {
        return await this.clusterGroupDao.getClusterGroups();
    }

    async countClusterGroups(): Promise<number> {
        return this.clusterGroupDao.countClusterGroups();
    }

    /**
     * Finds a Cluster Group's ID by its name. Case sensitive.
     * Returns 0 if no matching cluster group is found
     * */
    async getClusterGroupIdByName(name: string): Promise<number> {
        return this.clusterGroupDao.getClusterGroupBYClusterGroupName({ name })
            .then((results: { id: number, name: string }[]) => results?.length ? results[0].id : 0);
    }
}

