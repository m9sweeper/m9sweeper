import { HttpException, HttpStatus, Injectable} from '@nestjs/common';
import * as knexnest from 'knexnest';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../../shared/services/database.service';
import { TagDto } from '../dto/tag-dto';
import {ClusterService} from "../../cluster/services/cluster.service";
import {MineLoggerService} from "../../shared/services/mine-logger.service";

@Injectable()
export class TagDao{
    constructor(
      private readonly databaseService: DatabaseService,
      private readonly clusterService: ClusterService,
      private readonly loggerService: MineLoggerService
    ) {}
    async getAllTags(): Promise<TagDto[]> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                't.id as _id', 't.name as _name', 't.group_id as _groupId'
            ])
            .from('tags as t')
            .orderBy('t.id', 'desc'))
            .then(tag => plainToInstance(TagDto, tag));
    }

    async createTag(tag: any): Promise<TagDto[]> {
        const knex = await this.databaseService.getConnection();
        const checkTagExistOrNot = await knex.select('*')
            .from('tags')
            .where('name', tag.name)
            .andWhere('group_id', tag.group_id);

        if (checkTagExistOrNot.length > 0) {
          this.loggerService.log({label: 'Tag could not be created: already exists', data: { tagInfo: tag, method: 'TagController.createTag' }});
          throw new HttpException({message: 'Tag already exists'}, HttpStatus.BAD_REQUEST);
        }

       return knex.insert(tag).into('tags').returning(['name', 'group_id', 'id'])
         .then(data => plainToInstance(TagDto, data))
         .catch(e => {
           this.loggerService.warn({label: 'Tag could not be created', data: { e, tagInfo: tag, method: 'TagController.createTag' }}, e);
           throw new HttpException({
             status: HttpStatus.INTERNAL_SERVER_ERROR,
             message: 'Tag could not be created'
           }, HttpStatus.INTERNAL_SERVER_ERROR);
         });
    }

    async deleteTagById(ID: number, clusterId: number): Promise<number>{
        const knex = await this.databaseService.getConnection();
        const clusters = (await this.clusterService.getAllClusters()).filter(c => c.id !== clusterId);

        for(const cluster of clusters) {
            if(cluster.tags) {
                for (const tag of cluster.tags) {
                    if (ID == tag.id) {
                        throw new HttpException({
                            message: 'Tag is still in use',
                        }, HttpStatus.NOT_FOUND);
                    }
                }
            }
        }

        const result = await knex.where('id', ID).returning('id')
          .into('tags').del().then(results => !!results ? results[0]?.id : null);
        if (!!result) {
            return result;
        }
        throw new HttpException({
            message: 'Tag not found',
        }, HttpStatus.NOT_FOUND);
    }
}
