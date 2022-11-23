import {Exclude} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';


export enum MineFileStorage {
    LOCAL = 'local',
    S3 = 's3'
}

export class MineFileDto {

    @Exclude({toPlainOnly: true})
    storage:        MineFileStorage;
    @ApiProperty()
    fileId:         string;
    @ApiProperty()
    fileName:       string;
    @ApiProperty()
    contentType:    string;
    @ApiProperty()
    contentSize:    number;
}
