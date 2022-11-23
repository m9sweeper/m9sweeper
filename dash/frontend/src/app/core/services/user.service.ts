import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {IAPIKeyUser, IAuthority, IUser, IUserRequestPayload, IUserUpdateRequestPayload} from '../entities/IUser';
import {IServerResponse} from '../entities/IServerResponse';
import {MatSort} from '@angular/material/sort';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private logoForCurrentUser = new Subject<string>();

  constructor(private httpClient: HttpClient) { }

  getAuthorityList(): Observable<IServerResponse<IAuthority[]>> {
    return this.httpClient.get('/auth/authorities');
  }

  getAllUsers(page?: number, limit?: number, sort?: MatSort):
    Observable<IServerResponse<{totalCount: number, list: IUser[]}>> {
    const {active, direction} = sort;
    const url = `/api/users?page=${page}&limit=${limit}&sort[field]=${active}&sort[direction]=${direction}`;
    return this.httpClient.get(url);
  }

  loadAllActiveUsers(): Observable<IServerResponse<IAPIKeyUser[]>>{
    const url = '/api/users/load-all-active-users';
    return this.httpClient.get(url);
  }

  addUser(user: IUserRequestPayload): Observable<IServerResponse<IUser>> {
    return this.httpClient.post('/api/users', user);
  }

  getUpdatedUserData(id: number): Observable<any> {
    return this.httpClient.get('/api/users/' + id);
  }

  updateUserInfo(id: number, updateData: IUserRequestPayload): Observable<any> {
    return this.httpClient.put('/api/users/' + id, updateData);
  }

  getUserProfileSetting(): Observable<any> {
    return this.httpClient.get('/api/users/profile/setting');
  }

  updateUserProfileSetting(updateData: IUserUpdateRequestPayload): Observable<any> {
    return this.httpClient.put('/api/users/profile/setting', updateData);
  }

  sendLocalUserResetPasswordMail(email: any): Observable<any> {
    return this.httpClient.post('/auth/account/reset-password', email);
  }

  setLocalUserPassword(setNewPassword: any): Observable<any>{
    return this.httpClient.post(`/auth/account/activate-user`, setNewPassword);
  }

  resetLocalUserPassword(setNewPassword: any): Observable<any>{
    return this.httpClient.post(`/auth/account/reset-password/post`, setNewPassword);
  }

  changeLocalUserPassword(changePasswordData: any): Observable<any>{
    return this.httpClient.post('/auth/account/change-password', changePasswordData);
  }

  sendUpdatedLogo(updatedLogo: string) {
    this.logoForCurrentUser.next(updatedLogo);
  }

  getUpdatedLogo(): Observable<string> {
    return this.logoForCurrentUser.asObservable();
  }

}

