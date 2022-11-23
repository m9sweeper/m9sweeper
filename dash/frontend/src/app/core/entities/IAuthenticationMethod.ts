import {AuthenticationType} from '../enum/AuthenticationType';

export interface IAuthenticationMethod {
  id: string;
  type: AuthenticationType;
  label: string;
  redirectable: boolean;
  requestHandlerPath: string;
  inSiteCredential: boolean;
}
