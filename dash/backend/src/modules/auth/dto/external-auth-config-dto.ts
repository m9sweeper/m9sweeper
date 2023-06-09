import { Expose, Type} from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsLowercase,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    ValidateNested
} from 'class-validator';
import { AuthenticationType } from '../enum/AuthenticationType';
import {ApiProperty} from '@nestjs/swagger';
import {ProviderType} from "../enum/ProviderType";

export abstract class AuthStrategyConfigDTO {
}

export class AzureOAuth2AuthStrategyConfigDTO extends AuthStrategyConfigDTO {

    @IsNotEmpty()
    @IsString()
    clientId:         string;

    @IsNotEmpty()
    @IsUrl()
    authorizationUri: string;

    @IsOptional()
    @IsString()
    redirectUri:      string;

    @IsNotEmpty()
    @IsString({each: true})
    @IsLowercase({each: true})
    scopes:           string[];

    @IsNotEmpty()
    @IsString({each: true})
    @IsLowercase({each: true})
    allowedDomains: string[];
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
    @IsLowercase({each: true})
    scopes:           string[];

    @IsNotEmpty()
    @IsString({each: true})
    @IsLowercase({each: true})
    allowedDomains: string[];
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
    providerType:     ProviderType;

    @IsNotEmpty()
    @ValidateNested()
    @Type((ops) => {
        if (ops.object['authType'] === AuthenticationType.OAUTH2) {
            if (ops.object['providerType'] === ProviderType.GOOGLE) {
                return OAuth2AuthStrategyConfigDTO;
            } else if (ops.object['providerType'] === ProviderType.AZURE) {
                return AzureOAuth2AuthStrategyConfigDTO;
            }
        } else if (ops.object['authType'] === AuthenticationType.LDAP) {
            return LDAPAuthStrategyConfigDTO;
        }
    })
    @Expose({name: 'auth_strategy_config', toPlainOnly: true})
    @ApiProperty({name: 'authConfig'})
    authConfig:       AzureOAuth2AuthStrategyConfigDTO | OAuth2AuthStrategyConfigDTO | LDAPAuthStrategyConfigDTO;

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
