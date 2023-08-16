import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { Controller, Get, Inject, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MineLoggerService } from '../../shared/services/mine-logger.service';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import { GatekeeperService } from '../services/gatekeeper.service';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator';
import { Authority } from '../../user/enum/Authority';
import { AuthGuard } from '../../../guards/auth.guard';
import { AuthorityGuard } from '../../../guards/authority.guard';
import { GatekeeperResponseStructure } from '../dto/gatekeeper-generic.dto';
import { GatekeeperConstraintTemplateDto } from '../dto/gatekeeper-constraint-template.dto';
import { V1APIService } from '@kubernetes/client-node';

@ApiTags('Gatekeeper')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class GatekeeperController {
  constructor(
    @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
    private readonly gatekeeperService: GatekeeperService,
    private logger: MineLoggerService,
  ) {}

  @Get()
  @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
  @UseGuards(AuthGuard, AuthorityGuard)
  @ApiResponse({
    status: 201,
    schema: {}
  })
  async getInstallationInfo(@Param('clusterId') clusterId): Promise<GatekeeperResponseStructure<{
    constraints: GatekeeperConstraintTemplateDto[],
    gatekeeperResource: Partial<V1APIService>,
  }>> {
    return this.gatekeeperService.getInstallationInfo(clusterId);
  }
}
