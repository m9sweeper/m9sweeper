import {Injectable, OnDestroy} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';
import { ICluster } from '../entities/ICluster';
import {INamespaceTotalVulnerability} from '../entities/INamespaceTotalVulnerability';
import { IClusterEvent } from '../entities/IClusterEvent';
import {MatSort} from '@angular/material/sort';

@Injectable({
  providedIn: 'root'
})
export class ClusterService implements OnDestroy{
  private subject = new BehaviorSubject<any>({result: null});

  constructor(private httpClient: HttpClient) { }

  getAllClusters(): Observable<IServerResponse<ICluster[]>> {
    return this.httpClient.get('/api/clusters');
  }

  createCluster(cluster: any): any {
    return this.httpClient.post('/api/clusters', cluster);
  }

  updateCluster(cluster: any, id: number): Observable<any> {
    return this.httpClient.put(`/api/clusters/${id}`, cluster);
  }

  testServiceAccount(token: string, server: string, context: string): Observable<IServerResponse<{valid: boolean, config: string, context?: string}>> {
    return this.httpClient.post<IServerResponse<{valid: boolean, config: string}>>('/api/clusters/test-service-account', {token, server, context});
  }

  getClusterById(id: number): Observable<IServerResponse<ICluster>>{
    return this.httpClient.get('/api/clusters/' + id);
  }

  getClustersByClusterGroupId(groupId: number): Observable<any> {
    // if groupId is undefined then we will use 1 as groupId for now
    const clusterGroupId = groupId ? groupId : 1 ;
    return this.httpClient.get(`/api/clusters/group-by/${clusterGroupId}`);
  }

  deleteClusterById(id: number){
    return this.httpClient.delete(`/api/clusters/${id}`);
  }

  searchClusters(searchTerm: string, groupId: number) {
    return this.httpClient.get(`api/clusters/search-by-group/${groupId}`,
      {params: new HttpParams().set('q', searchTerm)});
  }

  namespaceTotalVulnerabilityByClusterId(clusterId: number, sort: MatSort): Observable<IServerResponse<INamespaceTotalVulnerability[]>>  {
    const {active, direction} = sort;
    const url = `/api/clusters/${clusterId}/images/total/vulnerability/severity?&sort[field]=${active}&sort[direction]=${direction}`;
    return this.httpClient.get(url);
  }

  sendData(message: { result: any }) {
    this.subject.next(message);
  }

  // clearData() {
  //   this.subject.next();
  // }

  getData(): Observable<any> {
    return this.subject.asObservable();
  }

  getClusterEvents(clusterId: number, limit: number, page: number): Observable<IServerResponse<IClusterEvent[]>> {
    return this.httpClient.get(`api/clusters/${clusterId}/events`,
      {params: new HttpParams().set('limit', String(limit)).set('page', String(page))});
  }

  ngOnDestroy(): void {
    this.subject.unsubscribe();
  }

  calculateScanHistoryChartRange(imageCounts: number[]): { yScaleMin: number, yAxisTicks: number[] } {
    if (!imageCounts.length) {
      return {yScaleMin: 0, yAxisTicks: []};
    }
    const range = [];
    const maxCount = Math.max(...imageCounts);
    let distance = Math.floor((maxCount) / 4);
    distance = distance - (distance % 5);
    for (let i = 0; i <= 4; i++) {
      const e = (distance * i);
      range.push(e);
    }
    return {yScaleMin: 0 , yAxisTicks: range};
  }

}
