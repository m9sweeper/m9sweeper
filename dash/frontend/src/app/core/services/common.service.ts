import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private httpClient: HttpClient) { }

  getBaseUrl(): Observable<IServerResponse<{baseUrl: string}>> {
    return this.httpClient.get(`common/get-config`);
  }
}
