import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Inject,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {UserProfileService} from '../services/user-profile.service';
import { UserAuthority, UserListDto, UserProfileDto } from "../dto/user-profile-dto";
import {AuthGuard} from '../../../guards/auth.guard';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {ALL_USERS_RESPONSE_SCHEMA, UPDATE_USER_RESPONSE_SCHEMA} from '../open-api-schema/users-schema';
import {UserCreateDto} from '../dto/user-create-dto';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator'
import { AuthorityGuard } from '../../../guards/authority.guard';
import {Authority} from '../enum/Authority';

@ApiTags('Users')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class UserController {
    constructor(
      @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
      private readonly userProfileService: UserProfileService
    ) {}

    @Get()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: ALL_USERS_RESPONSE_SCHEMA
    })
    async getAll(@Query('sort') sort: {field: string; direction: string; },
                 @Query('page') page: number, @Query('limit') limit: number):
        Promise<{totalCount: number, list: UserProfileDto[]}> {
        return await this.userProfileService.loadUsers(page, limit, sort);
    }

    @Get('/load-all-active-users')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: ALL_USERS_RESPONSE_SCHEMA
    })
    async loadAddActiveUsers(): Promise<UserListDto[]> {
        return await this.userProfileService.loadAllActiveUsers();
    }

    @Get(':userId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: ALL_USERS_RESPONSE_SCHEMA
    })
    async getById(@Param('userId') userId: number): Promise<UserProfileDto> {
        const users = await this.userProfileService.loadUserById(userId, true);
        if (users && Array.isArray(users) && users.length > 0) {
            const user:UserProfileDto = users.pop();
            // Delete the user's password for security. We should never return a password to the frontend.
            delete user.password;
            return user;
        }
        throw new NotFoundException('User not found');
    }

    @Post()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: UPDATE_USER_RESPONSE_SCHEMA
    })
    async createUser(@Body() user: UserCreateDto): Promise<UserProfileDto> {
        const userByEmail: UserProfileDto[] = await this.userProfileService.loadUserByEmail(user.email);
        if (!userByEmail || (userByEmail && userByEmail.length === 0)) {
            const listAuthorities: UserAuthority[] = await this.userProfileService.getAuthorities();
            const parsedUserProfile: UserProfileDto = await this.userProfileService.parseToUserProfile({
                user: user,
                currentLoggedInUser: this._loggedInUser,
                listAuthorities: listAuthorities
            });
            const createdUser: UserProfileDto = await this.userProfileService.createUser(parsedUserProfile);
            delete createdUser.password;
            return createdUser;
        }
        throw new BadRequestException('User already exists');
    }

    @Put(':userId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: UPDATE_USER_RESPONSE_SCHEMA
    })
    async updateUser(@Param('userId') userId: number, @Body() user: UserCreateDto): Promise<UserProfileDto> {
        const userById: UserProfileDto[] = await this.userProfileService.loadUserById(userId);
        if (userById && userById.length > 0) {
            const savedUserProfile: UserProfileDto = userById.pop();
            const listAuthorities: UserAuthority[] = await this.userProfileService.getAuthorities();
            const updatedUserProfilePayload: UserProfileDto = await this.userProfileService.parseToUserProfile({
                user: user,
                currentLoggedInUser: this._loggedInUser,
                listAuthorities: listAuthorities,
                savedUserProfile: savedUserProfile
            });
            const users: UserProfileDto[] = await this.userProfileService.updateUser(updatedUserProfilePayload);
            if (users && Array.isArray(users) && users.length > 0) {
                const user:UserProfileDto = users.pop();
                // Delete the user's password for security. We should never return a password to the frontend.
                delete user.password;
                return user;
            }
        }
        throw new NotFoundException('User not found');
    }

    @Get('profile/setting')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: UPDATE_USER_RESPONSE_SCHEMA
    })
    async getUserProfileSetting(): Promise<UserProfileDto>{
        const users = await this.userProfileService.loadUserById(this._loggedInUser.id);
        if (users && Array.isArray(users) && users.length > 0) {
            const user: UserProfileDto = users.pop();
            // Delete the user's password for security. We should never return a password to the frontend.
            delete user.password;
            return user;
        }
        throw new NotFoundException('User not found');
    }

    @Put('profile/setting')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: UPDATE_USER_RESPONSE_SCHEMA
    })
    async updateUserProfile(@Body() user: UserCreateDto): Promise<UserProfileDto>{
            const userById: UserProfileDto[] = await this.userProfileService.loadUserById(this._loggedInUser.id);
            if (userById && userById.length > 0) {
                const savedUserProfile: UserProfileDto = userById.pop();
                const listAuthorities: UserAuthority[] = await this.userProfileService.getAuthorities();
                const updatedUserProfileSetting: UserProfileDto = await this.userProfileService.parseToUserProfile({
                    user: user,
                    currentLoggedInUser: this._loggedInUser,
                    listAuthorities: listAuthorities,
                    savedUserProfile: savedUserProfile
                });
                const users: UserProfileDto[] = await this.userProfileService.updateUser(updatedUserProfileSetting);
                if (users && Array.isArray(users) && users.length > 0) {
                    const user:UserProfileDto = users.pop();
                    // Delete the user's password for security. We should never return a password to the frontend.
                    delete user.password;
                    return user;
                }
            }

        throw new NotFoundException(`User not found`);
    }



}
