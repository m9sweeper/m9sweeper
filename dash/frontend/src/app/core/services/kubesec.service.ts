import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KubesecService {

  constructor( private httpClient: HttpClient ) {}

  listNamespaces(clusterId: number): Observable<any> {
    return this.httpClient.get(`/api/kubesec/listnamespaces?cluster=${clusterId}`);
  }

  listPods(clusterId: number, namespacesArray: string[]): Observable<any> {
    const params = new HttpParams({
        fromObject:
          {
            'namespaces[]': namespacesArray
          }
      }
    );
    return this.httpClient.get(`/api/kubesec/listpods?cluster=${clusterId}`, {params});
  }

  getKubesecReport(info: any, clusterId: number): Observable<any> {
    return this.httpClient.post(`/api/kubesec/${clusterId}`, info);
  }

  getPodFileKubesecReport(podFile: FormData): Observable<any> {
    return this.httpClient.post('/api/kubesec', podFile);
  }
}
