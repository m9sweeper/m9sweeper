import {Expose, Transform} from 'class-transformer';
import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsOptional, IsString} from "class-validator";

export class ClusterEventCreateDto {
    @Expose({ name: 'organization_id', toPlainOnly: true})
    @ApiProperty({name: 'organizationId'})
    @IsNumber()
    organizationId: number;

    @Expose({ name: 'entity_type', toPlainOnly: true})
    @ApiProperty({name: 'entityType'})
    @IsString()
    entityType: string;

    @Expose({ name: 'type', toPlainOnly: true})
    @ApiProperty({name: 'type'})
    @IsString()
    @IsOptional()
    type: string;

    @Expose({ name: 'level', toPlainOnly: true})
    @ApiProperty({name: 'level'})
    @IsString()
    @IsOptional()
    level: string;

    @Expose({ name: 'description', toPlainOnly: true})
    @ApiProperty({name: 'description'})
    @IsString()
    @IsOptional()
    description: string;

    @Expose({ name: 'data', toPlainOnly: true})
    @ApiProperty({name: 'data'})
    @IsString()
    @IsOptional()
    @Transform(value => JSON.stringify(value))
    data: any;
}
