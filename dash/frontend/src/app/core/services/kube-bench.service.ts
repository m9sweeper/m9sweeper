import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {IKubeBenchReport, IKubeBenchSummary} from '../entities/IKubeBenchReport';

@Injectable({
  providedIn: 'root'
})
export class KubeBenchService {

  constructor(private httpClient: HttpClient) { }

  getKubeBenchReportById(id: number): Observable<IKubeBenchReport> {
    return this.httpClient.get<IKubeBenchReport>(`/api/kube-bench/${id}`);
  }

  getAllBenchReportsByCluster(clusterId: number, limit?: number, page?: number):
    Observable<{reportCount: number, list: IKubeBenchReport[]}> {
    let params: HttpParams = new HttpParams();
    params = params.set('limit', String(limit));
    params = params.set('page', String(page));
    return this.httpClient.get<{reportCount: number, list: IKubeBenchReport[]}>(`/api/kube-bench/cluster/${clusterId}`, {params});
  }

  getConfigFileList(): Observable<{data: {name: string, value: string}[], success: boolean}> {
    return this.httpClient.get<{data: {name: string, value: string}[], success: boolean}>(`/api/kube-bench/config/get-options`);
  }

  getConfigFileContents(input: string): Observable<{data: string, success: boolean}> {
    return this.httpClient.get<{data: string, success: boolean}>(`/api/kube-bench/config/get-options/${input}`);
  }

  getLastBenchReportSummary(clusterId: number): Observable<IKubeBenchSummary>{
    return this.httpClient.get<IKubeBenchSummary>(`api/kube-bench/cluster/last/report/${clusterId}`);
  }

  deleteKubeBenchReportById(id: number): Observable<boolean> {
    return this.httpClient.delete<boolean>(`/api/kube-bench/${id}`);
  }
  getKubeBenchApiKey(): Observable<{api: string}[]> {
    return this.httpClient.get<{api: string}[]>(`/api/kube-bench/apiKey`);
  }
}
