import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';
import { IK8sImage } from '../entities/IK8sImage';
import {MatSort} from '@angular/material/sort';


@Injectable({
  providedIn: 'root'
})
export class K8sImageService {

  constructor( private httpClient: HttpClient ) { }

  getAllImages(clusterId: number, namespace: string, deployment: string, limit: number, page: number, sort: MatSort):
    Observable<IServerResponse<IK8sImage[]>> {
    const {active, direction} = sort;
    const url = `/api/k8s-images?clusterId=${clusterId}&limit=${limit}&page=${page}&namespace=${namespace}&deployment=${deployment}&sort[field]=${active}&sort[direction]=${direction}`;
    return this.httpClient.get(url);
  }

  getAllK8sImagesBySelectedDate(clusterId: number, namespace: string, deployment: string, startTime: string, endTime: string, limit: number, page: number, sort: MatSort):
    Observable<IServerResponse<IK8sImage[]>> {
    const {active, direction} = sort;
    const url = `/api/k8s-images/history?clusterId=${clusterId}&startTime=${startTime}&endTime=${endTime}&limit=${limit}&page=${page}&namespace=${namespace}&deployment=${deployment}&sort[field]=${active}&sort[direction]=${direction}`;
    return this.httpClient.get(url);
  }

  getCountOfCurrentImages(clusterId: number, namespace: string, deployment: string): Observable<IServerResponse<number>> {
    return this.httpClient.get(`/api/k8s-images/count`,
      {params: new HttpParams().set('clusterId', String(clusterId))
          .set('namespace', namespace).set('deployment', deployment)});
  }

  getCountOfImages(clusterId: number, namespace: string, deployment: string, startTime: string, endTime: string): Observable<IServerResponse<number>> {
    return this.httpClient.get(`/api/k8s-images/history/count`,
      {params: new HttpParams().set('clusterId', String(clusterId))
          .set('namespace', namespace).set('deployment', deployment)
          .set('startTime', String(startTime)).set('endTime', String(endTime))});
  }

  getAllK8sImagesByPodName(podName: string, clusterId: number, namespace: string): Observable<IServerResponse<IK8sImage>> {
    return this.httpClient.get('/api/k8s-images/by-pod',
      {params: new HttpParams().set('clusterId', String(clusterId)).set('namespace', namespace).set('podName', podName)}
    );
  }
}
