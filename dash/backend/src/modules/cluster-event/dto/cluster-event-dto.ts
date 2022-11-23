import {Expose} from 'class-transformer';
import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsString} from "class-validator";

export class ClusterEventDto {
    @Expose({name: 'id', toPlainOnly: true})
    @ApiProperty({name: 'id'})
    @IsNumber()
    id: number;

    @Expose({ name: 'organization_id', toPlainOnly: true})
    @ApiProperty({name: 'organization_id'})
    @IsNumber()
    organizationId: number;

    @Expose({ name: 'entity_type', toPlainOnly: true})
    @ApiProperty({name: 'entity_type'})
    @IsString()
    entityType: string;

    @Expose({ name: 'entity_id', toPlainOnly: true})
    @ApiProperty({name: 'entity_id'})
    @IsNumber()
    entityId: number;

    @Expose({ name: 'created_date', toPlainOnly: true})
    @ApiProperty({name: 'created_date'})
    @IsNumber()
    createdDate: number;

    @Expose({ name: 'type', toPlainOnly: true})
    @ApiProperty({name: 'type'})
    @IsString()
    type: string;

    @Expose({ name: 'level', toPlainOnly: true})
    @ApiProperty({name: 'level'})
    @IsString()
    level: string;

    @Expose({ name: 'description', toPlainOnly: true})
    @ApiProperty({name: 'description'})
    @IsString()
    description: string;

    @Expose({ name: 'data', toPlainOnly: true})
    @ApiProperty({name: 'data'})
    @IsString()
    data: string;

    createdAt: number;
    updatedAt: number;
    deletedAt: number;
}
