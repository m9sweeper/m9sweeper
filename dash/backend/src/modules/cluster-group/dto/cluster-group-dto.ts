import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import {IsString, isNumber, IsNumber, IsOptional} from 'class-validator';

export class ClusterGroupDto {
    @Expose({name: 'id', toPlainOnly: true})
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    id: number;

    @Expose({name: 'name', toPlainOnly: true})
    @ApiProperty()
    @IsString()
    @IsOptional()
    name: string;

    @Expose({name: 'user_id', toPlainOnly: true})
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    userId: number;

    createdAt: number;
    updatedAt: number;
    deletedAt: number;
}
