import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';
import { INamespace } from '../entities/INamespace';
import {MatSort} from '@angular/material/sort';

@Injectable({
  providedIn: 'root'
})
export class NamespaceService {

  constructor( private httpClient: HttpClient ) { }

  getAllK8sNamespaces(clusterId: number, limit?: number, page?: number, sort?: MatSort): Observable<IServerResponse<INamespace[]>> {
    const {active, direction} = sort ? sort : {active: 'id', direction: 'asc'};
    const url = `/api/namespaces?clusterId=${clusterId}&limit=${limit}&page=${page}&sort[field]=${active}&sort[direction]=${direction}`;
    return this.httpClient.get(url);
  }
  getAllNamespacesBySelectedDate(clusterId: number, startTime: string, endTime: string, limit: number, page: number, sort: MatSort):
    Observable<IServerResponse<INamespace[]>> {
    const {active, direction} = sort;
    const url = `/api/namespaces/history?clusterId=${clusterId}&limit=${limit}&page=${page}&sort[field]=${active}&sort[direction]=${direction}&startTime=${startTime}&endTime=${endTime}`;
    return this.httpClient.get(url);
    }
  getCurrentK8sNamespaces(): Observable<IServerResponse<INamespace[]>>{
    return this.httpClient.get('/api/namespaces/current');
  }
  getCountOfCurrentNamespaces(clusterId: number): Observable<IServerResponse<number>> {
  return this.httpClient.get(`/api/namespaces/${clusterId}/count`);
  }
  getCountOfNamespaces(clusterId: number, startTime: string, endTime: string): Observable<IServerResponse<number>> {
    return this.httpClient.get(`/api/namespaces/${clusterId}/history/count`,
      {params: new HttpParams().set('startTime', String(startTime)).set('endTime', String(endTime))});
  }

}
