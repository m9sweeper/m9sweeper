import {IsOptional} from "class-validator";
import {Exclude, Expose, Type} from "class-transformer";

@Exclude()
export class GatekeeperConstraintMetadataAnnotations {
    @IsOptional()
    @Expose()
    mode: string;

    @IsOptional()
    @Expose()
    description: string;
}

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

@Exclude()
export class GatekeeperConstraintSpecMatchKind {
    @IsOptional()
    @Expose()
    apiGroups: string[];

    @IsOptional()
    @Expose()
    kinds: string[];
}

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

// @Exclude()
// export class GatekeeperConstraintSpecLabel {
//     @IsOptional()
//     @Expose()
//     labels: string[];
//
// }

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