import { Injectable } from '@nestjs/common';
import { IOAuth } from '../services/interfaces/IOAuth';
import { AuthConfiguration } from '../models/auth-configuration';
import { GoogleOauth2Service } from '../services/oauth2/google-oauth2.service';

@Injectable()
export class OAuth2Factory {

  constructor(private readonly googleOauth2Service: GoogleOauth2Service) {

  }

  public getInstance(authConfiguration: AuthConfiguration): IOAuth {
    if (authConfiguration.providerType === 'GOOGLE') {
      return this.googleOauth2Service.setAuthConfiguration(authConfiguration);
    }
    return null;
  }

}
