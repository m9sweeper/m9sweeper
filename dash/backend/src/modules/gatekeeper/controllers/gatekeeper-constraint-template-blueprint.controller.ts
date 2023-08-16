import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator';
import { Authority } from '../../user/enum/Authority';
import { AuthGuard } from '../../../guards/auth.guard';
import { AuthorityGuard } from '../../../guards/authority.guard';
import {
  GatekeeperConstraintTemplateBlueprintService
} from '../services/gatekeeper-constraint-template-blueprint.service';

@ApiTags('Gatekeeper')
@ApiBearerAuth('jwt-auth')
@Controller('constraint-template-blueprints')
@UseInterceptors(ResponseTransformerInterceptor)
export class GatekeeperConstraintTemplateBlueprintController {
  constructor(
    private readonly gatekeeperBlueprintService: GatekeeperConstraintTemplateBlueprintService,
  ) {}

  @Get()
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 201,
    schema: {}
  })
  async getConstraintTemplateBlueprints(@Param('clusterId') clusterId: number): Promise<{
    category: string,
    templates: {
      name: string,
      template: any | string,
    }[],
  }[]> {
    return this.gatekeeperBlueprintService.getBlueprints(clusterId);
  }
}
