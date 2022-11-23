import { Expose, Type} from 'class-transformer';
import {IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateNested} from 'class-validator';
import { AuthenticationType } from '../enum/AuthenticationType';
import {ApiProperty} from '@nestjs/swagger';

export abstract class AuthStrategyConfigDTO {
}

export class OAuth2AuthStrategyConfigDTO extends AuthStrategyConfigDTO {

    @IsNotEmpty()
    @IsString()
    clientId:         string;

    @IsNotEmpty()
    @IsString()
    clientSecret:     string;

    @IsNotEmpty()
    @IsUrl()
    accessTokenUri:   string;

    @IsNotEmpty()
    @IsUrl()
    authorizationUri: string;

    @IsOptional()
    @IsString()
    redirectUri:      string;

    @IsNotEmpty()
    @IsString({each: true})
    scopes:           string[];
}

export class LDAPAuthStrategyConfigDTO extends AuthStrategyConfigDTO {
    @IsNotEmpty()
    @IsString()
    url:                string;

    @IsNotEmpty()
    @IsString()
    userSearchBase:     string;

    @IsNotEmpty()
    @IsString()
    usernameAttribute:  string;

    @IsOptional()
    @IsString()
    redirectUri:        string;

    @IsString()
    @IsNotEmpty()
    adminDn: string;

    @IsString()
    adminPassword: string;

    @IsNumber()
    defaultUserAuthority: number;

    @IsString()
    @IsOptional()
    groupSearchBase?: string;

    @IsString()
    @IsOptional()
    groupClass?: string;

    @IsString()
    @IsOptional()
    groupMemberAttribute?: string;

    @IsString()
    @IsOptional()
    groupMemberUserAttribute?: string;

    @IsString()
    @IsOptional()
    groupAuthLevelAttribute?: string;

    @IsOptional()
    groupAuthLevelMapping?: {
        viewOnly: string;
        admin: string;
        superAdmin: string;
    };
}

export class AuthConfigurationDTO {

    @IsNotEmpty()
    @Expose({name: 'auth_name', toPlainOnly: true})
    @ApiProperty({name: 'authName'})
    authName:         string;

    @IsEnum(AuthenticationType, {message: 'Invalid Authentication Type'})
    @Expose({name: 'auth_type', toPlainOnly: true})
    @ApiProperty({name: 'authType'})
    authType:         AuthenticationType;

    @IsNotEmpty()
    @Expose({name: 'provider_type', toPlainOnly: true})
    @ApiProperty({name: 'provierType'})
    providerType:     string;

    @IsNotEmpty()
    @ValidateNested()
    @Type((ops) => ops.object['authType'] === AuthenticationType.OAUTH2 ? OAuth2AuthStrategyConfigDTO : (ops.object['authType'] === AuthenticationType.LDAP ? LDAPAuthStrategyConfigDTO : undefined))
    @Expose({name: 'auth_strategy_config', toPlainOnly: true})
    @ApiProperty({name: 'authConfig'})
    authConfig:       OAuth2AuthStrategyConfigDTO | LDAPAuthStrategyConfigDTO;

    @IsNotEmpty()
    @IsBoolean()
    @Expose({name: 'redirectable', toPlainOnly: true})
    @ApiProperty({name: 'isRedirectable'})
    isRedirectable:   boolean;

    @IsNotEmpty()
    @IsBoolean()
    @Expose({name: 'in_site_credential', toPlainOnly: true})
    @ApiProperty({name: 'inSiteCredential'})
    inSiteCredential: boolean;

    @IsNotEmpty()
    @IsBoolean()
    @Expose({name: 'active', toPlainOnly: true})
    @ApiProperty({name: 'isActive'})
    isActive:         boolean;
}
