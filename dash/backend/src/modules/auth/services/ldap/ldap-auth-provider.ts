import { AuthConfiguration } from '../../models/auth-configuration';
import {ILDAP} from '../interfaces/ILDAP';

export abstract class LdapAuthProvider implements ILDAP {

  _authConfiguration: AuthConfiguration;

  setAuthConfiguration(authConfiguration: AuthConfiguration) {
    this._authConfiguration = authConfiguration;
    return this;
  }

  getUserProfileData(userName: string, password: string) {
    throw new Error('Not implemented yet');
  }

}
