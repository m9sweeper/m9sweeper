import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Inject, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import { MineLoggerService } from '../../shared/services/mine-logger.service';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator';
import { Authority } from '../../user/enum/Authority';
import { AuthGuard } from '../../../guards/auth.guard';
import { AuthorityGuard } from '../../../guards/authority.guard';
import { DELETE_CLUSTER_RESPONSE_SCHEMA } from '../open-api-schema/cluster-schema';
import { DeprecatedGatekeeperTemplateDto } from '../dto/deprecated-gatekeeper-template-dto';
import { GatekeeperService } from '../services/gatekeeper.service';
import { GatekeeperConstraintDetailsDto } from '../dto/deprecated-gatekeeper-constraint-dto';

@ApiTags('Gatekeeper')
@ApiBearerAuth('jwt-auth')
@Controller(':clusterId/gatekeeper')
@UseInterceptors(ResponseTransformerInterceptor)
export class GatekeeperController {
  constructor(
    @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
    private readonly gatekeeperService: GatekeeperService,
    private logger: MineLoggerService,
  ) {}

  @Get('')
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 201,
    schema: {}
  })
  async getInstallationInfo(@Param('clusterId') clusterId) {
    return this.gatekeeperService.getInstallationInfo(clusterId);
  }

  /* Constraint Template endpoints */
  @Get('constraint-templates')
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 200,
  })
  async getConstraintTemplates(@Param('clusterId') clusterId: number): Promise<DeprecatedGatekeeperTemplateDto[]> {
    return this.gatekeeperService.getConstraintTemplates(clusterId);
  }

  @Post('constraint-templates')
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 200,
  })
  async createConstraintTemplates(
    @Param('clusterId') clusterId: number,
    @Body() templates: { name: string, template: string}[],
  ): Promise<any> {
    return this.gatekeeperService.createConstraintTemplates(clusterId, templates);
  }

  @Get('constraint-templates/templates')
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 201,
    schema: {},
  })
  async getConstraintTemplateTemplates(@Param('clusterId') clusterId: number) {
    return this.gatekeeperService.getConstraintTemplateTemplates(clusterId);
  }

  @Get('constraint-templates/:templateName')
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 200,
    schema: {},
  })
  async getConstraintTemplateByName(
    @Param('clusterId') clusterId: number,
    @Param('templateName') templateName: string,
  ): Promise<{
    associatedConstraints: GatekeeperConstraintDetailsDto[],
    constraintTemplate: DeprecatedGatekeeperTemplateDto,
    rawConstraintTemplate: string,
  }> {
    return this.gatekeeperService.getConstraintTemplateByName(clusterId, templateName);
  }

  @Get('constraint-templates/:templateName/raw')
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 200,
    schema: {},
  })
  async getConstraintTemplateByNameAsString(
    @Param('clusterId') clusterId: number,
    @Param('templateName') templateName: string,
  ): Promise<string> {
    return this.gatekeeperService.getConstraintTemplateAsString(clusterId, templateName);
  }

  @Get('constraint-templates/templates/titles')
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 201,
    schema: {},
  })
  async getConstraintTemplateTemplateTitles(@Param('clusterId') clusterId: number) {
    return this.gatekeeperService.getConstraintTemplateTemplateTitles(clusterId);
  }

  /* Constraint endpoints */
  @Get('constraints/:templateName')
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 200,
    schema: {},
  })
  async getConstraintsForTemplate(
    @Param('clusterId') clusterId: number,
    @Param('templateName') templateName: string
  ): Promise<GatekeeperConstraintDetailsDto[]> {
    return this.gatekeeperService.getConstraintsForTemplate(clusterId, templateName);
  }
}
