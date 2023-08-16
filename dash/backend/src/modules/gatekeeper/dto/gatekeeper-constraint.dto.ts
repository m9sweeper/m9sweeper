import { Exclude, Expose, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

@Exclude()
class GatekeeperConstraintMetadataAnnotations {
  @IsOptional()
  @Expose()
  description: string;

  @IsOptional()
  @Expose()
  mode: string;
}

@Exclude()
class GatekeeperConstraintMetadataManagedFields {
  @IsOptional()
  @Expose()
  apiVersion: string;

  @IsOptional()
  @Expose()
  fieldsType: string;

  @IsOptional()
  @Expose()
  fieldsV1: any;

  @IsOptional()
  @Expose()
  manager: string;

  @IsOptional()
  @Expose()
  operation: string;

  @IsOptional()
  @Expose()
  time: string;
}

@Exclude()
class GatekeeperConstraintMetadata {
  @IsOptional()
  @Expose()
  @Type(() => GatekeeperConstraintMetadataAnnotations)
  annotations: GatekeeperConstraintMetadataAnnotations;

  @IsOptional()
  @Expose()
  creationTimestamp: string;

  @IsOptional()
  @Expose()
  generation: number;

  @IsOptional()
  @Expose()
  @Type(() => GatekeeperConstraintMetadataManagedFields)
  managedFields: GatekeeperConstraintMetadataManagedFields[];

  @IsOptional()
  @Expose()
  name: string;

  @IsOptional()
  @Expose()
  resourceVersion: string;

  @IsOptional()
  @Expose()
  selfLink: string;

  @IsOptional()
  @Expose()
  uid: string;
}

@Exclude()
class GatekeeperConstraintSpecMatch {
  @IsOptional()
  @Expose()
  excludedNamespaces: string[];

  @IsOptional()
  @Expose()
  kinds: {[key: string]: string[]}[];
}

@Exclude()
class GatekeeperConstraintSpecParameters {
  @IsOptional()
  @Expose()
  cpu: string;

  @IsOptional()
  @Expose()
  memory: string;
}

@Exclude()
class GatekeeperConstraintSpec {
  @IsOptional()
  @Expose()
  enforcementAction: string;

  @IsOptional()
  @Expose()
  @Type(() => GatekeeperConstraintSpecMatch)
  match: GatekeeperConstraintSpecMatch;

  @IsOptional()
  @Expose()
  parameters: GatekeeperConstraintSpecParameters;
}

@Exclude()
class GatekeeperConstraintStatusByPod {
  @IsOptional()
  @Expose()
  constraintUid: string;

  @IsOptional()
  @Expose()
  enforced: boolean;

  @IsOptional()
  @Expose()
  id: string;

  @IsOptional()
  @Expose()
  observedGeneration: number;

  @IsOptional()
  @Expose()
  operations: string[];

}

@Exclude()
class GatekeeperConstraintStatusViolations {
  @IsOptional()
  @Expose()
  enforcementAction: string;

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
  namespace: string;
}

@Exclude()
class GatekeeperConstraintStatus {
  @IsOptional()
  @Expose()
  auditTimestamp: string;

  @IsOptional()
  @Expose()
  byPod: GatekeeperConstraintStatusByPod[];

  @IsOptional()
  @Expose()
  totalViolations: number;

  @IsOptional()
  @Expose()
  violations: GatekeeperConstraintStatusViolations[];
}


@Exclude()
export class GatekeeperConstraintDto {
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
