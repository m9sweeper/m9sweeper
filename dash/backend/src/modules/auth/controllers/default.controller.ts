import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Inject,
    Options,
    Post,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {ExternalAuthConfigService} from '../services/external-auth-config.service';
import {AuthConfiguration, LDAPAuthStrategyConfig} from '../models/auth-configuration';
import {AuthGuard} from '../../../guards/auth.guard';
import {UserAuthority, UserProfileDto} from '../../user/dto/user-profile-dto';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {
    AUTH_CHECK_LOGIN_STATUS_RESPONSE_SCHEMA,
    AUTH_VALIDATE_RESPONSE_SCHEMA,
    AUTHORITY_LIST_RESPONSE_SCHEMA,
    AVAILABLE_AUTH_PROVIDER_RESPONSE_SCHEMA,
    CHANGE_PASSWORD_RESPONSE_SCHEMA
} from "../open-api-schema/authentication-meta-schema";
import { ConfigService } from '@nestjs/config';
import {ActivateUserAccountDto} from '../dto/activate-user-account-dto';
import {ResetPasswordService} from '../services/reset-password.service';
import {PreResetPasswordDto} from '../dto/pre-reset-password-dto';
import {UserProfileService} from '../../user/services/user-profile.service';
import {ChangePasswordDto} from '../dto/change-password-dto';
import * as bcrypt from 'bcryptjs';
import {AllowedAuthorityLevels} from '../../../decorators/allowed-authority-levels.decorator';
import {Authority} from '../../user/enum/Authority';
import {AuthorityGuard} from '../../../guards/authority.guard';
import {AuthenticationType} from '../enum/AuthenticationType';
import {isNil} from '@nestjs/common/utils/shared.utils';

@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class DefaultController {

    constructor(private readonly externalAuthConfigService: ExternalAuthConfigService,
                private readonly configService: ConfigService,
                private readonly resetPasswordService: ResetPasswordService,
                private readonly userProfileService: UserProfileService,
                @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto){}

    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @Options('validate')
    @ApiTags('Authentication Meta')
    @ApiBearerAuth('jwt-auth')
    @ApiResponse({
        status: 201,
        schema: AUTH_VALIDATE_RESPONSE_SCHEMA
    })
    async authValidateAction(): Promise<null> {
        return null;
    }

    @Get('check-status')
    @ApiTags('Authentication Meta')
    @ApiBearerAuth('jwt-auth')
    @ApiResponse({
        status: 201,
        schema: AUTH_CHECK_LOGIN_STATUS_RESPONSE_SCHEMA
    })
    async checkAuthValidity(): Promise<{loggedIn: boolean}> {
        return {
            loggedIn: !!this._loggedInUser,
        };
    }

    @Get('available-providers')
    @ApiTags('Authentication Meta')
    @ApiResponse({
        status: 201,
        schema: AVAILABLE_AUTH_PROVIDER_RESPONSE_SCHEMA
    })
    async availableProvidersAction(): Promise<{id: number,
        label: string,
        type: string,
        inSiteCredential:boolean,
        redirectable: boolean,
        requestHandlerPath: string}[]> {
        const providers: AuthConfiguration[] = await this.externalAuthConfigService.loadAll();

        return !providers ? [] : providers.map(p => {
            let requestHandlerPath = '';
            if (p.authType === AuthenticationType.LOCAL) {
                requestHandlerPath = '/auth/non-redirectable-login/local';
            } else if (p.authType === AuthenticationType.LDAP) {
                requestHandlerPath = (<LDAPAuthStrategyConfig>p.authConfig).redirectUri + '/' + p.id;
            } else if (p.authType === AuthenticationType.OAUTH2) {
                requestHandlerPath = `${this.configService.get('server.baseUrl')}/auth/redirectable-login/oauth2/${p.id}`;
            }
            return {
                id: p.id,
                label: p.authName,
                type: p.authType,
                inSiteCredential: p.inSiteCredential,
                redirectable: p.isRedirectable,
                requestHandlerPath: requestHandlerPath
            };
        });
    }

    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @Get('authorities')
    @ApiTags('Authentication')
    @ApiBearerAuth('jwt-auth')
    @ApiResponse({
        status: 201,
        schema: AUTHORITY_LIST_RESPONSE_SCHEMA
    })
    async listAuthorities(): Promise<UserAuthority[]> {
        return (await this.userProfileService.getAuthorities()).filter(a => {
           return this._loggedInUser.authorities.some(cua => cua.type === Authority.SUPER_ADMIN)
               || (this._loggedInUser.authorities.some(cua => cua.type === Authority.ADMIN && a.type !== Authority.SUPER_ADMIN));
        });
    }

    @UseGuards(AuthGuard)
    @Post('account/change-password')
    @ApiTags('Authentication')
    @ApiBearerAuth('jwt-auth')
    @ApiResponse({
        status: 201,
        schema: CHANGE_PASSWORD_RESPONSE_SCHEMA
    })
    async changeAccountPassword(@Body() changePasswordDto: ChangePasswordDto): Promise<boolean> {
        const userProfiles: UserProfileDto[] = await this.userProfileService.loadUserById(this._loggedInUser.id, true);
        if (userProfiles.length > 0) {
            const expectedUserProfile: UserProfileDto = userProfiles.pop();
            if (expectedUserProfile
                && expectedUserProfile.sourceSystem.type === AuthenticationType.LOCAL
                && bcrypt.compareSync(changePasswordDto.currentPassword, expectedUserProfile.password)
                && (!expectedUserProfile.deletedAt || (expectedUserProfile.deletedAt && expectedUserProfile.deletedAt === 0))) {
                return await this.resetPasswordService.changeUserAccountPassword(changePasswordDto.password, expectedUserProfile.id);
            }
        }
        throw new BadRequestException('Invalid user account to change password');
    }

    @Post('account/reset-password')
    @ApiTags('Authentication')
    @ApiResponse({
        status: 201,
        schema: CHANGE_PASSWORD_RESPONSE_SCHEMA
    })
    async prePasswordResetRequest(@Body() preResetPasswordDto: PreResetPasswordDto): Promise<boolean> {
        const userProfiles: UserProfileDto[] = await this.userProfileService.loadUserByEmail(preResetPasswordDto.email);
        if (!isNil(userProfiles) && userProfiles?.length) {
            const expectedUserProfile: UserProfileDto = userProfiles.pop();
            if (expectedUserProfile && expectedUserProfile.sourceSystem.type === AuthenticationType.LOCAL && (!expectedUserProfile.deletedAt || (expectedUserProfile.deletedAt && expectedUserProfile.deletedAt === 0))) {
                await this.resetPasswordService.save(expectedUserProfile, 'RESET_PASSWORD');
                return true;
            }
        }
        // throw new BadRequestException('Invalid user account');
        return false;
    }

    @Post(['account/activate-user', 'account/reset-password/post'])
    @ApiTags('Authentication')
    @ApiResponse({
        status: 201,
        schema: CHANGE_PASSWORD_RESPONSE_SCHEMA
    })
    async activateUserAccount(@Body() activateUserAccountDto: ActivateUserAccountDto): Promise<boolean> {
        //@todo: need to work on error logger
        try {
            const {userId, token} = JSON.parse(Buffer.from(activateUserAccountDto.token, 'base64').toString('ascii'));
            if (await this.resetPasswordService.doReset(token, userId, activateUserAccountDto.password)) {
                return true;
            }
        } catch (e) {
            console.log(e);
        }
        throw new BadRequestException('Token invalid or already expired');
    }

}
