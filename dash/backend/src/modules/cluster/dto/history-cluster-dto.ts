import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class Tag {
    name: string;
    id: number;
}

export class HistoryClusterDto {

    @Expose({name: 'id', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    id: number;

    @Expose({name: 'cluster_id', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    clusterId: number;

    @Expose({name: 'name', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    name: string;

    @Expose({name: 'ip_address', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    ipAddress: string;

    @Expose({name: 'port', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    port: string;

    @Expose({name: 'context', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    context: string;

    @Expose({name: 'group_id', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    groupId: number;

    @Expose({name: 'tags', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    @Type(() => Tag)
    tags: string;

    @Expose({name: 'kube_config', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    kubeConfig: string;

    @IsString()
    @IsOptional()
    @Expose({name: 'created_at', toPlainOnly: true})
    createdAt: number;

    @IsNumber()
    @IsOptional()
    @Expose({name: 'updated_at', toPlainOnly: true})
    updatedAt: number;

    @IsNumber()
    @IsOptional()
    @Expose({name: 'deleted_at', toPlainOnly: true})
    deletedAt: number;

    @IsString()
    @IsOptional()
    @Expose({name: 'saved_date', toPlainOnly: true})
    savedDate: string;
}
