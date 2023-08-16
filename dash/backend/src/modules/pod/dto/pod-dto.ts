import { Expose } from 'class-transformer';
import {IsArray, IsBoolean, IsNumber, IsOptional, IsString} from "class-validator";
import {GateKeeperConstraintViolation} from "../../cluster/dto/deprecated-gatekeeper-constraint-dto";

export class PodDto {
    @Expose({name: 'id', toPlainOnly: true})
    @IsNumber()
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

    @Expose({ name: 'namespace', toPlainOnly: true})
    @IsString()
    @IsOptional()
    namespace: string;

    @Expose({ name: 'generate_name', toPlainOnly: true})
    @IsNumber()
    @IsOptional()
    generateName: string;

    @Expose({ name: 'creation_timestamp', toPlainOnly: true})
    @IsString()
    @IsOptional()
    creationTimestamp: string

    @Expose({ name: 'compliant', toPlainOnly: true})
    @IsBoolean()
    @IsOptional()
    compliant = false;

    @Expose({ name: 'cluster_id', toPlainOnly: true})
    @IsNumber()
    @IsOptional()
    clusterId: number;

    @Expose({ name: 'pod_status', toPlainOnly: true })
    @IsString()
    @IsOptional()
    podStatus: string;

    @IsOptional()
    @IsArray()
    violations: GateKeeperConstraintViolation[];
}
