import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class HistoryNamespaceDto {
    @Expose({name: 'id', toPlainOnly: true})
    id: number;

    @Expose({ name: 'name', toPlainOnly: true})
    name: string;

    @Expose({ name: 'self_link', toPlainOnly: true})
    selfLink: string;

    @Expose({ name: 'uid', toPlainOnly: true})
    uid: string;

    @Expose({ name: 'cluster_id', toPlainOnly: true})
    clusterId: number;

    @Expose({ name: 'resource_version', toPlainOnly: true})
    resourceVersion: string;

    @Expose({ name: 'creation_timestamp', toPlainOnly: true})
    creationTimestamp: number;

    @Expose({ name: 'compliant', toPlainOnly: true})
    compliant: boolean;

    @IsOptional()
    @Expose({name: 'saved_date', toPlainOnly: true})
    savedDate: string;
}

