import {ForbiddenException, Injectable, Scope} from '@nestjs/common';
import { HttpService } from "@nestjs/axios";
import { AxiosRequestConfig } from 'axios';
import * as qs from 'qs';
import { Oauth2AuthProvider } from './oauth2-auth-provider';
import { ConfigService } from '@nestjs/config';
import { OAuth2AuthStrategyConfig } from '../../models/auth-configuration';
import { SourceSystem, UserAuthority, UserProfileDto } from '../../../user/dto/user-profile-dto';
import {AuthorityId} from '../../../user/enum/authority-id';

@Injectable({scope: Scope.REQUEST})
export class GoogleOauth2Service extends Oauth2AuthProvider {

  constructor(private readonly httpClient: HttpService,
              protected readonly configService: ConfigService){
    super();
  }

  async getOAuthUserData(accessCode: string): Promise<UserProfileDto> {
    const oAuth2Config = <OAuth2AuthStrategyConfig> this._authConfiguration.authConfig;
    const accessTokenData = await this.getOauthAccessToken(oAuth2Config.accessTokenUri, {
      code: accessCode,
      client_id: oAuth2Config.clientId,
      client_secret: oAuth2Config.clientSecret,
      grant_type: "authorization_code",
      redirect_uri: this.configService.get('server.baseUrl') + oAuth2Config.redirectUri
    });

    const oAuthUserProfile = await this.getOauthProfile('https://www.googleapis.com/oauth2/v3/userinfo?alt=json', {
      params: {
        access_token: accessTokenData.data.access_token
      }
    });
    const userProfile = new UserProfileDto();
    userProfile.firstName = oAuthUserProfile.data?.given_name;
    userProfile.lastName = oAuthUserProfile.data?.family_name;
    userProfile.email = oAuthUserProfile.data?.email;
    userProfile.phone = '';
    const userSourceSystem = new SourceSystem();
    userSourceSystem.id = this._authConfiguration.id.toString();
    userSourceSystem.uid = oAuthUserProfile.data?.sub;
    userSourceSystem.type = this._authConfiguration.authType;
    userProfile.sourceSystem = userSourceSystem;

    userProfile.authorities = [];

    // Check access rights for profile
    const userAuthority = new UserAuthority();
    const emailDomain = userProfile.email.split('@').pop().toLowerCase().trim();
    if (oAuth2Config.allowedDomains.includes(emailDomain)) {
      userAuthority.id = AuthorityId.READ_ONLY;
      userProfile.authorities.push(userAuthority);
    } else {
      throw new ForbiddenException('Access Denied', 'User is not permitted to access this site');
    }

    return userProfile;
  }

  async getOauthAccessToken(url: string, data): Promise<any> {
    return this.httpClient.post(url, qs.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    }).toPromise();
  }

  getOauthProfile(url: string, config: AxiosRequestConfig): Promise<any> {
    return this.httpClient.get(url, config).toPromise();
  }

  getAuthorizationUrl(): string {
    const oAuth2Config = <OAuth2AuthStrategyConfig>this._authConfiguration.authConfig;

    const stateQs = {
      id: this._authConfiguration.id
    };

    const authQuery = {
      scope: oAuth2Config.scopes.join(' '),
      access_type: 'offline',
      response_type: 'code',
      client_id: oAuth2Config.clientId,
      redirect_uri: this.configService.get('server.baseUrl') + oAuth2Config.redirectUri,
      state: qs.stringify(stateQs),
    };

    return `${oAuth2Config.authorizationUri}?${qs.stringify(authQuery)}`;
  }
}
