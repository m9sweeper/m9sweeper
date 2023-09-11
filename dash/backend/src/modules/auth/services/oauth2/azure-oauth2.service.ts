import {ForbiddenException, Injectable, Scope} from '@nestjs/common';
import { HttpService } from "@nestjs/axios";
import { AxiosRequestConfig } from 'axios';
import * as qs from 'qs';
import { Oauth2AuthProvider } from './oauth2-auth-provider';
import { ConfigService } from '@nestjs/config';
import { OAuth2AuthStrategyConfig } from '../../models/auth-configuration';
import { SourceSystem, UserAuthority, UserProfileDto } from '../../../user/dto/user-profile-dto';
import {lastValueFrom} from 'rxjs';
import {AuthorityId} from '../../../user/enum/authority-id';
import {UserProfileService} from '../../../user/services/user-profile.service';
import {DirectoryGroup} from '../interfaces/Azure/directory-group';

@Injectable({scope: Scope.REQUEST})
export class AzureOauth2Service extends Oauth2AuthProvider {

  constructor(private readonly httpClient: HttpService,
              protected readonly configService: ConfigService,
              private readonly userProfileService: UserProfileService,
              ){
    super();
  }

  async getOAuthUserData(accessToken: string): Promise<UserProfileDto> {
    const oAuth2Config = <OAuth2AuthStrategyConfig> this._authConfiguration.authConfig;
    const oAuthUserProfile = await this.getOauthProfile('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const userEmail = oAuthUserProfile.data?.userPrincipalName;
    const emailDomain = userEmail.split('@').pop().toLowerCase().trim();
    let user: UserProfileDto;
    if (!oAuth2Config.allowedDomains.includes(emailDomain)) {
      // Check that the email domain of the OAuth user is within the allowed list before anything else
      throw new ForbiddenException('Access Denied', 'User is not permitted to access this site');
    } else {
      // If user is in an allowed domain, check to see if they already exist, and if so return the existing user
      const users: UserProfileDto[] = await this.userProfileService.loadUserByEmail(userEmail);
      if (users && Array.isArray(users) && users.length > 0) {
        if (!users[0].isActive) {
          throw new Error('This user is not active.');
        } else {
          user = users[0];
        }
      } else {
        // If the OAuth user is valid and does not yet exist, create a new user to return
        const userProfile = new UserProfileDto();
        userProfile.firstName = oAuthUserProfile.data?.givenName;
        userProfile.lastName = oAuthUserProfile.data?.surname;
        userProfile.email = oAuthUserProfile.data?.userPrincipalName;
        userProfile.phone = '';
        const userSourceSystem = new SourceSystem();
        userSourceSystem.id = this._authConfiguration.id.toString();
        userSourceSystem.uid = oAuthUserProfile.data?.id;
        userSourceSystem.type = this._authConfiguration.authType;
        userProfile.sourceSystem = userSourceSystem;

        userProfile.authorities = [];

        // Set the default authority for new OAuth users to read only
        const userAuthority = new UserAuthority();
        userAuthority.id = AuthorityId.READ_ONLY;
        userProfile.authorities.push(userAuthority);

        user = await this.userProfileService.createUser(userProfile);
      }

      // @TODO map
      // const groups = await this.getAdGroups(accessToken);

      return user;
    }
  }

  async getOauthAccessToken(url: string, data): Promise<any> {
    return lastValueFrom(this.httpClient.post(url, qs.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    }));
  }

  getOauthProfile(url: string, config: AxiosRequestConfig): Promise<any> {
    return lastValueFrom(this.httpClient.get(url, config));
  }

  getAuthorizationUrl(): string {
    const oAuth2Config = <OAuth2AuthStrategyConfig>this._authConfiguration.authConfig;

    const authQuery = {
      client_id: oAuth2Config.clientId,
      response_type: 'id_token token',
      redirect_uri: this.configService.get('server.baseUrl') + oAuth2Config.redirectUri,
      response_mode: 'form_post',
      scope: oAuth2Config?.scopes.join(' '),
      state: JSON.stringify({id: this._authConfiguration.id}),
      nonce: (new Date()).valueOf()
    }

    return `${oAuth2Config.authorizationUri}?${qs.stringify(authQuery)}`;
  }

  async getAdGroups(token: string): Promise<DirectoryGroup[]> {
    return this.getOauthProfile('https://graph.microsoft.com/v1.0/me/memberOf', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(resp => resp?.data?.value);
  }
}
