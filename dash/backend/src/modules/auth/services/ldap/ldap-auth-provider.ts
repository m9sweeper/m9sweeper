import { AuthConfiguration } from '../../models/auth-configuration';
import {ILDAP} from '../interfaces/ILDAP';
import { MineLoggerService } from '../../../shared/services/mine-logger.service';

export abstract class LdapAuthProvider implements ILDAP {

  _authConfiguration: AuthConfiguration;

  constructor(
    protected logger: MineLoggerService,
  ) {}

  setAuthConfiguration(authConfiguration: AuthConfiguration) {
    this._authConfiguration = authConfiguration;
    return this;
  }

  getUserProfileData(userName: string, password: string) {
    throw new Error('Not implemented yet');
  }

}
