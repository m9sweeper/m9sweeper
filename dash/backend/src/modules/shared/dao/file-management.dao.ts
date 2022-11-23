import {Injectable} from '@nestjs/common';
import {DatabaseService} from '../services/database.service';
import {plainToInstance} from 'class-transformer';
import {MineFileDto} from '../dto/mine-file.dto';

@Injectable()
export class FileManagementDao {

    constructor(private readonly databaseService: DatabaseService){}


    async save(data: any[]): Promise<MineFileDto[]> {
        const knex = await this.databaseService.getConnection();
        const savedFiles = await knex.insert(data).into('files').returning(
            [
                'file_unique_id AS fileId', 'display_filename AS fileName',
                'file_mime_type AS contentType', 'file_size AS contentSize',
                'file_storage AS storage'
            ]
        );
        return plainToInstance(MineFileDto, savedFiles);
    }

    async load(fileId: string): Promise<MineFileDto> {
        const knex = await this.databaseService.getConnection();
        const file = await knex.select([
            'file_unique_id AS fileId', 'display_filename AS fileName',
            'file_mime_type AS contentType', 'file_size AS contentSize',
            'file_storage AS storage'
        ]).from('files').where({deleted_at: null, file_unique_id: fileId}).first();
        return plainToInstance(MineFileDto, file);
    }
}
