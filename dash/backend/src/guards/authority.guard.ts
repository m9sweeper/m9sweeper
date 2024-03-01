import {CanActivate, ExecutionContext, Inject, Injectable} from '@nestjs/common';
import {UserProfileDto} from '../modules/user/dto/user-profile-dto';
import {Reflector} from '@nestjs/core';

@Injectable()
export class AuthorityGuard implements CanActivate {

  constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
              private reflector: Reflector){}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const allowedAuthorities: string[] = <string[]> this.reflector.get<string[]>('allowedAuthorities', context.getHandler());
    return allowedAuthorities && this._loggedInUser.authorities.findIndex(currentUserAuthorities => allowedAuthorities.includes(currentUserAuthorities.type)) > -1;
  }
}
