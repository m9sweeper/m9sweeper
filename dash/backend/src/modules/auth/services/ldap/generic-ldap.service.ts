import {ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException} from '@nestjs/common';
import {LdapAuthProvider} from './ldap-auth-provider';
import {LDAPAuthStrategyConfig} from '../../models/auth-configuration';
import {SourceSystem, UserAuthority, UserProfileDto} from '../../../user/dto/user-profile-dto';
import * as ldap from 'ldapjs';
import {AuthorityId} from '../../../user/enum/authority-id';

@Injectable()
export class GenericLdapService extends LdapAuthProvider {

    async getUserProfileData(userName: string, password: string): Promise<any> {

        const ldapConf: LDAPAuthStrategyConfig = <LDAPAuthStrategyConfig> this._authConfiguration.authConfig;

        const options = {
            ldapOpts: {
                url: ldapConf.url,
            },
            username: userName,
            userPassword: password,
            userSearchBase: ldapConf.userSearchBase,
            usernameAttribute: ldapConf.usernameAttribute,
            adminDn: ldapConf.adminDn,
            adminPassword: ldapConf.adminPassword,
            groupsSearchBase: ldapConf.groupSearchBase,
            groupClass: ldapConf.groupClass,
            groupMemberAttribute: ldapConf.groupMemberAttribute,
            groupMemberUserAttribute: ldapConf.groupMemberUserAttribute,
            attributes: [
                'givenName',
                'sn',
                'mail',
                'telephoneNumber',
                'mobile',
                'homePhone',
                'uid'
            ],
            starttls: false,
        };

        try {
            const ldapUser = await this.getUserDetails(options);

            if (!ldapUser.givenName || !ldapUser.sn || !ldapUser.mail || !ldapUser.uid) {
                throw new InternalServerErrorException('Required attributes not present on fetched user');
            }

            /** Fields used here are based off the LDAP field mappings commonly used by Active Directory, as referenced
             *  in the following:
             *
             * https://activedirectorypro.com/ad-ldap-field-mapping/
             * https://productdocuments.mitel.com/doc_finder/UG/UCA_Web_Help/Admin_Web_Help/7.0/uca/common_ad_ldap_field_mappings.htm
             *
             * Customer-specific LDAP field overrides would be implemented here
             * */
            const userProfile = new UserProfileDto();
            userProfile.firstName = ldapUser.givenName;
            userProfile.lastName = ldapUser.sn;
            userProfile.email = ldapUser.mail;
            userProfile.phone = ldapUser.telephoneNumber ?? ldapUser.mobile ?? ldapUser.homePhone ?? '';

            const userSourceSystem = new SourceSystem();
            userSourceSystem.id = this._authConfiguration.id.toString();
            userSourceSystem.uid = ldapUser.uid;
            userSourceSystem.type = this._authConfiguration.authType;
            userProfile.sourceSystem = userSourceSystem;

            userProfile.authorities = [];
            ldapUser.groups.forEach(group => {
                const userAuthority = new UserAuthority();
                switch (group[ldapConf.groupAuthLevelAttribute]) {
                    case ldapConf.groupAuthLevelMapping.viewOnly:
                        userAuthority.id = AuthorityId.READ_ONLY;
                        userProfile.authorities.push(userAuthority);
                        break;
                    case ldapConf.groupAuthLevelMapping.admin:
                        userAuthority.id = AuthorityId.ADMIN;
                        userProfile.authorities.push(userAuthority);
                        break;
                    case ldapConf.groupAuthLevelMapping.superAdmin:
                        userAuthority.id = AuthorityId.SUPER_ADMIN;
                        userProfile.authorities.push(userAuthority);
                        break;
                }
            });
            if (userProfile.authorities.length === 0) {
                if (ldapConf.defaultUserAuthority > 0) {
                    const userAuthority = new UserAuthority();
                    userAuthority.id = ldapConf.defaultUserAuthority;
                    userProfile.authorities.push(userAuthority);
                } else {
                    throw new ForbiddenException('Access Denied', 'User has no m9sweeper authorities set');
                }
            }
            return userProfile;
        } catch (e) {
            this.logger.error({label: 'Error authenticating or in authorization for retrieval of user profile data'}, e, 'GenericLdapService.getUserProfileData')
            if (e instanceof ldap.InvalidCredentialsError) {
                throw new UnauthorizedException('Invalid Credentials', 'Username or password is incorrect');
            } else {
                throw e;
            }
        }
    }

    private async getUserDetails(options: {adminDn: string, adminPassword: string, userSearchBase: string,
                                 usernameAttribute: string, username: string, userPassword: string,
                                 ldapOpts?: {url: string}, groupsSearchBase?: string, groupClass?: string,
                                 groupMemberAttribute?: string, groupMemberUserAttribute?: string, attributes?: string[],
                                 starttls: boolean // placeholder for future TLS implementation
        }
    ) {
        let ldapClient;
        try {
            ldapClient = await this.getLdapConnection(options.adminDn, options.adminPassword,
                options?.starttls, options?.ldapOpts);
        } catch (error) {
            throw new InternalServerErrorException('LDAP Connection Error',
                'Error connecting to LDAP server: server credentials may be incorrectly configured');
        }
        const user: any = await this.ldapUserSearch(
            ldapClient,
            options.userSearchBase,
            options.usernameAttribute,
            options.username,
            options?.attributes
        );
        ldapClient.unbind();
        if (!user || !user.dn) {
            // If a user is not returned by the LDAP search, the provided username is not present on the system
            // Throw an invalid credentials error to keep username/password errors consistent
            throw new ldap.InvalidCredentialsError('Invalid Credentials');
        }
        const userDn = user.dn;
        // bind to the LDAP server as a user to ensure validity of user credentials
        let ldapUserClient;
        try {
            ldapUserClient = await this.getLdapConnection(userDn, options.userPassword,
                options?.starttls, options?.ldapOpts);
        } catch (e) {
            throw e;
        }
        ldapUserClient.unbind();
        if (options?.groupsSearchBase && options?.groupClass && options?.groupMemberAttribute) {
            try {
                ldapClient = await this.getLdapConnection(options.adminDn, options.adminPassword,
                    options?.starttls, options?.ldapOpts);
            } catch (e) {
                throw e;
            }
            const groups = await this.getUserGroups(ldapClient, options.groupsSearchBase, user, options.groupClass,
                options.groupMemberAttribute, options.groupMemberUserAttribute);
            user.groups = groups;
            ldapClient.unbind();
        }
        return user;
    }

    private async ldapUserSearch(ldapClient: ldap.Client, searchBase: string, usernameAttribute: string,
                                 username: string, attributes?: string[]) {
        return new Promise((resolve, reject) => {
            const filter = new ldap.EqualityFilter({
                attribute: usernameAttribute,
                value: username,
            });
            const searchOptions: ldap.SearchOptions = {
                filter: filter,
                scope: 'sub',
                attributes: attributes,
            };
            if (attributes) {
                searchOptions.attributes = attributes;
            }
            ldapClient.search(searchBase, searchOptions, function (err, res) {
                let user;
                if (err) {
                    reject(err);
                    ldapClient.unbind();
                    return;
                }
                res.on('searchEntry', function (entry) {
                    user = entry.object;
                });
                res.on('error', function (err) {
                    reject(err);
                    ldapClient.unbind();
                });
                res.on('end', function (result) {
                    if (result.status != 0) {
                        reject(new InternalServerErrorException('LDAP client returned nonzero response code'));
                    } else {
                        resolve(user);
                    }
                    ldapClient.unbind();
                });
            })
        })
    }

    private async getUserGroups(ldapClient: ldap.Client, searchBase: string, user: any, groupClass: string,
                                groupMemberAttribute = 'member', groupMemberUserAttribute = 'dn') {
        return new Promise((resolve, reject) => {
            ldapClient.search(
                searchBase,
                {
                    filter: `(&(objectclass=${groupClass})(${groupMemberAttribute}=${user[groupMemberUserAttribute]}))`,
                    scope: 'sub',
                },
                (err, res) => {
                    const groups = [];
                    if (err) {
                        reject(err);
                        ldapClient.unbind();
                        return;
                    }
                    res.on('searchEntry', function (entry) {
                        groups.push(entry.object);
                    });
                    res.on('error', function(error) {
                        reject(error);
                        ldapClient.unbind();
                    });
                    res.on('end', function(result) {
                        if (result.status !== 0) {
                            reject(new InternalServerErrorException('LDAP client returned nonzero response code'));
                        } else {
                            resolve(groups);
                        }
                        ldapClient.unbind();
                    });
                }
            )
        });
    }

    private async getLdapConnection(dn: string, password: string, starttls: boolean,
                                    ldapOptions: ldap.ClientOptions): Promise<ldap.Client> {
        return new Promise((resolve, reject) => {
            ldapOptions.connectTimeout = ldapOptions.connectTimeout || 5000;
            const client = ldap.createClient(ldapOptions);

            client.on('connect', () => {
                if (starttls) {
                    client.starttls(ldapOptions.tlsOptions, null, function (error) {
                        if (error) {
                            reject(error);
                            return;
                        } else {
                            client.bind(dn, password, function (err) {
                                if (err) {
                                    reject(err);
                                    client.unbind();
                                    return;
                                } else {
                                    resolve(client);
                                }
                            });
                        }
                    });
                } else {
                    client.bind(dn, password, (err) => {
                        if (err) {
                            reject(err);
                            client.unbind();
                            return;
                        } else {
                            resolve(client);
                        }
                    });
                }
            });

            client.on('timeout', (err) => {
                reject(err);
            });
            client.on('connectTimeout', (err) => {
                reject(err);
            });
            client.on('error', (err) => {
                reject(err);
            });

            client.on('connectError', (err) => {
                reject(err);
                return;
            });
        });
    }
}
