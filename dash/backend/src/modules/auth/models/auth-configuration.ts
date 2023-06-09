import { Type } from 'class-transformer';
import { AuthenticationType } from '../enum/AuthenticationType';
import {ProviderType} from "../enum/ProviderType";

export class AuthStrategyConfig {

}

export class OAuth2AuthStrategyConfig extends AuthStrategyConfig{
  clientId:         string;
  clientSecret:     string;
  accessTokenUri:   string;
  authorizationUri: string;
  redirectUri:      string;
  scopes:           string[];
  allowedDomains:   string[];
}

export class LDAPAuthStrategyConfig extends AuthStrategyConfig{
  url:                string;
  userSearchBase:     string;
  usernameAttribute:  string;
  redirectUri:        string;
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

export class AuthConfiguration {
  id:               number;
  authName:         string;
  authType:         AuthenticationType;
  providerType:     ProviderType;
  @Type(() => AuthStrategyConfig, {
    discriminator: {
      property: "authType",
      subTypes: [
        { value: OAuth2AuthStrategyConfig, name: "OAUTH2" },
        { value: LDAPAuthStrategyConfig, name: "LDAP" }
      ]
    }
  })
  authConfig:       OAuth2AuthStrategyConfig | LDAPAuthStrategyConfig;
  isRedirectable:   boolean;
  inSiteCredential: boolean;
  isActive:         boolean;
}
