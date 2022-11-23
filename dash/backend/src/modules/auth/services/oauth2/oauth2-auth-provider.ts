import { AxiosRequestConfig } from 'axios';
import { IOAuth } from '../interfaces/IOAuth';
import { AuthConfiguration } from '../../models/auth-configuration';

export abstract class Oauth2AuthProvider implements IOAuth {

  _authConfiguration: AuthConfiguration;

  setAuthConfiguration(authConfiguration: AuthConfiguration) {
    this._authConfiguration = authConfiguration;
    return this;
  }

  getAuthorizationUrl(): string {
    throw new Error('Not implemented yet.');
  }

  getOAuthUserData(accessCode: string) {
    throw new Error('Not implemented yet.');
  }

  getOauthAccessToken(url: string, data) {
    throw new Error('Not implemented yet.');
  }

  getOauthProfile(url: string, config: AxiosRequestConfig) {
    throw new Error('Not implemented yet.');
  }

}
