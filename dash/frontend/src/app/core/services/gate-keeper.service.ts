import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';
import {IGateKeeperConstraintDetails} from '../entities/IGateKeeperConstraint';
import { map, shareReplay } from 'rxjs/operators';
import {IGatekeeperTemplate} from '../entities/IGatekeeperTemplate';

/**
 * @deprecated
 */
@Injectable({
  providedIn: 'root'
})
export class GateKeeperService {
  constructor(private httpClient: HttpClient) {}
  /**
   * @deprecated
   */
  destroyConstraintTemplate(clusterId: number, templateName: string): Observable<IServerResponse<{message: string; status: number}>> {
    return this.httpClient.delete(`/api/clusters/opa/${clusterId}/gatekeeper-constraint-templates/${templateName}`);
  }

  /**
   * @deprecated
   */
  createGateKeeperTemplateConstraint(constraint: any, templateName: string, clusterId: number, ): Observable<IServerResponse<{message: string, statusCode: number}>> {
    return this.httpClient.post(`/api/clusters/opa/${clusterId}/${templateName}/constraints`, constraint);
  }

  /**
   * @deprecated
   */
  patchGateKeeperTemplateConstraint(constraint: any, templateName: string, clusterId: number, ): Observable<IServerResponse<{message: string, statusCode: number}>> {
    return this.httpClient.put(`/api/clusters/opa/${clusterId}/${templateName}/constraints`, constraint);
  }

  /**
   * @deprecated
   */
  destroyGateKeeperTemplateConstraint(clusterId: number, templateName: string, constraintName: string): Observable<IServerResponse<{message: string; status: number}>> {
    return this.httpClient.delete(`/api/clusters/opa/${clusterId}/gatekeeper-template-constraints/${templateName}/${constraintName}`);
  }

}
