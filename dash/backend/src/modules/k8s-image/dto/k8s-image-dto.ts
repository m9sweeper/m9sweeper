import {Expose, Transform} from 'class-transformer';
import {IsNumber, IsOptional, IsString} from 'class-validator';

export class K8sImageDto {
    @Expose({name: 'id', toPlainOnly: true})
    @IsOptional()
    id: number;

    @Expose({ name: 'name', toPlainOnly: true})
    @IsString()
    @IsOptional()
    name: string;

    @Expose({ name: 'image', toPlainOnly: true})
    @IsString()
    @IsOptional()
    image: string;

    @Expose({ name: 'cluster_name', toPlainOnly: true})
    @IsString()
    @IsOptional()
    clusterName: string;

    @Expose({ name: 'namespace', toPlainOnly: true})
    @IsString()
    @IsOptional()
    namespace: string;

    @Expose({ name: 'deployment_name', toPlainOnly: true})
    @IsString()
    @IsOptional()
    deploymentName: string;

    @Expose({ name: 'image_hash', toPlainOnly: true})
    @IsString()
    @IsOptional()
    imageHash: string;

    @Expose({ name: 'compliant', toPlainOnly: true})
    @IsOptional()
    @Transform(value => !!value)
    compliant: boolean;

    @Expose({ name: 'cluster_id', toPlainOnly: true})
    @IsNumber()
    @IsOptional()
    clusterId: number;

    @Expose({name: 'image_id', toPlainOnly: true})
    @IsNumber()
    imageId: number;

}
