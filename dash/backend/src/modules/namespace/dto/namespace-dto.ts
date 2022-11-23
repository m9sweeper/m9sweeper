import { Expose, Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class NamespaceDto {
    @Expose({name: 'id', toPlainOnly: true})
    @IsOptional()
    id: number;

    @Expose({ name: 'name', toPlainOnly: true})
    @IsString()
    @IsOptional()
    name: string;

    @Expose({ name: 'self_link', toPlainOnly: true})
    @IsString()
    @IsOptional()
    selfLink: string;

    @Expose({ name: 'uid', toPlainOnly: true})
    @IsString()
    @IsOptional()
    uid: string;

    @Expose({ name: 'resource_version', toPlainOnly: true})
    @IsString()
    @IsOptional()
    resourceVersion: string;

    @Expose({ name: 'creation_timestamp', toPlainOnly: true})
    @IsNumber()
    @IsOptional()
    creationTimestamp: number;

    @Expose({ name: 'cluster_id', toPlainOnly: true})
    @IsNumber()
    @IsOptional()
    clusterId: number;

    @Expose({ name: 'compliant', toPlainOnly: true})
    @IsBoolean()
    @IsOptional()
    @Transform(metadata => metadata?.value || false)
    compliant: boolean;
}

