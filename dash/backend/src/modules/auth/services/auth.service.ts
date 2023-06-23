import {Inject, Injectable} from '@nestjs/common';
import {UserAuthority, UserProfileDto} from '../../user/dto/user-profile-dto';
import {AuthorityId} from "../../user/enum/authority-id";
@Injectable()
export class AuthService {
    constructor(
        @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
        //private readonly currentUserAuth: KubeBenchController,
    ) {}

    get isCurrentUserReadOnly(): boolean{
        const currentUserAuthorities = this._loggedInUser.authorities.map(a => a.type);
        // we are only interested on user whose authority returns ['READ_ONLY']
        // if authority returns ['ADMIN', 'READ_ONLY'] or ['ADMIN', 'READ_ONLY', 'SUPER_ADMIN'] then the user is not read only, he is an admin.
        return currentUserAuthorities.length && currentUserAuthorities.length === 1 && currentUserAuthorities[0] === 'READ_ONLY';
    }


    public checkAuthority(currentUserAuth: UserAuthority [], validAuthority: AuthorityId []): boolean {
        var allowAuth = false;
        currentUserAuth?.forEach(userAuth => {
            //console.log("userAuth: ", userAuth);
            //console.log("validAuthority.indexOf(userAuth.id)", validAuthority.indexOf(userAuth.id));
            if(validAuthority.indexOf(userAuth.id)!==-1){
                allowAuth = true;
            }
        })
        return allowAuth;
     }
}
