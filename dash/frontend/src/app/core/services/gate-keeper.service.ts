import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';
import {IGateKeeperConstraintDetails} from '../entities/IGateKeeperConstraint';
import { map, shareReplay } from 'rxjs/operators';
import {IGatekeeperTemplate} from '../entities/IGatekeeperTemplate';
import { IGatekeeperConstraintTemplate } from '../entities/IGatekeeperConstraintTemplate';
import {IGatekeeper} from '../entities/IGatekeeper';


@Injectable({
  providedIn: 'root'
})
export class GateKeeperService {
  constructor(private httpClient: HttpClient) {}

  /* routes that use the new Gatekeeper service in the backend */

  // base endpoint
  getGatekeeperInstallation(clusterId: number): Observable<{
    status: boolean,
    message: string,
    error?: any,
    data?: {
      constraints: IGatekeeperConstraintTemplate[],
      gatekeeperResource: Partial<IGatekeeper>,
    },
  }> {
    return this.httpClient.get<IServerResponse<{
      status: boolean,
      message: string,
      error?: any,
      data?: {
        constraints: IGatekeeperConstraintTemplate[],
        gatekeeperResource: Partial<IGatekeeper>,
      },
    }>>(`/api/clusters/${clusterId}/gatekeeper`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  // constraint-templates endpoint
  getGateKeeperConstraintTemplatesByCluster(clusterId: number): Observable<IGatekeeperConstraintTemplate[]> {
    return this.httpClient.get<IServerResponse<IGatekeeperConstraintTemplate[]>>(`/api/clusters/${clusterId}/gatekeeper/constraint-templates`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  getConstraintTemplateByName(clusterId: number, templateName: string): Observable<{
    associatedConstraints: IGatekeeperConstraintTemplate[],
    constraintTemplate: IGatekeeperConstraintTemplate,
    rawConstraintTemplate: string,
  }> {
    return this.httpClient.get<IServerResponse<{
      associatedConstraints: IGatekeeperConstraintTemplate[],
      constraintTemplate: IGatekeeperConstraintTemplate,
      rawConstraintTemplate: string,
    }>>(`/api/clusters/${clusterId}/gatekeeper/constraint-templates/${templateName}`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  gatekeeperTemplateByNameAsString(clusterId: number, templateName: string): Observable<string> {
    return this.httpClient.get<IServerResponse<string>>(`/api/clusters/${clusterId}/gatekeeper/constraint-templates/${templateName}/raw`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  getConstraintTemplateTemplates(clusterId: number): Observable<{
    category: string;
    templates: {
      name: string,
      template: IGatekeeperConstraintTemplate,
    }[]
  }[]> {
    return this.httpClient.get<IServerResponse<{
      category: string;
      templates: {
        name: string,
        template: IGatekeeperConstraintTemplate,
      }[]
    }[]>>(`/api/clusters/${clusterId}/gatekeeper/constraint-templates/templates`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  deployMultipleGateKeeperTemplates(clusterId: number, templates: {name: string, template: string}[]): Observable<IServerResponse<{message: string, statusCode: number}>> {
    return this.httpClient.post(`/api/clusters/${clusterId}/gatekeeper/constraint-templates`, templates);
  }

  /* constraint endpoints */
  gateKeeperConstraintsByTemplate(clusterId: number, templateName: string): Observable<IGatekeeperConstraintTemplate[]> {
    return this.httpClient.get<IServerResponse<IGatekeeperConstraintTemplate[]>>(`/api/clusters/${clusterId}/gatekeeper/constraints/${templateName}`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }


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
