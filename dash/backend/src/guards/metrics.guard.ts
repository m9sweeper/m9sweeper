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

@Injectable()
export class MetricsGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
    private readonly logger: MineLoggerService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metricsConfig = await this.configService.get('metrics');
    if (metricsConfig.disableEndpoint) {
      this.logger.log({label: 'Metrics endpoint disabled; throwing 404'}, 'MetricsController.index');
      throw new NotFoundException('ENOENT: no such file or directory');
    }
    if (metricsConfig.secureEndpoint) {
      console.log('helloworld');
      // validate authorization
      throw new UnauthorizedException('Access denied');
    }
    return true;
  }
}
