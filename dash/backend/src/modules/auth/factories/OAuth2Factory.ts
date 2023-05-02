import {Injectable} from '@nestjs/common';
import {IOAuth} from '../services/interfaces/IOAuth';
import {AuthConfiguration} from '../models/auth-configuration';
import {GoogleOauth2Service} from '../services/oauth2/google-oauth2.service';
import {AzureOauth2Service} from "../services/oauth2/azure-oauth2.service";
import {ProviderType} from "../enum/ProviderType";

@Injectable()
export class OAuth2Factory {

  constructor(private readonly googleOauth2Service: GoogleOauth2Service,
              private readonly azureOauth2Service: AzureOauth2Service) {

  }

  public getInstance(authConfiguration: AuthConfiguration): IOAuth {
    if (authConfiguration.providerType === ProviderType.GOOGLE) {
      return this.googleOauth2Service.setAuthConfiguration(authConfiguration);
    } else if (authConfiguration.providerType === ProviderType.AZURE) {
      return this.azureOauth2Service.setAuthConfiguration(authConfiguration);
    }
    return null;
  }

}
