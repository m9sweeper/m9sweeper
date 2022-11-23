import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {IServerResponse} from '../entities/IServerResponse';
import {IPolicy} from '../entities/IPolicy';
import {MatSort} from '@angular/material/sort';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  constructor(private httpClient: HttpClient) { }

  getAllPolicies(page?: number, limit?: number, sort?: MatSort): Observable<IServerResponse<
    {totalCount: number, list: IPolicy[]}>> {
    const active = sort?.active || undefined;
    const direction = sort?.direction || undefined;
    const url = `/api/policies/?page=${page}&limit=${limit}&sort[field]=${active}&sort[direction]=${direction}`;
    return this.httpClient.get(url);
  }

  deletePolicyById(id: number): Observable<IServerResponse<number>>{
    return this.httpClient.delete(`/api/policies/${id}`);
  }

  createPolicy(policy: any): Observable<IServerResponse<IPolicy>> {
    return this.httpClient.post('/api/policies', policy);
  }

  updatePolicy(policy: any, id: number): Observable<IServerResponse<IPolicy>> {
    return this.httpClient.put(`/api/policies/${id}`, policy);
  }

  getPolicyById(id: number): Observable<IServerResponse<IPolicy>> {
    return this.httpClient.get(`/api/policies/${id}`);
  }

  getPolicyClusterMapById(id: number): Observable<{success: boolean; message: string; data: any[]}> {
    return this.httpClient.get<{success: boolean; message: string; data: any[]}>(`/api/policies/${id}/clusters`);
  }
}
