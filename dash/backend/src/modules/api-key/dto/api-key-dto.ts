import { Expose } from 'class-transformer';
import {IsBoolean, IsNumber, IsOptional, IsString} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyDto {
    @IsNumber()
    @IsOptional()
    id: number;

    @ApiProperty({name: 'userId'})
    @IsNumber()
    @Expose({name: 'user_id', toPlainOnly: true})
    userId: number;

    @ApiProperty({name: 'name'})
    @IsString()
    @Expose({name: 'name', toPlainOnly: true})
    name: string;

    @Expose({name: 'api', toPlainOnly: true})
    api: string;

    @ApiProperty({name: 'isActive'})
    @IsBoolean()
    @Expose({name: 'is_active', toPlainOnly: true})
    isActive: boolean;

    createdBy: string;

    createdAt: number;

    updatedBy: string;

    updatedAt: number;

    deletedAt: number;

    @IsOptional()
    metadata: any;
}
