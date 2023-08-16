import { Global, Module } from '@nestjs/common';
import { GatekeeperService } from './services/gatekeeper.service';
import { GatekeeperController } from './controllers/gatekeeper.controller';
import { GatekeeperConstraintService } from './services/gatekeeper-constraint.service';
import { GatekeeperConstraintTemplateService } from './services/gatekeeper-constraint-template.service';
import {
  GatekeeperConstraintTemplateBlueprintService
} from './services/gatekeeper-constraint-template-blueprint.service';
import { GatekeeperConstraintController } from './controllers/gatekeeper-constraint.controller';
import { GatekeeperConstraintTemplateController } from './controllers/gatekeeper-constraint-template.controller';
import {
  GatekeeperConstraintTemplateBlueprintController
} from './controllers/gatekeeper-constraint-template-blueprint.controller';

@Global()
@Module({
  providers: [
    GatekeeperService,
    GatekeeperConstraintTemplateBlueprintService,
    GatekeeperConstraintTemplateService,
    GatekeeperConstraintService,
  ],
  exports: [
    GatekeeperService,
    GatekeeperConstraintTemplateBlueprintService,
    GatekeeperConstraintTemplateService,
    GatekeeperConstraintService,
  ],
  controllers: [
    GatekeeperController,
    GatekeeperConstraintTemplateBlueprintController,
    GatekeeperConstraintTemplateController,
    GatekeeperConstraintController,
  ],

})
export class GatekeeperModule {}
