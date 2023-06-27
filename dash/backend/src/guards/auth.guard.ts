import {CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {UserProfileDto} from '../modules/user/dto/user-profile-dto';
import {MineLoggerService} from '../modules/shared/services/mine-logger.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
    private readonly logger: MineLoggerService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this._loggedInUser) {
      this.logger.log(
        {
          label: 'User authenticated',
          data: {params: {userId: this._loggedInUser.id}}
        },
        AuthGuard.name
      );
      return true;
    } else {
      throw new UnauthorizedException('Invalid auth token');
    }
  }
}
