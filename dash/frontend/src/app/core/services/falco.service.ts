import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {IServerResponse} from '../entities/IServerResponse';
import {IFalcoLog} from '../entities/IFalcoLog';
import {Observable} from 'rxjs';
import {IFalcoCsv} from '../entities/IFalcoCsv';
import {IFalcoCount} from '../entities/IFalcoCount';
import {IFalcoSettingPayload} from '../entities/IFalcoSettingPayload';
import {IFalcoRule} from '../entities/IFalcoRule';

export interface FalcoLogOptions {
  limit?: number;
  page?: number;
  selectedPriorityLevels?: string [];
  selectedOrderBy?: string;
  startDate?: string;
  endDate?: string;
  namespace?: string;
  pod?: string;
  image?: string;
  signature?: string;
  eventId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FalcoService {
  constructor(
    private httpClient: HttpClient,
  ) {}

  getFalcoLogs(clusterId: number, options?: FalcoLogOptions
  ): Observable<IServerResponse<{logCount: number, list: IFalcoLog[]}>> {
    const params = this.buildParams(clusterId, options);
    return this.httpClient.get('/api/falco', {params});
  }

  getFalcoLogByEventId(eventId: number
  ): Observable<IServerResponse<IFalcoLog>> {
    return this.httpClient.get(`/api/falco/${eventId}`);
  }

  getCountOfFalcoLogsBySignature(clusterId: number, signature: string
  ): Observable<IServerResponse<IFalcoCount[]>>{
    const params = this.buildParams(clusterId, {signature} );
    return this.httpClient.get('/api/falco/count', {params});
  }

  downloadFalcoExport(clusterId: number, options?: FalcoLogOptions ):
    Observable<IServerResponse<IFalcoCsv>> {
    const params = this.buildParams(clusterId, options);
    return this.httpClient.get('/api/falco/download', {params});
  }

  addFalcoSetting(clusterId: number, settingPayload: IFalcoSettingPayload): Observable<IServerResponse<IFalcoSettingPayload>>{
    return this.httpClient.post(`/api/falco/${clusterId}/settings`, settingPayload);
  }

  findFalcoSetting(clusterId: number): Observable<IServerResponse<IFalcoSettingPayload>>{
    return this.httpClient.get(`/api/falco/${clusterId}/findsetting`);
  }

  buildParams(clusterId: number, options?: FalcoLogOptions
  ): HttpParams {
    let params: HttpParams = new HttpParams();
    params = params.set('cluster-id', clusterId.toString());

    if (options?.limit){
      const limitANumber = options?.limit * 1;
      params = params.set('limit', String(limitANumber));
    }
    if (options?.page){
      params = params.set('page', String(options?.page));
    }

    if (options?.selectedPriorityLevels) {
      options?.selectedPriorityLevels.forEach((priority: string) => {
        params = params.append('priority[]', priority);
      });
    }

    if (options?.selectedOrderBy) {
      params = params.set('orderBy', options?.selectedOrderBy.toString());
    }

    if (options?.startDate) {
      params = params.set('startDate', options?.startDate.toString());
    }

    if (options?.endDate) {
      params = params.set('endDate', options?.endDate.toString());
    }

    if (options?.namespace) {
      params = params.set('namespace', options?.namespace.toString());
    }

    if (options?.pod) {
      params = params.set('pod', options?.pod.toString());
    }

    if (options?.image) {
      params = params.set('image', options?.image.toString());
    }

    if (options?.signature) {
      params = params.set('signature', options?.signature.toString());
    }

    if (options?.eventId) {
      params = params.set('eventId', options?.eventId.toString());
    }

    return params;
  }

  getFalcoApiKey(): Observable<IServerResponse<{api: string}[]>>{
    return this.httpClient.get<IServerResponse<{api: string}[]>>(`/api/falco/apiKey`);
  }

  createRule(clusterId: number, rule: IFalcoRule): Observable<IServerResponse<IFalcoRule>> {
    return this.httpClient.post(`/api/falco/${clusterId}/rules`, rule);
  }

  listRules(clusterId: number): Observable<IServerResponse<IFalcoRule[]>> {
    return this.httpClient.get<IServerResponse<IFalcoRule[]>>(`/api/falco/${clusterId}/rules`);
  }

  updateRule(clusterId: number, rule: IFalcoRule): Observable<IServerResponse<IFalcoRule>> {
    return this.httpClient.put(`/api/falco/${clusterId}/rules/${rule.id}`, rule);
  }

  deleteRule(clusterId: number, ruleId: number): Observable<IServerResponse<IFalcoRule>> {
    return this.httpClient.delete(`/api/falco/${clusterId}/rules/${ruleId}`);
  }
}
