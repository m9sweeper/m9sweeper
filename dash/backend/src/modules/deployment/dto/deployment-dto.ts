import {Expose, Transform} from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class DeploymentDto {
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

    @Expose({ name: 'cluster_name', toPlainOnly: true})
    @IsString()
    @IsOptional()
    clusterName: string;

    @Expose({ name: 'namespace', toPlainOnly: true})
    @IsString()
    @IsOptional()
    namespace: string;

    @Expose({ name: 'generation', toPlainOnly: true})
    @IsNumber()
    @IsOptional()
    generation: number;

    @Expose({ name: 'creation_timestamp', toPlainOnly: true})
    @IsString()
    @IsOptional()
    creationTimestamp: number;

    @Expose({ name: 'compliant', toPlainOnly: true})
    @IsBoolean()
    @IsOptional()
    @Transform(value => value || false)
    compliant: boolean;

    @Expose({ name: 'cluster_id', toPlainOnly: true})
    @IsNumber()
    @IsOptional()
    clusterId: number;
}
