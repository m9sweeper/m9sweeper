import { Exclude, Expose } from 'class-transformer';
import { GatekeeperConstraintTemplateDto } from './gatekeeper-constraint-template.dto';
import { IsOptional } from 'class-validator';

@Exclude()
export class GatekeeperConstraintTemplateBlueprintDto {
  @IsOptional()
  @Expose()
  name?: string;

  @IsOptional()
  @Expose()
  dir?: string;

  @IsOptional()
  @Expose()
  subDir?: string;

  @IsOptional()
  @Expose()
  template: GatekeeperConstraintTemplateDto | string;
}
