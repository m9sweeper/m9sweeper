import {ForbiddenException, Injectable, Scope} from '@nestjs/common';
import { HttpService } from "@nestjs/axios";
import { AxiosRequestConfig } from 'axios';
import * as qs from 'qs';
import { Oauth2AuthProvider } from './oauth2-auth-provider';
import { ConfigService } from '@nestjs/config';
import { OAuth2AuthStrategyConfig } from '../../models/auth-configuration';
import { SourceSystem, UserAuthority, UserProfileDto } from '../../../user/dto/user-profile-dto';
import {AuthorityId} from '../../../user/enum/authority-id';
import {UserProfileService} from '../../../user/services/user-profile.service';

@Injectable({scope: Scope.REQUEST})
export class GoogleOauth2Service extends Oauth2AuthProvider {

  constructor(private readonly httpClient: HttpService,
              protected readonly configService: ConfigService,
              private readonly userProfileService: UserProfileService,
              ){
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
    const userEmail = oAuthUserProfile.data?.email;
    const emailDomain = userEmail.split('@').pop().toLowerCase().trim();
    if (!oAuth2Config.allowedDomains.includes(emailDomain)) {
      // Check that the email domain of the OAuth user is within the allowed list before anything else
      throw new ForbiddenException('Access Denied', 'User is not permitted to access this site');
    } else {
      // If user is in an allowed domain, check to see if they already exist, and if so return the existing user
      const users: UserProfileDto[] = await this.userProfileService.loadUserByEmail(userEmail);
      if(users && Array.isArray(users) && users.length > 0) {
        if (!users[0].isActive) {
          throw new Error('This user is not active.');
        } else {
          return users[0];
        }
      } else {
        // If the OAuth user is valid and does not yet exist, create a new user to return
        const userProfile = new UserProfileDto();
        userProfile.firstName = oAuthUserProfile.data?.given_name;
        userProfile.lastName = oAuthUserProfile.data?.family_name;
        userProfile.email = userEmail;
        userProfile.phone = '';
        const userSourceSystem = new SourceSystem();
        userSourceSystem.id = this._authConfiguration.id.toString();
        userSourceSystem.uid = oAuthUserProfile.data?.sub;
        userSourceSystem.type = this._authConfiguration.authType;
        userProfile.sourceSystem = userSourceSystem;

        userProfile.authorities = [];

        // Set the default authority for new OAuth users to read only
        const userAuthority = new UserAuthority();
        userAuthority.id = AuthorityId.READ_ONLY;
        userProfile.authorities.push(userAuthority);

        return await this.userProfileService.createUser(userProfile);
      }
    }
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
