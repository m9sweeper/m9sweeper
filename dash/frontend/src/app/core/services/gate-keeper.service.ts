import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';
import {IGateKeeperConstraintDetails} from '../entities/IGateKeeperConstraint';
import { map, shareReplay } from 'rxjs/operators';
import {IGatekeeperTemplate} from '../entities/IGatekeeperTemplate';
import { IGatekeeperConstraintTemplate } from '../entities/IGatekeeperConstraintTemplate';
import {IGatekeeper} from '../entities/IGatekeeper';

/**
 * @deprecated
 */
@Injectable({
  providedIn: 'root'
})
export class GateKeeperService {
  constructor(private httpClient: HttpClient) {}

  /* routes that use the old cluster service in the backend */
  loadRawGateKeeperTemplate(clusterId: number, dir: string, subDir: string): Observable<IGatekeeperTemplate> {
    return this.httpClient.get<IServerResponse<IGatekeeperTemplate>>(`/api/clusters/opa/${clusterId}/gatekeeper-templates/raw/${dir}/${subDir}`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  patchRawGateKeeperTemplate(clusterId: number, template: any): Observable<IServerResponse<{message: string, statusCode: number}>> {
    return this.httpClient.post(`/api/clusters/opa/${clusterId}/gatekeeper-constraint-templates/raw`, {template});
  }

  destroyConstraintTemplate(clusterId: number, templateName: string): Observable<IServerResponse<{message: string; status: number}>> {
    return this.httpClient.delete(`/api/clusters/opa/${clusterId}/gatekeeper-constraint-templates/${templateName}`);
  }

  createGateKeeperTemplateConstraint(constraint: any, templateName: string, clusterId: number, ): Observable<IServerResponse<{message: string, statusCode: number}>> {
    return this.httpClient.post(`/api/clusters/opa/${clusterId}/${templateName}/constraints`, constraint);
  }

  patchGateKeeperTemplateConstraint(constraint: any, templateName: string, clusterId: number, ): Observable<IServerResponse<{message: string, statusCode: number}>> {
    return this.httpClient.put(`/api/clusters/opa/${clusterId}/${templateName}/constraints`, constraint);
  }

  destroyGateKeeperTemplateConstraint(clusterId: number, templateName: string, constraintName: string): Observable<IServerResponse<{message: string; status: number}>> {
    return this.httpClient.delete(`/api/clusters/opa/${clusterId}/gatekeeper-template-constraints/${templateName}/${constraintName}`);
  }

  getNamespacesByCluster(clusterId: number, ): Observable<IServerResponse<string[]>> {
    return this.httpClient.get(`/api/clusters/opa/${clusterId}/namespaces`);
  }

}
