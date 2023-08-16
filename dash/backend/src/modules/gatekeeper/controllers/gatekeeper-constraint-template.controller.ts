import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { Body, Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator';
import { Authority } from '../../user/enum/Authority';
import { AuthGuard } from '../../../guards/auth.guard';
import { AuthorityGuard } from '../../../guards/authority.guard';
import { GatekeeperConstraintTemplateService } from '../services/gatekeeper-constraint-template.service';
import { GatekeeperConstraintTemplateDto } from '../dto/gatekeeper-constraint-template.dto';
import { KubeConfig } from '@kubernetes/client-node/dist/config';
import { GatekeeperConstraintDto } from '../dto/gatekeeper-constraint.dto';

@ApiTags('Gatekeeper')
@ApiBearerAuth('jwt-auth')
@Controller('constraint-templates')
@UseInterceptors(ResponseTransformerInterceptor)
export class GatekeeperConstraintTemplateController {
  constructor(
    private readonly gatekeeperConstraintTemplateService: GatekeeperConstraintTemplateService,
  ) {}

  @Get()
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 200,
    schema: {}
  })
  async getConstraintTemplates(@Param('clusterId') clusterId: number): Promise<GatekeeperConstraintTemplateDto[]> {
    return this.gatekeeperConstraintTemplateService.getConstraintTemplates(clusterId);
  }

  @Get()
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 200,
    schema: {}
  })
  async deployConstraintTemplates(
    @Param('clusterId') clusterId: number,
    @Body() templates: { name: string, template: string }[],
  ): Promise<{ successfullyDeployed: string[], unsuccessfullyDeployed: string[] }> {
    return this.gatekeeperConstraintTemplateService.createConstraintTemplates(clusterId, templates);
  }

  @Get(':templateName')
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 200,
    schema: {}
  })
  async getConstraintTemplateByName(
    @Param('clusterId') clusterId: number,
    @Param('templateName') templateName: string,
  ): Promise<{
    associatedConstraints: GatekeeperConstraintDto[],
    template: GatekeeperConstraintTemplateDto,
    rawConstraintTemplate: string,
  }> {
    return this.gatekeeperConstraintTemplateService.getConstraintTemplate(clusterId, templateName);
  }

}
