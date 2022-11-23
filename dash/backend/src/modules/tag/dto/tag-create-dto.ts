import {IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TagCreateDto{

    @IsString()
    @IsNotEmpty()
    @Expose({name: 'name', toPlainOnly: true })
    @ApiProperty({name: 'name'})
    name: string;

    @IsOptional()
    @IsNumber()
    @Expose({name: 'group_id', toPlainOnly:true })
    @ApiProperty({name: 'groupId'})
    groupId: number;
}