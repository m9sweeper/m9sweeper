import {Scope} from '@nestjs/common';
import {REQUEST} from '@nestjs/core';
import {JwtUtilityService} from '../modules/auth/services/jwt-utility.service';
import {MineLoggerService} from '../modules/shared/services/mine-logger.service';
import {ApiKeyService} from '../modules/api-key/services/api-key.service';

export default {
    provide: 'LOGGED_IN_USER',
    scope: Scope.REQUEST,
    useFactory: async (request,
                       jwtUtilityService: JwtUtilityService,
                       apiKeyService: ApiKeyService,
                       mineLoggerService: MineLoggerService) => {
        const authorization = request.get('Authorization')?.split(' ')[1] || '';
        const apiKey = request.get('x-api-key');
        try {
            let userInfo: any;
            if (authorization) {
                userInfo =  await jwtUtilityService.verify(authorization);
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
    inject: [REQUEST, JwtUtilityService, ApiKeyService, MineLoggerService],
}
