import {IGatekeeperConstraintTemplate} from './IGatekeeperConstraintTemplate.interface';

export interface IGatekeeperConstraintTemplateBlueprint {
  name?: string;
  dir?: string;
  subDir?: string;
  template: IGatekeeperConstraintTemplate | string;
}
