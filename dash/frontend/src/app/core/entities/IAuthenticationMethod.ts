import {AuthenticationType} from '../enum/AuthenticationType';

export interface IAuthenticationMethod {
  id: number;
  type: AuthenticationType;
  label: string;
  redirectable: boolean;
  requestHandlerPath: string;
  inSiteCredential: boolean;
}
