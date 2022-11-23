import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class HistoryK8sImageDto {
    @Expose({name: 'id', toPlainOnly: true})
    id: number;

    @Expose({ name: 'name', toPlainOnly: true})
    name: string;

    @Expose({ name: 'image', toPlainOnly: true})
    image: string;

    @Expose({ name: 'deployment_name', toPlainOnly: true})
    deploymentName: string;

    @Expose({ name: 'namespace', toPlainOnly: true})
    namespace: string;

    @Expose({ name: 'compliant', toPlainOnly: true})
    compliant: boolean;

    @IsOptional()
    @Expose({ name: 'cluster_id', toPlainOnly: true})
    clusterId: number;

    @IsOptional()
    @Expose({name: 'saved_date', toPlainOnly: true})
    savedDate: string;

    @IsOptional()
    @Expose({ name: 'cluster_name', toPlainOnly: true})
    clusterName: string;

    @IsOptional()
    @Expose({ name: 'image_hash', toPlainOnly: true})
    imageHash: string;

    @IsOptional()
    @Expose({name: 'image_id', toPlainOnly: true})
    imageId: number;
}
