import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {IServerResponse} from '../entities/IServerResponse';
import {IFalcoLog} from '../entities/IFalcoLog';
import {Observable} from 'rxjs';
import {VulnerabilitySeverity} from '../enum/VulnerabilitySeverity';
import {IReportsCsv} from '../entities/IReportsCsv';
import {IFalcoCsv} from '../entities/IFalcoCsv';
import {IKubeBenchReport} from '../entities/IKubeBenchReport';


@Injectable({
  providedIn: 'root'
})
export class FalcoService {
  constructor(
    private httpClient: HttpClient,
  ) {}

  getFalcoLogs(clusterId: number,
               limit?: number,
               page?: number,
               selectedPriorityLevels?: string [],
               selectedOrderBy?: string,
               startDate?: string,
               endDate?: string,
               namespaces?: string []
  ): Observable<IServerResponse<{logCount: number, list: IFalcoLog[]}>> {
    const params = this.buildParams(clusterId, limit, page, selectedPriorityLevels, selectedOrderBy, startDate, endDate, namespaces);
    return this.httpClient.get('/api/falco', {params});
  }


  downloadFalcoExport(clusterId: number):
    Observable<IServerResponse<IFalcoCsv>> {
    const params = this.buildParams(clusterId);
    return this.httpClient.get('/api/falco/download', {params});
  }

  buildParams(clusterId: number,
              limit?: number,
              page?: number,
              selectedPriorityLevels?: string [],
              selectedOrderBy?: string,
              startDate?: string,
              endDate?: string,
              namespaces?: string []
  ): HttpParams {
    let params: HttpParams = new HttpParams();
    params = params.set('cluster-id', clusterId.toString());

    if (limit){
      params = params.set('limit', String(limit));
    }
    if (page){
      params = params.set('page', String(page));
    }

    if (selectedPriorityLevels) {
      selectedPriorityLevels.forEach((priority: string) => {
        params = params.append('priority[]', priority);
      });
    }

    if (selectedOrderBy) {
      params = params.set('orderBy', selectedOrderBy.toString());
    }

    if (startDate) {
      params = params.set('startDate', startDate.toString());
    }

    if (endDate) {
      params = params.set('endDate', endDate.toString());
    }

    if (namespaces) {
      namespaces.forEach((namespace: string) => {
        params = params.append('namespace[]', namespace);
      });
    }

    return params;
  }

  getFalcoApiKey(): Observable<IServerResponse<{api: string}[]>>{
    return this.httpClient.get<IServerResponse<{api: string}[]>>(`/api/falco/apiKey`);
  }

}
