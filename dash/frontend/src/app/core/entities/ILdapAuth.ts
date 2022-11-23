export interface ILdapAuth {
  url: string;
  userDN: string;
  userSearchBase: string;
  usernameAttribute: string;
  redirectUri: string;
}
