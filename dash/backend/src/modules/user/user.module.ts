import { Global, Module } from '@nestjs/common';
import { UserDao } from './dao/user.dao';
import { UserProfileService } from './services/user-profile.service';
import { UserController } from './controllers/user.controller';
import {EmailService} from '../shared/services/email.service';
import {ResetPasswordService} from '../auth/services/reset-password.service';

@Global()
@Module({
  providers: [
    UserDao,
    UserProfileService
  ],
  exports: [
    UserDao,
    UserProfileService
  ],
  imports: [
    EmailService,
    ResetPasswordService
  ],
  controllers: [
    UserController
  ]
})
export class UserModule {}
