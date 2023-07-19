import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ISetting} from '../entities/ISetting';
import {IServerResponse} from '../entities/IServerResponse';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  updatedSettingsData = new Subject<any>();

  constructor(private httpClient: HttpClient) { }

  saveAppSettings(appSettingsData: any, isEdit: boolean): Observable<IServerResponse<any>> {
    return this.httpClient[isEdit ? 'put' : 'post']('/api/settings/site', appSettingsData);
  }

  getAppSettings(): Observable<IServerResponse<ISetting[]>> {
    return this.httpClient.get(`/api/settings/site`);
  }

  getSiteLogo(): Observable<any> {
    return this.httpClient.get('/api/settings/site/logo', {responseType: 'blob'});
  }

  getSiteTitle(): Observable<IServerResponse<string>> {
    return this.httpClient.get('/api/settings/site/title');
  }

  setSettingsData(data: any) {
    this.updatedSettingsData.next(data);
  }

  getUpdatedSettingsData() {
    return this.updatedSettingsData.asObservable();
  }
}
