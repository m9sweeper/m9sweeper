import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';
import { IPod } from '../entities/IPod';
import {MatSort} from '@angular/material/sort';
import {IDeployment} from '../entities/IDeployment';
import {FormatDate} from '../../modules/shared/format-date/format-date';
import { IPodComplianceSummary } from '../entities/IPodComplianceSummary';


@Injectable({
  providedIn: 'root'
})
export class PodService {

  constructor( private httpClient: HttpClient ) { }

  getAllCurrentPods(clusterId: number, namespace: string, limit = 10, page = 0): Observable<IServerResponse<IPod[]>> {
    return this.httpClient.get(`/api/k8s-pods`,
      {params: new HttpParams().set('clusterId', clusterId.toString())
          .set('namespace', namespace)
          .set('limit', limit.toString())
          .set('page', page.toString())
      });
  }
  getNumOfCurrentPods(clusterId: number, namespace: string): Observable<IServerResponse<string>> {
    return this.httpClient.get(`/api/k8s-pods/count`,
      {params: new HttpParams().set('clusterId', clusterId.toString()).set('namespace', namespace)}
    );
  }
  getPodById(clusterId: number, namespace: string, podId: number): Observable<IServerResponse<IPod>> {
    return this.httpClient.get(`/api/k8s-pods/${podId}`,
      {params: new HttpParams().set('clusterId', clusterId.toString()).set('namespace', namespace).set('podId', String(podId))}
      );
  }
  getPodByName(clusterId: number, namespace: string, podName: string): Observable<IServerResponse<IPod>> {
    return this.httpClient.get(`/api/k8s-pods/${podName}`,
      {params: new HttpParams().set('clusterId', clusterId.toString()).set('namespace', namespace).set('podId', podName)}
      );
  }

  /**
   * @param clusterId which cluster to query
   * @param namespace which namespace to search
   * @param podName which pod to retrieve
   * @param startTime should be in the format YYYY-MM-DD
   * @param endTime should be in the format YYYY-MM-DD
   */
  getPodByNameAndDate(clusterId: number, namespace: string, podName: string, startTime: string, endTime: string): Observable<IServerResponse<IPod>> {
    return this.httpClient.get(`/api/k8s-pods/${podName}/history`,
      {params: new HttpParams()
          .set('clusterId', clusterId.toString())
          .set('namespace', namespace)
          .set('startTime', startTime.toString())
          .set('endTime', endTime.toString())
      }
    );
  }
  getPodsBySelectedDate(
    clusterId: number, namespace: string,
    startTime: number, endTime: number,
    sort: MatSort,
    limit = 0, page = 1,
  ): Observable<IServerResponse<IPod[]>> {
    const {active, direction} = sort;
    const formattedStartTime =  FormatDate.formatLastScannedDate(startTime).split(' ')[0];
    const formattedEndTime =  FormatDate.formatLastScannedDate(endTime).split(' ')[0];
    return this.httpClient.get(`/api/k8s-pods/history`,
      {params: new HttpParams()
          .set('clusterId', String(clusterId)).set('namespace', namespace)
          .set('startTime', formattedStartTime).set('endTime', formattedEndTime)
          .set('limit', limit.toString()).set('page', page.toString())
          .set('sort[field]', active).set('sort[direction]', direction)
      }
    );
  }
  getNumOfPodsBySelectedDate(
    clusterId: number, namespace: string,
    startTime: number, endTime: number,
  ): Observable<IServerResponse<string>> {
    const formattedStartTime =  FormatDate.formatLastScannedDate(startTime).split(' ')[0];
    const formattedEndTime =  FormatDate.formatLastScannedDate(endTime).split(' ')[0];
    return this.httpClient.get(`/api/k8s-pods/history/count`,
      {params: new HttpParams()
          .set('clusterId', String(clusterId)).set('namespace', namespace)
          .set('startTime', formattedStartTime).set('endTime', formattedEndTime)
      }
    );
  }

  getPodsComplianceSummary(options?: {clusterId?: number, clusterGroupId?: number}): Observable<IServerResponse<IPodComplianceSummary[]>> {
    let params = new HttpParams();
    if (options?.clusterId) {
      params = params.set('clusterId', String(options.clusterId));
    }
    if (options?.clusterGroupId) {
      params = params.set('clusterGroupId', String(options.clusterGroupId));
    }

    return this.httpClient.get(`/api/k8s-pods/summary`, { params });
  }
}
