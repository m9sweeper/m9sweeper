import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator';
import { Authority } from '../../user/enum/Authority';
import { AuthGuard } from '../../../guards/auth.guard';
import { AuthorityGuard } from '../../../guards/authority.guard';
import { GatekeeperConstraintService } from '../services/gatekeeper-constraint.service';
import { InvalidClusterIdInterceptor } from '../../../interceptors';
import { GatekeeperConstraintDto } from '../dto';
import {
  GATEKEEPER_CONSTRAINT_ARRAY_SCHEMA,
  GATEKEEPER_CONSTRAINT_SCHEMA
} from '../open-api-schema/gatekeeper-constraint.schema';

@ApiTags('Gatekeeper')
@ApiBearerAuth('jwt-auth')
@Controller('constraint-templates/:templateName/constraints')
@UseInterceptors(InvalidClusterIdInterceptor, ResponseTransformerInterceptor)
export class GatekeeperConstraintController {
  constructor(
    private readonly gatekeeperConstraintService: GatekeeperConstraintService,
  ) {}

  @Get()
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 200,
    schema: GATEKEEPER_CONSTRAINT_ARRAY_SCHEMA,
  })
  async getConstraints(
    @Param('clusterId') clusterId: number,
    @Param('templateName') templateName: string,
  ): Promise<GatekeeperConstraintDto[]> {
    return this.gatekeeperConstraintService.getConstraintsForTemplate(clusterId, templateName);
  }

  @Post()
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 200,
    schema: GATEKEEPER_CONSTRAINT_SCHEMA,
  })
  async createConstraint(
    @Param('clusterId') clusterId: number,
    @Param('templateName') templateName: string,
    @Body() constraintContents: { constraint: any },
  ): Promise<GatekeeperConstraintDto> {
    return this.gatekeeperConstraintService.createConstraintForTemplate(clusterId, templateName, constraintContents.constraint);
  }
}
