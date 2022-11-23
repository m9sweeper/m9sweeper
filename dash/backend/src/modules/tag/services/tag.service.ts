import { Injectable } from '@nestjs/common';
import { TagDao } from '../dao/tag.dao';
import { TagDto } from '../dto/tag-dto';
import { TagCreateDto } from '../dto/tag-create-dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class TagService{

    constructor(private readonly tagDao: TagDao) {
    }

    async getAllTags(): Promise<TagDto[]> {
        return await this.tagDao.getAllTags();
    }

    async createTag(tagData: TagCreateDto): Promise<TagDto>{
        return (await this.tagDao.createTag(instanceToPlain(tagData)))[0];
    }

    async deleteTagById(id: number, clusterId: number): Promise<number> {
        return await this.tagDao.deleteTagById(id, clusterId);
    }
}
