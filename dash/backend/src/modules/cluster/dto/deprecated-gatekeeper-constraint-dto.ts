import {IsOptional} from "class-validator";
import {Exclude, Expose, Type} from "class-transformer";

/**
 * @deprecated
 */
@Exclude()
export class GatekeeperConstraintMetadataAnnotations {
    @IsOptional()
    @Expose()
    mode: string;

    @IsOptional()
    @Expose()
    description: string;
}

/**
 * @deprecated
 */
@Exclude()
export class GatekeeperConstraintMetadata {
    @IsOptional()
    @Expose()
    name: string;

    @IsOptional()
    @Expose()
    @Type(() => GatekeeperConstraintMetadataAnnotations)
    annotations: GatekeeperConstraintMetadataAnnotations;

    @IsOptional()
    @Expose()
    uid: string;

    @IsOptional()
    @Expose()
    creationTimestamp: string;
}

/**
 * @deprecated
 */
@Exclude()
export class GatekeeperConstraintSpecMatchKind {
    @IsOptional()
    @Expose()
    apiGroups: string[];

    @IsOptional()
    @Expose()
    kinds: string[];
}

/**
 * @deprecated
 */
@Exclude()
export class GatekeeperConstraintSpecMatch {
    @IsOptional()
    @Expose()
    @Type(() => GatekeeperConstraintSpecMatchKind)
    kinds: GatekeeperConstraintSpecMatchKind[];

    @IsOptional()
    @Expose()
    excludedNamespaces: string[];

    @IsOptional()
    @Expose()
    namespaces: string[];
}

/**
 * @deprecated
 */
@Exclude()
export class GatekeeperConstraintSpec {
    @IsOptional()
    @Expose()
    enforcementAction: string;

    @IsOptional()
    @Expose()
    @Type(() => GatekeeperConstraintSpecMatch)
    match: GatekeeperConstraintSpecMatch;

    @IsOptional()
    @Expose()
    parameters: any;
}

/**
 * @deprecated
 */
@Exclude()
export class GateKeeperConstraintViolation{
    @IsOptional()
    @Expose()
    enforcementAction: string ;

    @IsOptional()
    @Expose()
    kind: string;

    @IsOptional()
    @Expose()
    message: string;

    @IsOptional()
    @Expose()
    name: string;

    @IsOptional()
    @Expose()
    namespace: string
}

/**
 * @deprecated
 */
@Exclude()
export class GatekeeperConstraintStatus {
    @IsOptional()
    @Expose()
    auditTimestamp: string;

    @IsOptional()
    @Expose()
    totalViolations: number;

    @IsOptional()
    @Expose()
    violations: GateKeeperConstraintViolation[];
}

/**
 * @deprecated
 */
@Exclude()
export class GatekeeperConstraintDetailsDto {
    @IsOptional()
    @Expose()
    apiVersion: string;

    @IsOptional()
    @Expose()
    kind: string;

    @IsOptional()
    @Expose()
    @Type(() => GatekeeperConstraintMetadata)
    metadata: GatekeeperConstraintMetadata;

    @IsOptional()
    @Expose()
    @Type(() => GatekeeperConstraintSpec)
    spec: GatekeeperConstraintSpec;

    @IsOptional()
    @Expose()
    @Type(() => GatekeeperConstraintStatus)
    status: GatekeeperConstraintStatus;
}
