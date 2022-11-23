import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';
import { IDeployment } from '../entities/IDeployment';
import {MatSort} from '@angular/material/sort';

@Injectable({
  providedIn: 'root'
})
export class DeploymentService {

  constructor( private httpClient: HttpClient ) { }

  getAllDeployments(clusterId: number, namespace: string, limit: number, page: number, sort: MatSort): Observable<IServerResponse<IDeployment[]>> {
    const {active, direction} = sort;
    const url = `/api/deployments?clusterId=${clusterId}&namespace=${namespace}&limit=${limit}&page=${page}&sort[field]=${active}&sort[direction]=${direction}`;
    return this.httpClient.get(url);
  }

  getAllDeploymentsBySelectedDate(clusterId: number, namespace: string, startTime: string, endTime: string, limit: number, page: number, sort: MatSort): Observable<IServerResponse<IDeployment[]>> {
    const {active, direction} = sort;
    const url = `/api/deployments/history?clusterId=${clusterId}&namespace=${namespace}&limit=${limit}&page=${page}&sort[field]=${active}&sort[direction]=${direction}&startTime=${startTime}&endTime=${endTime}`;
    return this.httpClient.get(url);
  }

  getCountOfCurrentDeployments(clusterId: number, namespace: string): Observable<IServerResponse<number>> {
    return this.httpClient.get(`/api/deployments/count`,
      {params: new HttpParams().set('clusterId', String(clusterId)).set('namespace', namespace)});
  }

  getCountOfDeployments(clusterId: number, namespace: string, startTime: string, endTime: string): Observable<IServerResponse<number>> {
    return this.httpClient.get(`/api/deployments/history/count`,
      {params: new HttpParams().set('clusterId', String(clusterId)).set('namespace', namespace)
          .set('startTime', String(startTime)).set('endTime', String(endTime))});
  }

  getCountOfDeploymentByCompliantStatus(clusterId: Array<number>): Observable<IServerResponse<any>> {
    let params = new HttpParams();
    clusterId.forEach((value, key) => {
      params = params.set(`filters[clusterId][${key}]`, String(value));
    });
    return this.httpClient.get(`/api/deployments/summary`,
      {params});
  }
}
