import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { UserProfileDto } from '../modules/user/dto/user-profile-dto';
import { MineLoggerService } from '../modules/shared/services/mine-logger.service';
import { ConfigService } from '@nestjs/config';
import { Authority } from '../modules/user/enum/Authority';

@Injectable()
export class MetricsGuard implements CanActivate {
  private metricsConfig: {
    disableEndpoint: boolean;  // default: false
    secureEndpoint: boolean;  // default: false
    security: {
      apiKey: string;  // default: empty
      minimumAuthority: string;  // default: SUPER_ADMIN
    };
  };

  constructor(
    private configService: ConfigService,
    // if this isn't populated, then the apiKey was empty
    // (LoggedInUserFactory.ts)
    @Inject('LOGGED_IN_USER')
    private readonly _loggedInUser: UserProfileDto,
    private readonly logger: MineLoggerService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.metricsConfig = await this.configService.get('metrics');
    if (this.metricsConfig.disableEndpoint) {
      this.logger.log({label: 'Metrics endpoint disabled; throwing 404'}, 'MetricsController.index');
      throw new NotFoundException('ENOENT: no such file or directory');
    }
    if (this.metricsConfig.secureEndpoint) {
      return this._loggedInUser && this.userHasMinimumRequiredAuthority(this._loggedInUser);
    }
    return true;
  }

  private userHasMinimumRequiredAuthority(userInfo): boolean {
    const userAuthorities = userInfo.authorities.map((authority: { id: number, type: string; }) => authority.type);

    const allowedAuthorities = this.getAllowedAuthorities();

    const userAuthoritiesWithPermission = allowedAuthorities.filter(function(n) {
      return userAuthorities.indexOf(n) !== -1;
    });

    return userAuthoritiesWithPermission.length > 0;
  }

  private getAllowedAuthorities() {
    const allowedAuthorities = [Authority.METRICS];
    if (this.metricsConfig.security?.minimumAuthority) {
      switch (this.metricsConfig.security.minimumAuthority) {
        case Authority.READ_ONLY:
          allowedAuthorities.push(Authority.READ_ONLY, Authority.ADMIN, Authority.SUPER_ADMIN);
          break;
        case Authority.ADMIN:
          allowedAuthorities.push(Authority.ADMIN, Authority.SUPER_ADMIN);
          break;
        case Authority.SUPER_ADMIN:
          allowedAuthorities.push(Authority.SUPER_ADMIN);
          break;
      }
    }
    return allowedAuthorities;
  }
}
