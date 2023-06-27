import {
    Body,
    Controller,
    Param,
    Post,
    UnauthorizedException,
    UseInterceptors
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {ExternalAuthConfigService} from '../services/external-auth-config.service';
import {UserProfileService} from '../../user/services/user-profile.service';
import {JwtUtilityService} from '../services/jwt-utility.service';
import {LoginDto} from '../dto/login-dto';
import {UserProfileDto} from '../../user/dto/user-profile-dto';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {LdapFactory} from '../factories/LdapFactory';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import {LOCAL_AUTH_RESPONSE_SCHEMA} from '../open-api-schema/non-redirectable-auth';
import {MineLoggerService} from '../../shared/services/mine-logger.service';
import {AuthenticationType} from '../enum/AuthenticationType';
import {LoginCounterService} from '../services/PrometheusService';
import {AuditLogService} from '../../audit-log/services/audit-log.service';
import {AuditLogDto} from '../../audit-log/dto/audit-log.dto';
import common from "../../../config/common";

@ApiTags('Authentication')
@Controller('non-redirectable-login')
@UseInterceptors(ResponseTransformerInterceptor)
export class NonRedirectableLoginController {


    private readonly CONTEXT = NonRedirectableLoginController.name;

    constructor(
        private readonly externalAuthConfigService: ExternalAuthConfigService,
        private readonly ldapFactory: LdapFactory,
        private readonly userProfileService: UserProfileService,
        private readonly jwtUtility: JwtUtilityService,
        private readonly logger: MineLoggerService,
        private readonly loginCounterService: LoginCounterService,
        private readonly auditLogService: AuditLogService,
    ) {}


    @Post('ldap/:providerId')
    @ApiResponse({
        status: 201,
        schema: LOCAL_AUTH_RESPONSE_SCHEMA
    })
    async ldapAuthLoginAction(@Param('providerId') providerId: number, @Body() loginDto: LoginDto): Promise<any> {
        const authProviderConfig = await this.externalAuthConfigService.loadById(providerId);
        if (authProviderConfig) {
            const ldapAuthService = this.ldapFactory.getInstance(authProviderConfig);
            const externalUserData: UserProfileDto = await ldapAuthService.getUserProfileData(loginDto.userName, loginDto.userPassword);
            const users: UserProfileDto[] = await this.userProfileService.loadUserByEmail(externalUserData.email);
            let user: UserProfileDto;
            if (users) {
                user = users.pop();
                const externalAuthorities = externalUserData.authorities.map(authority => authority.id);
                const storedAuthorities = user.authorities.map(authority => authority.id);
                // LDAP authenticated users have a user entry in the m9sweeper database. On login, check to see if
                // any of the LDAP user fields have changed, and update the m9sweeper entry accordingly
                if (
                    externalUserData.firstName !== user.firstName || externalUserData.lastName !== user.lastName ||
                    externalUserData.email !== user.email || externalUserData.phone !== user.phone ||
                    externalUserData.authorities.length !== user.authorities.length ||
                    !externalAuthorities.every(authId => storedAuthorities.includes(authId))
                ) {
                    externalUserData.id = user.id;
                    user = (await this.userProfileService.updateUser(externalUserData))[0];
                }
            } else {
                user = await this.userProfileService.createUser(externalUserData);
            }
            // Delete the user's password for security. We should never return a password to the frontend.
            delete user.password;
            // Only log successful LDAP login attempts - the LDAP system being used should have its own method of
            // managing multiple failed logins, and we can't ensure whether a failed login was attempted on a
            // valid username or not
            const auditLog = new AuditLogDto();
            auditLog.entityType = 'Account';
            auditLog.eventType = 'Login';
            auditLog.type = 'AuditLog';
            auditLog.organizationId = 0;
            auditLog.entityId = user.id;
            auditLog.userId = user.id;
            auditLog.data = {message: 'User Login'};
            this.auditLogService.createAuditLog(auditLog).then()
                .catch((e) => console.log('Error saving audit log: ' + e));
            return {
                accessToken: await this.jwtUtility.getToken(JSON.stringify(user))
            };
        } else {
            throw new Error('Invalid Auth Provider');
        }
    }

    @Post('local')
    @ApiResponse({
        status: 201,
        schema: LOCAL_AUTH_RESPONSE_SCHEMA
    })
    async localAuthLoginAction(@Body() loginDto: LoginDto): Promise<any> {
        this.loginCounterService.counter.inc(1);
        const users: UserProfileDto[] = await this.userProfileService.loadUserByEmail(loginDto.userName);
        if (users && users.length > 0) {
            const user: UserProfileDto = users.pop();
            const auditLog = new AuditLogDto();
            auditLog.entityType = 'Account';
            auditLog.eventType = 'Login';
            auditLog.type = 'AuditLog';
            auditLog.entityId = user.id;
            auditLog.userId = user.id;
            auditLog.organizationId = 0;
            if (user.isActive) {
                if (user.sourceSystem.type === AuthenticationType.LOCAL &&
                    bcrypt.compareSync(loginDto.userPassword, user.password)
                    && (!user.deletedAt || (user.deletedAt && user.deletedAt === 0)))
                {
                    // Delete the user's password for security. We should never return a password to the frontend.
                    delete user.password;
                    auditLog.data = {message: 'User Login'};
                    this.auditLogService.createAuditLog(auditLog).then()
                        .catch((e) => console.log('Error saving audit log: ' + e));
                    return {
                        accessToken: await this.jwtUtility.getToken(JSON.stringify(user))
                    };
                }
                // User exists, but login failed due to credential mismatch or user being deleted. Log it as a
                // failed login attempt
                auditLog.data = {error: 'Failed Login: Invalid Credentials'};
                this.auditLogService.createAuditLog(auditLog).then()
                    .catch((e) => console.log('Error saving audit log: ' + e));

                // find out how many failed attempts within the hour from the current user
                const failAttemptInTheLastHour = await this.userProfileService.getUserFailedAttemptCountInLastHour(user.id);
                console.log("failAttemptInTheLastHour: ", failAttemptInTheLastHour);
                // if exceed failed attempt limit, the user cannot log in
                if (failAttemptInTheLastHour >= common.loginAttemptAllowed){
                    throw new UnauthorizedException('Log in attempts exceed limit. Please try again later.');
                }

            } else {
                throw new UnauthorizedException('User is not active');
            }
        }
        throw new UnauthorizedException('Invalid auth credential');
    }
}
