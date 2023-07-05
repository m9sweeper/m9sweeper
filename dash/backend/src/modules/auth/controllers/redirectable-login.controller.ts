import {Body, Controller, Get, Param, Post, Query, Response} from '@nestjs/common';
import * as qs from 'qs';
import { ExternalAuthConfigService } from '../services/external-auth-config.service';
import { OAuth2Factory } from '../factories/OAuth2Factory';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import { JwtUtilityService } from '../services/jwt-utility.service';
import {ApiExcludeEndpoint} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@Controller('redirectable-login')
export class RedirectableLoginController {

  constructor(
    private readonly oAuth2Factory: OAuth2Factory,
    private readonly externalAuthConfigService: ExternalAuthConfigService,
    private readonly jwtUtility: JwtUtilityService,
    private readonly configService: ConfigService
  ) {}

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
  @Post('oauth2-callback')
  async oauth2CallbackActionPost(@Body() formData: {id_token: string; access_token: string; session_state: string; state: string;}, @Response() response): Promise<any> {
    try {
      const providerState: {id: number} = JSON.parse(formData?.state);
      const jwt = await this.redirectCallbackHandler(+providerState?.id, formData.access_token);
      if (jwt && jwt !== '') {
        response.redirect(`${this.configService.get('server.frontendUrl')}/public/external-auth/${jwt}`);
      }
      response.redirect(`${this.configService.get('server.frontendUrl')}/public/login?error_message=Invalid Login`);
    } catch (e) {
      response.redirect(`${this.configService.get('server.frontendUrl')}/public/login?error_message=${e.message}`);
    }
  }

  @ApiExcludeEndpoint(true)
  @Get('oauth2-callback')
  async oauth2CallbackAction(@Query('state') state: string, @Query('code') accessCode: string, @Response() response): Promise<any> {
    try {
      const providerState: any = qs.parse(state);
      const jwt = await this.redirectCallbackHandler(providerState?.id, accessCode);
      if (jwt && jwt !== '') {
        response.redirect(`${this.configService.get('server.frontendUrl')}/public/external-auth/${jwt}`);
      }
      response.redirect(`${this.configService.get('server.frontendUrl')}/public/login?error_message=Invalid Login`);
    } catch (e) {
      response.redirect(`${this.configService.get('server.frontendUrl')}/public/login?error_message=${e.message}`);
    }
  }

  private async redirectCallbackHandler(providerState: number, accessCode: string): Promise<string> {
    if (providerState > 0 && accessCode && accessCode !== '') {
      const authProviderConfig = await this.externalAuthConfigService.loadById(providerState);
      if (authProviderConfig) {
        const oAuth2Service = this.oAuth2Factory.getInstance(authProviderConfig);
        const user: UserProfileDto = await oAuth2Service.getOAuthUserData(accessCode);

        // Delete the user's password for security. We should never return a password to the frontend.
        delete user.password;

        return await this.jwtUtility.getToken(JSON.stringify(user));
      }
    }
  }
}
