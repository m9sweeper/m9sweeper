import {Body, Controller, Get, Inject, Param, Post, Put, Query, UseGuards, UseInterceptors} from '@nestjs/common';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {AllowedAuthorityLevels} from '../../../decorators/allowed-authority-levels.decorator';
import {Authority} from '../../user/enum/Authority';
import {AuthGuard} from '../../../guards/auth.guard';
import {AuthorityGuard} from '../../../guards/authority.guard';
import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {AuthConfigurationDTO} from '../dto/external-auth-config-dto';
import {UserProfileDto} from '../../user/dto/user-profile-dto';
import {ExternalAuthConfigService} from '../services/external-auth-config.service';
import {AuthenticationType} from '../enum/AuthenticationType';
import { UPDATE_AUTH_RESPONSE_SCHEMA, LIST_AUTH_PROVIDER_RESPONSE_SCHEMA } from '../open-api-schema/non-redirectable-auth';

@UseGuards(AuthGuard, AuthorityGuard)
@Controller('sign-on-method')
@UseInterceptors(ResponseTransformerInterceptor)
export class ExternalAuthConfController {

    constructor(private readonly externalAuthConfigService: ExternalAuthConfigService,
                @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto){}

    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @Get('providers')
    @ApiTags('Sign on method')
    @ApiBearerAuth('jwt-auth')
    @ApiResponse({
        status: 201,
        schema: LIST_AUTH_PROVIDER_RESPONSE_SCHEMA
    })
    async getProviderList(): Promise<AuthConfigurationDTO[]> {
        return await this.externalAuthConfigService.loadProviderList();
    }

    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @Post('providers')
    @ApiTags('Sign on method')
    @ApiBearerAuth('jwt-auth')
    @ApiResponse({
        status: 201,
        schema: LIST_AUTH_PROVIDER_RESPONSE_SCHEMA
    })
    async createExternalAuth(@Body() authConfigurationDTO: AuthConfigurationDTO ): Promise<AuthConfigurationDTO> {
        if (authConfigurationDTO.authType === AuthenticationType.OAUTH2) {
            authConfigurationDTO.authConfig.redirectUri = '/auth/redirectable-login/oauth2-callback';
        } else if (authConfigurationDTO.authType === AuthenticationType.LDAP) {
            authConfigurationDTO.authConfig.redirectUri = '/auth/non-redirectable-login/ldap';
        }
        const authConfigId = await this.externalAuthConfigService.createExternalAuth(authConfigurationDTO);
        return await this.externalAuthConfigService.loadById(+authConfigId);
    }

    @AllowedAuthorityLevels(Authority.SUPER_ADMIN)
    @Put('providers/:authId')
    @ApiTags('Sign on method')
    @ApiBearerAuth('jwt-auth')
    @ApiResponse({
        status: 201,
        schema: UPDATE_AUTH_RESPONSE_SCHEMA
    })
    async updateExternalAuth(@Body() authConfigurationDTO: AuthConfigurationDTO, @Param('authId') authId: number): Promise<boolean> {
        if (authConfigurationDTO.authType === AuthenticationType.OAUTH2) {
            authConfigurationDTO.authConfig.redirectUri = '/auth/redirectable-login/oauth2-callback';
        } else if (authConfigurationDTO.authType === AuthenticationType.LDAP) {
            authConfigurationDTO.authConfig.redirectUri = '/auth/non-redirectable-login/ldap';
        }
        return await this.externalAuthConfigService.updateExternalAuth(authConfigurationDTO, authId);
    }
}
