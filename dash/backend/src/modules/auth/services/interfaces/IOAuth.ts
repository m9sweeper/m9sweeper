import { AxiosRequestConfig } from 'axios';
import { AuthConfiguration } from '../../models/auth-configuration';

export interface IOAuth {
  setAuthConfiguration(authConfiguration: AuthConfiguration);
  getAuthorizationUrl();
  getOAuthUserData(accessCode: string);
  getOauthAccessToken(url: string, data);
  getOauthProfile(url: string, config: AxiosRequestConfig);
}
