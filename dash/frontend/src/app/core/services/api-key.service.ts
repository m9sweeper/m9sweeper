import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';
import { IApiKey } from '../entities/IApiKey';
import {MatSort} from '@angular/material/sort';

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {

  constructor(private httpClient: HttpClient) { }

  countAllApisKeys(): Observable<IServerResponse<number>> {
    return this.httpClient.get(`api/api-key/count`);
  }
  getAll(sort: MatSort, page: number = 0, limit: number = 10): Observable<IServerResponse<{totalCount: number; list: IApiKey[]}>> {
    const params = new HttpParams()
                  .set(`sort[field]`, sort.active)
                  .set(`sort[direction]`, sort.direction)
                  .set(`page`, String(page))
                  .set(`limit`, String(limit));
    return this.httpClient.get(`/api/api-key`, {params});
  }

  getApiKeyById(id: number): Observable<IServerResponse<IApiKey>> {
    return this.httpClient.get(`api/api-key/${id}`);
  }

  addApiKey(data: IApiKey): Observable<IServerResponse<IApiKey>> {
    return this.httpClient.post(`/api/api-key`, data);
  }

  updateApiKey(id: number, data: IApiKey): Observable<any> {
    return this.httpClient.put(`/api/api-key/${id}`, data);
  }

  deleteApiKey(id: number): Observable<any>{
    return this.httpClient.delete(`/api/api-key/${id}`);
  }
}
