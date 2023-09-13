import { Type } from 'class-transformer';
import { AuthenticationType } from '../enum/AuthenticationType';
import {ProviderType} from "../enum/ProviderType";
import {AuthorityId} from '../../user/enum/authority-id';

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

export class AzureAuthStrategyConfig extends OAuth2AuthStrategyConfig {
  /**
   *  Users not belonging to any groups will receive this authority.
   *  If not set, will be treated as if it was READ_ONLY
   *  */
  defaultUserAuthorityId: AuthorityId;
  /**
   * mapping of Azure Active Directory Groups to authority levels
   * users should receive the highest applicable authorityId from the groups they're in
   * or the default if they are in none.
   * */
  groupAuthorities?: {
    groupId: string;
    authorityId: AuthorityId;
  }[];

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

export class AuthConfiguration<T = OAuth2AuthStrategyConfig | LDAPAuthStrategyConfig> {
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
  authConfig:       T;
  isRedirectable:   boolean;
  inSiteCredential: boolean;
  isActive:         boolean;
}
