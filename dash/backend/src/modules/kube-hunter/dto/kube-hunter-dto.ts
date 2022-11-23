import {Expose, Transform} from "class-transformer";
import {IsNumber, IsString} from "class-validator";

export class KubeHunterDto {
    @Expose({name: 'id', toPlainOnly: true})
    @IsNumber()
    id: number;

    @Expose({name: 'cluster_id', toPlainOnly: true})
    @IsNumber()
    clusterId: number;

    @Expose({name: 'created_at', toPlainOnly: true})
    @IsNumber()
    createdAt: number;

    /** Deprecated */
    @Expose({name: 'uuid', toPlainOnly: true})
    @IsString()
    uuid: string;

    @Expose({name: 'nodes', toPlainOnly: true})
    @Transform(value => JSON.stringify(value))
    nodes: any[];

    @Expose({name: 'services', toPlainOnly: true})
    @Transform(value => JSON.stringify(value))
    services: any[];

    @Expose({name: 'vulnerabilities', toPlainOnly: true})
    @Transform(value => JSON.stringify(value))
    vulnerabilities: any[];
}
