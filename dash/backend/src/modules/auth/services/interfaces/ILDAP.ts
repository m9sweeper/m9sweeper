import { AuthConfiguration } from '../../models/auth-configuration';

export interface ILDAP {
  setAuthConfiguration(authConfiguration: AuthConfiguration);
  getUserProfileData(userName: string, password: string);
}
