import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class HistoryDeploymentDto {
    @Expose({name: 'id', toPlainOnly: true})
    id: number;

    @Expose({ name: 'name', toPlainOnly: true})
    name: string;

    @Expose({ name: 'self_link', toPlainOnly: true})
    selfLink: string;

    @Expose({ name: 'uid', toPlainOnly: true})
    uid: string;

    @Expose({ name: 'resource_version', toPlainOnly: true})
    resourceVersion: string;

    @Expose({ name: 'namespace', toPlainOnly: true})
    namespace: string;

    @Expose({ name: 'generation', toPlainOnly: true})
    generation: number;

    @Expose({ name: 'creation_timestamp', toPlainOnly: true})
    creationTimestamp: number;

    @Expose({ name: 'compliant', toPlainOnly: true})
    compliant: boolean;

    @Expose({ name: 'cluster_id', toPlainOnly: true})
    clusterId: number;

    @IsOptional()
    @Expose({ name: 'cluster_name', toPlainOnly: true})
    clusterName: string;

    @IsOptional()
    @Expose({name: 'saved_date', toPlainOnly: true})
    savedDate: string;
}
