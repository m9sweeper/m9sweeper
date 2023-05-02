import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { RedirectableLoginController } from './controllers/redirectable-login.controller';
import { GoogleOauth2Service } from './services/oauth2/google-oauth2.service';
import { ExternalAuthConfigService } from './services/external-auth-config.service';
import { OAuth2Factory } from './factories/OAuth2Factory';
import { JwtUtilityService } from './services/jwt-utility.service';
import { JwtModule } from '@nestjs/jwt';
import { DefaultController } from './controllers/default.controller';
import { NonRedirectableLoginController } from './controllers/non-redirectable-login.controller';
import { GenericLdapService } from './services/ldap/generic-ldap.service';
import {LdapFactory} from './factories/LdapFactory';
import LoggedInUserFactory from '../../providers/LoggedInUserFactory';
import {ResetPasswordService} from './services/reset-password.service';
import {ResetPasswordDao} from './dao/reset-password.dao';
import {
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { LoginCounterService } from './services/PrometheusService';
import {ExternalAuthConfController} from './controllers/external-auth-conf.controller';
import { ConfigService } from '@nestjs/config';
import {AuthService} from './services/auth.service'
import {AzureOauth2Service} from "./services/oauth2/azure-oauth2.service";

@Global()
@Module({
  controllers: [
    DefaultController,
    ExternalAuthConfController,
    RedirectableLoginController,
    NonRedirectableLoginController
  ],
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('security.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [
    JwtUtilityService,
    'LOGGED_IN_USER',
    ResetPasswordService,
    ResetPasswordDao,
    AuthService,
  ],
  providers: [
    LoggedInUserFactory,
    GoogleOauth2Service,
    AzureOauth2Service,
    ExternalAuthConfigService,
    OAuth2Factory,
    JwtUtilityService,
    LdapFactory,
    GenericLdapService,
    ResetPasswordDao,
    ResetPasswordService,
    LoginCounterService,
    AuthService,
    makeCounterProvider({
      name: "login_counter",
      help: "metric_help",
    })
  ]
})
export class AuthModule {}
