import { Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtUtilityService } from '../modules/auth/services/jwt-utility.service';
import { MineLoggerService } from '../modules/shared/services/mine-logger.service';
import { ApiKeyService } from '../modules/api-key/services/api-key.service';

export default {
  provide: 'LOGGED_IN_USER',
  scope: Scope.REQUEST,
  useFactory: async (
    request,
    jwtUtilityService: JwtUtilityService,
    apiKeyService: ApiKeyService,
    mineLoggerService: MineLoggerService
  ) => {
    const authorization = request.get('Authorization')?.split(' ')[1] || '';

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const bearerToken = type === 'Bearer' ? token : undefined;

    // allows us to retrieve API Keys as Bearer tokens, from headers, and from query strings
    const apiKey = bearerToken || request.get('x-api-key') || request.query['x-api-key'];

    try {
      let userInfo: any;
      if (authorization) {
        userInfo = await jwtUtilityService.verify(authorization);
      } else if (apiKey) {
        userInfo = await apiKeyService.getUserInfoByApiKey(apiKey);
      } else {
        userInfo = '';
      }
      return userInfo;
    } catch (e) {
      mineLoggerService.log(e.message, 'LOGGED_IN_USER_FACTORY');
    }

    return null;
  },
  inject: [ REQUEST, JwtUtilityService, ApiKeyService, MineLoggerService ],
};
