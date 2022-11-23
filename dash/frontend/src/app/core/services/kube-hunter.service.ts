import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {IKubeHunterReport} from '../entities/IKubeHunterReport';
import {Observable} from 'rxjs';
import {IServerResponse} from '../entities/IServerResponse';

@Injectable({
  providedIn: 'root'
})
export class KubeHunterService {

  constructor(private httpClient: HttpClient) { }

  getKubeHunterReportById(id: number): Observable<IKubeHunterReport> {
    return this.httpClient.get<IKubeHunterReport>(`/api/kubehunter/${id}`);
  }

  getRecentKubehunterScan(clusterId: number, minDate?: number): Observable<IKubeHunterReport> {
    let params: HttpParams;
    if (minDate) {
      params = new HttpParams({ fromObject: { minDate: String(minDate) }});
    }
    return this.httpClient.get<IKubeHunterReport>(`/api/kubehunter/cluster/${clusterId}/recent`, { params });
  }

  allReportsForCluster(clusterId: number, limit?: number, page?: number):
    Observable<{reportCount: number, list: IKubeHunterReport[]}>{
    let params: HttpParams = new HttpParams();
    params = params.set('limit', String(limit));
    params = params.set('page', String(page));
    return this.httpClient.get<{reportCount: number, list: IKubeHunterReport[]}>(`/api/kubehunter/cluster/${clusterId}`, {params});
  }

  getKubeHunterApiKey(): Observable<{api: string}[]> {
    return this.httpClient.get<{api: string}[]>(`/api/kubehunter/apiKey`);
  }

}
