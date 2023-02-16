import { Global, Module } from '@nestjs/common';
import { UserDao } from './dao/user.dao';
import { UserProfileService } from './services/user-profile.service';
import { UserController } from './controllers/user.controller';

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
  ],
  controllers: [
    UserController
  ]
})
export class UserModule {}
