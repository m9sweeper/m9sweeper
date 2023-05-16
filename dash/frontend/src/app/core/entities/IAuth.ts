import {AuthenticationType} from '../enum/AuthenticationType';

export interface IAuth {
  accessToken: string;
}

export interface IAuthDecoded {
  user: IUser;
  issued: number;
  expires: number;
}

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  authorities: IAuthority[];
  sourceSystem: ISourceSystem;
}

export interface IAuthority {
  type: string;
}

export interface ISourceSystem {
  id: string;
  type: string;
  uid: string;
}

export interface IAuthConfig {
  id: number;
  authName: string;
  authType: AuthenticationType;
  providerType: string;
  authConfig: IOAUTHConfigStrategy | ILDAPConfigStrategy;
  isRedirectable: boolean;
  inSiteCredential: boolean;
  isActive: boolean;
}

export interface IOAUTHConfigStrategy {
  clientId: string;
  clientSecret?: string;
  accessTokenUri?: string;
  authorizationUri: string;
  redirectUri: string;
  scopes: string[];
}

export interface ILDAPConfigStrategy {
  url: string;
  userSearchBase: string;
  redirectUri: string;
  usernameAttribute: string;
  adminDn: string;
  adminPassword: string;
  defaultUserAuthority: number;
  groupSearchBase?: string;
  groupClass?: string;
  groupMemberAttribute?: string;
  groupMemberUserAttribute?: string;
  groupAuthLevelAttribute?: string;
  groupAuthLevelMapping?: {
    viewOnly: string;
    admin: string;
    superAdmin: string;
  };
}

