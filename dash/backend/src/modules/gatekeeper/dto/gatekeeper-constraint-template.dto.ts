import { Exclude, Expose, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

@Exclude()
class GatekeeperConstraintTemplateMetadataAnnotations {
  @IsOptional()
  @Expose()
  description: string;

  @IsOptional()
  @Expose()
  'minesweeper.io/apiGroup': string;

  @IsOptional()
  @Expose()
  'minesweeper.io/kinds': string;
}

@Exclude()
class GatekeeperConstraintTemplateMetadata {
  @IsOptional()
  @Expose()
  name: string;

  @IsOptional()
  @Expose()
  @Type(() => GatekeeperConstraintTemplateMetadataAnnotations)
  annotations: GatekeeperConstraintTemplateMetadataAnnotations;
}

@Exclude()
export class GatekeeperConstraintTemplateSpecCrd {
  @IsOptional()
  @Expose()
  spec: {
    names: { kind: string },
    validation: any,
  };
}

@Exclude()
export class GatekeeperConstraintTemplateSpecTarget {
  @IsOptional()
  @Expose()
  target: string;

  @IsOptional()
  @Expose()
  rego: string;
}

@Exclude()
class GatekeeperConstraintTemplateSpec {
  @IsOptional()
  @Expose()
  @Type(() => GatekeeperConstraintTemplateSpecCrd)
  crd: GatekeeperConstraintTemplateSpecCrd;

  @IsOptional()
  @Expose()
  @Type(() => GatekeeperConstraintTemplateSpecTarget)
  targets: GatekeeperConstraintTemplateSpecTarget[];
}

@Exclude()
export class GatekeeperConstraintTemplateDto {
  @IsOptional()
  @Expose()
  apiVersion: string;

  @IsOptional()
  @Expose()
  kind: string;

  @IsOptional()
  @Expose()
  @Type(() => GatekeeperConstraintTemplateMetadata)
  metadata: GatekeeperConstraintTemplateMetadata;

  @IsOptional()
  @Expose()
  @Type()
  spec: GatekeeperConstraintTemplateSpec;

  @IsOptional()
  @Expose()
  constraintsCount: number;

  @IsOptional()
  @Expose()
  enforced: boolean;
}
