import { Exclude } from 'class-transformer';
import { GatekeeperConstraintTemplateDto } from './gatekeeper-constraint-template.dto';

@Exclude()
export class GatekeeperConstraintTemplateBlueprintDto {
  name: string;
  template: GatekeeperConstraintTemplateDto | string;
}
