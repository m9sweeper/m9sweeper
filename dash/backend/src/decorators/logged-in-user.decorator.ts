import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {plainToInstance} from 'class-transformer';
import {UserProfileDto} from '../modules/user/dto/user-profile-dto';

export const LoggedInUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return plainToInstance(UserProfileDto, request.loggedInUserProfile);
    },
);
