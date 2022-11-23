import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IServerResponse} from '../entities/IServerResponse';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  constructor(private httpClient: HttpClient) { }

  getDatabaseStatus(): Observable<IServerResponse<{appname: string, git_sha: string, build_date: string, git_tag: string}>> {
    return this.httpClient.get('/api/info');
  }
}
