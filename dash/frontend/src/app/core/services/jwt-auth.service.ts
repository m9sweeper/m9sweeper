import {Injectable} from '@angular/core';
import * as jwt_decode from 'jwt-decode';
import {BehaviorSubject, Observable} from 'rxjs';
import {IUser} from '../entities/IUser';
import {AuthenticationType} from '../enum/AuthenticationType';

@Injectable({
  providedIn: 'root'
})
export class JwtAuthService {

  // private CURRENT_USER: IUser;


  private CURRENT_USER_SUBJECT: BehaviorSubject<IUser>;
  public CURRENT_USER: Observable<IUser>;

  constructor() {
    this.CURRENT_USER_SUBJECT = new BehaviorSubject<IUser>(this.parseToken(localStorage.getItem('__token__')));
    this.CURRENT_USER = this.CURRENT_USER_SUBJECT.asObservable();
  }

  private parseToken(token: string): IUser {
    try {
      const decoded = jwt_decode(token) as IUser;
      console.log('parseToken decoded: ', decoded);
      return decoded;
    } catch (e) {
      return null;
    }
  }

  getCurrentUserData(): IUser {
    try {
      const rawToken = localStorage.getItem('__token__');
      const decoded = this.parseToken(rawToken);
      console.log('getCurrentUserData decoded:', decoded);
      return decoded;
    } catch (e) {
      console.log('getCurrentUserData error: ', e);
      return null;
    }
  }

  saveToken(token: string) {
    console.log('saving token');
    localStorage.setItem('__token__', token);
    const user: IUser = this.parseToken(token);
    this.CURRENT_USER_SUBJECT.next(user);
  }

  clearToken() {
    localStorage.removeItem('__token__');
    this.CURRENT_USER_SUBJECT?.next(null);
  }

  get currentUser(): IUser {
    return this.CURRENT_USER_SUBJECT?.value;
  }

  get currentUserAuthorities(): string[] {
    return this.CURRENT_USER_SUBJECT?.value?.authorities?.map(a => a.type);
  }

  isAdmin(): boolean {
    const userAuthorities = this.currentUserAuthorities;
    return userAuthorities.includes('SUPER_ADMIN') || userAuthorities.includes('ADMIN');
  }

  isLocalUser(): boolean {
    const currentUser = this.currentUser;
    return currentUser.sourceSystem.type === AuthenticationType.LOCAL;
  }

  isTokenExpired(): boolean {
    try {
      const decoded = jwt_decode(localStorage.getItem('__token__'));
      const expirationTime = decoded.exp;
      return expirationTime <= Date.now() / 1000;
    } catch (e) {
      console.log('isTokenExpired: ', e);
      return null;
    }
  }

}
