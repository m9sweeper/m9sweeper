import { Inject, Injectable } from "@nestjs/common";
import { instanceToPlain } from 'class-transformer';
import { UserDao } from '../dao/user.dao';
import {SourceSystem, UserAuthority, UserListDto, UserProfileDto} from '../dto/user-profile-dto';
import {UserCreateDto} from '../dto/user-create-dto';
import {ResetPasswordService} from '../../auth/services/reset-password.service';
import * as bcrypt from 'bcryptjs';
import { Authority } from "../enum/Authority";
import {PrometheusService} from "../../shared/services/prometheus.service";


@Injectable()
export class UserProfileService {
  constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
              private readonly userDao: UserDao,
              private readonly resetPasswordService: ResetPasswordService,
              private readonly prometheusService: PrometheusService){}


  async getAuthorities(): Promise<UserAuthority[]> {
    return await this.userDao.listAuthorities();
  }

  async createUser(userProfile: UserProfileDto): Promise<UserProfileDto> {
    let createdUser: UserProfileDto = null;
    const insertedIds = await this.userDao.create(instanceToPlain(userProfile));
    if (insertedIds.length > 0) {
      const users: UserProfileDto[] = await this.loadUserById(insertedIds.pop());
      if (users && Array.isArray(users) && users.length > 0) {
        createdUser = users.pop();
        if (createdUser.sourceSystem.type === 'LOCAL_AUTH') {
          await this.resetPasswordService.save(createdUser, 'CREATE_PASSWORD');
        }
      }
    }
    this.prometheusService.userCreated.inc();
    return createdUser;
  }

  async updateUser(userProfile: UserProfileDto): Promise<UserProfileDto[]> {
    await this.userDao.update(instanceToPlain(userProfile));
    return await this.loadUserById(userProfile.id, true);
  }

  async loadUserByEmail(email: string): Promise<UserProfileDto[]> {
    return await this.userDao.loadUser({'u.email': email});
  }

  async loadUserById(id: number, active?: boolean): Promise<UserProfileDto[]> {
    const clause = {'u.id': id};
    if (active !== undefined && active === true) {
      clause['u.deleted_at'] = null;
    }
    return await this.userDao.loadUser(clause);
  }

  async loadUsers(page = 0, limit = 10,
                  sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}
  ): Promise<{totalCount: number, list: UserProfileDto[]}> {
    const result =  await this.userDao.loadUser({deleted_at: null}, page, limit, sort);
    const totalCount = await this.userDao.countTotalActiveUsers();
    const list = result.map((u: UserProfileDto) => {
      delete u.password;
      return u;
    });

    return {totalCount: +totalCount, list: list};
  }

  async loadAllActiveUsers(): Promise<UserListDto[]> {
    return await this.userDao.loadAllActiveUsers();
  }

  async parseToUserProfile(data: {
    user: UserCreateDto,
    savedUserProfile?: UserProfileDto,
    currentLoggedInUser: UserProfileDto,
    listAuthorities: UserAuthority[]
  }): Promise<UserProfileDto> {
    if (data?.user && data?.user instanceof UserCreateDto) {
      const user = data.user;
      const currentLoggedInUser = data.currentLoggedInUser;
      const listAuthorities = data.listAuthorities;
      const currentUserAuthorities: string[] = currentLoggedInUser.authorities.map(a => a.type);

      const userProfile = new UserProfileDto();
      userProfile.firstName = user.firstName;
      userProfile.lastName = user.lastName;
      userProfile.email = user.email;
      userProfile.phone = user.phone;

      let password;
      // Only allow super admins to changes the password for other users
      if (user.password && ((currentLoggedInUser.id === data?.savedUserProfile?.id) || currentUserAuthorities.includes(Authority.SUPER_ADMIN))) {
        password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));
      } else {
        // If the password was not changed, keep the old one if it exists,
        // or this is a new user and the random one should be generated
        password = data?.savedUserProfile?.password
          ? data.savedUserProfile.password
          : Math.random().toString(36).slice(-8);
      };
      userProfile.password = password;

      userProfile.isActive = user.isActive;

      const userSourceSystem = new SourceSystem();
      userSourceSystem.id = '0';
      userSourceSystem.uid = '0';
      userSourceSystem.type = 'LOCAL_AUTH';
      userProfile.sourceSystem = userSourceSystem;

      /*
      * filtering user given authorities to save
      * listAuthorities contains all authorities
      * 1. If current user is SUPER_ADMIN, we are permitting him to set any kind of authority for an user
      * 2. If ADMIN, we are permitting him to set ADMIN and/or READ_ONLY
      * 3. For READ_ONLY, we are allowing READ_ONLY to set as authority of an user (READ_ONLY user can update his own profile only)
      * */
      userProfile.authorities = user.authorities.reduce((all: any, current: any) => {
        const matchedAuth = listAuthorities.find(auth => auth.id === current);
        if (matchedAuth) {
          if (
            currentUserAuthorities.includes(Authority.SUPER_ADMIN)
            || (currentUserAuthorities.includes(Authority.ADMIN) && [Authority.ADMIN.valueOf(), Authority.READ_ONLY.valueOf()].includes(matchedAuth.type))
            || (currentUserAuthorities.includes(Authority.READ_ONLY) && [Authority.READ_ONLY.valueOf()].includes(matchedAuth.type))
          ) {
            (all as UserAuthority[]).push(matchedAuth);
          }
        }
        return all;
      }, []);

      if (data?.savedUserProfile && data?.savedUserProfile instanceof UserProfileDto && data?.savedUserProfile.id > 0) {
        userProfile.id = data.savedUserProfile.id;
        userProfile.email = data.savedUserProfile.email;
        // userProfile.password = data.savedUserProfile.password;
        userProfile.sourceSystem = data.savedUserProfile.sourceSystem;
      }

      return userProfile;
    }
  }

  async getUserFailedAttemptCountInLastHour(userId: number): Promise<number> {
    return await this.userDao.getUserFailedAttemptCount(userId);
  }
}
