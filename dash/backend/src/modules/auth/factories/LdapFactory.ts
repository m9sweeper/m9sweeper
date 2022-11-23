import { Injectable } from '@nestjs/common';
import { AuthConfiguration } from '../models/auth-configuration';
import {GenericLdapService} from '../services/ldap/generic-ldap.service';

@Injectable()
export class LdapFactory {

  constructor(private readonly genericLdapService: GenericLdapService) {

  }

  public getInstance(authConfiguration: AuthConfiguration) {
    if (authConfiguration.providerType === 'GENERIC_LDAP_PROVIDER') {
      return this.genericLdapService.setAuthConfiguration(authConfiguration);
    }
    return null;
  }

}
