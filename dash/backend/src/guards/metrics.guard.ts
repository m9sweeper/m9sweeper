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
import { Request } from 'express';
import { ApiKeyService } from '../modules/api-key/services/api-key.service';
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
    private apiKeyService: ApiKeyService,
    private configService: ConfigService,
    // if this isn't populated, then the apiKey was empty
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
      if (this._loggedInUser) {
        return this.userHasMinimumRequiredAuthority(this._loggedInUser);
      }

      const request = context.switchToHttp().getRequest();
      // the following portion could be moved into LoggedInUserFactory.ts
      // it would allow us to retrieve API Keys as Bearer tokens, from headers, and from query strings
      // if we moved it, _loggedInUser would be populated for us
      const apiKey = this.extractTokenFromHeader(request) || this.extractApiKeyFromHeader(request) || this.extractApiKeyFromQueryString(request);
      if (apiKey) {
        const userInfo = await this.apiKeyService.getUserInfoByApiKey(apiKey);
        if (userInfo) {
          return this.userHasMinimumRequiredAuthority(userInfo);
        }

        return this.metricsConfig.security.apiKey && apiKey === this.metricsConfig.security.apiKey;
      }

      return false;
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
    const allowedAuthorities = [Authority.API_KEY];
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

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
  private extractApiKeyFromHeader(request: Request): string | undefined {
    return request.headers['x-api-key'] as string || undefined;
  }
  private extractApiKeyFromQueryString(request: Request): string | undefined {
    return request.query['x-api-key'] as string || undefined;
  }
}
