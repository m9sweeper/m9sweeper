import { Controller, Get, Param, Query, Response } from '@nestjs/common';
import * as qs from 'qs';
import { ExternalAuthConfigService } from '../services/external-auth-config.service';
import { OAuth2Factory } from '../factories/OAuth2Factory';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import { UserProfileService } from '../../user/services/user-profile.service';
import { JwtUtilityService } from '../services/jwt-utility.service';
import {ApiExcludeEndpoint} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@Controller('redirectable-login')
export class RedirectableLoginController {

  constructor(private readonly oAuth2Factory: OAuth2Factory,
              private readonly externalAuthConfigService: ExternalAuthConfigService,
              private readonly userProfileService: UserProfileService,
              private readonly jwtUtility: JwtUtilityService,
              private readonly configService: ConfigService) {}

  @ApiExcludeEndpoint(true)
  @Get('oauth2/:providerId')
  async oauth2LoginAction(@Param('providerId') providerId: number, @Response() response): Promise<any> {
    const authProviderConfig = await this.externalAuthConfigService.loadById(providerId);
    if (authProviderConfig) {
      const oAuth2Service = this.oAuth2Factory.getInstance(authProviderConfig);
      const authUrl = oAuth2Service.getAuthorizationUrl();
      response.redirect(authUrl);
    } else {
      throw new Error('Invalid Auth Provider');
    }
    return '';
  }

  @ApiExcludeEndpoint(true)
  @Get('oauth2-callback')
  async oauth2CallbackAction(@Query('state') state: string, @Query('code') accessCode: string, @Response() response): Promise<any> {
    const providerState: any = qs.parse(state);
    if (providerState.id) {
      const authProviderConfig = await this.externalAuthConfigService.loadById(providerState.id);
      if (authProviderConfig) {
        console.log('authProviderConfig: ', authProviderConfig);
        const oAuth2Service = this.oAuth2Factory.getInstance(authProviderConfig);
        const externalUserData: UserProfileDto = await oAuth2Service.getOAuthUserData(accessCode);

        const users: UserProfileDto[] = await this.userProfileService.loadUserByEmail(externalUserData.email);
        if(users && Array.isArray(users) && !users[0].isActive)
        {
          response.redirect(`${this.configService.get('server.frontendUrl')}/public/login?error_message=User is not active`);
        }
        const user: UserProfileDto = users ? users.pop() : await this.userProfileService.createUser(externalUserData);
        // Delete the user's password for security. We should never return a password to the frontend.
        delete user.password;

        const jwtToken = await this.jwtUtility.getToken(JSON.stringify(user));

        response.redirect(`${this.configService.get('server.frontendUrl')}/public/external-auth/${jwtToken}`);
      }
    }
    response.redirect(`${this.configService.get('server.frontendUrl')}/public/login?error_message=Invalid Auth Provider`);
    return '';
  }
}
