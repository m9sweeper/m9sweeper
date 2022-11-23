import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';
import {IGateKeeperConstraint, IGateKeeperConstraintDetails} from '../entities/IGateKeeperConstraint';
import { map, shareReplay } from 'rxjs/operators';
import {IGatekeeperTemplate} from '../entities/IGatekeeperTemplate';


@Injectable({
  providedIn: 'root'
})
export class GateKeeperService {
  constructor(private httpClient: HttpClient) { }
  getGateKeeperConstraintTemplatesByCluster(clusterId: number): Observable<IGateKeeperConstraintDetails[]> {
    return this.httpClient.get<IServerResponse<IGateKeeperConstraintDetails[]>>(`/api/clusters/opa/${clusterId}/gatekeeper-constraint-templates`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  checkGatekeeperInstallationStatus(clusterId: number): Observable<{status: boolean, message: string}> {
    return this.httpClient.get<IServerResponse<{status: boolean, message: string}>>(`/api/clusters/opa/${clusterId}/gatekeeper/installation-status`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  gateKeeperTemplateByName(clusterId: number, templateName: string): Observable<IGatekeeperTemplate> {
    return this.httpClient.get<IServerResponse<IGatekeeperTemplate>>(`/api/clusters/opa/${clusterId}/gatekeeper-constraint-templates/${templateName}`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  gateKeeperTemplateByNameRaw(clusterId: number, templateName: string): Observable<any> {
    return this.httpClient.get<IServerResponse<IGatekeeperTemplate>>(`/api/clusters/opa/${clusterId}/gatekeeper-constraint-templates/${templateName}/raw`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  gateKeeperConstraintsByTemplate(clusterId: number, templateName: string): Observable<IGateKeeperConstraintDetails[]> {
    return this.httpClient.get<IServerResponse<IGateKeeperConstraintDetails[]>>(`/api/clusters/opa/${clusterId}/${templateName}/constraints`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  gateKeeperTemplateDirList(clusterId: number): Observable<{ [dirName: string]: string[] }> {
    return this.httpClient.get<IServerResponse<{ [dirName: string]: string[] }>>(`/api/clusters/opa/${clusterId}/gatekeeper-templates/dirs`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  loadGateKeeperTemplate(clusterId: number, dir: string, subDir: string): Observable<IGatekeeperTemplate> {
    return this.httpClient.get<IServerResponse<IGatekeeperTemplate>>(`/api/clusters/opa/${clusterId}/gatekeeper-templates/${dir}/${subDir}`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  loadRawGateKeeperTemplate(clusterId: number, dir: string, subDir: string): Observable<IGatekeeperTemplate> {
    return this.httpClient.get<IServerResponse<IGatekeeperTemplate>>(`/api/clusters/opa/${clusterId}/gatekeeper-templates/raw/${dir}/${subDir}`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  deployGateKeeperTemplate(clusterId: number, templateName: string): Observable<IServerResponse<{message: string, statusCode: number}>> {
    return this.httpClient.post(`/api/clusters/opa/${clusterId}/gatekeeper-constraint-templates`, {templateName});
  }

  deployMultipleGateKeeperTemplates(clusterId: number, templateNames: string[]): Observable<IServerResponse<{message: string, statusCode: number}>> {
    return this.httpClient.post(`/api/clusters/opa/${clusterId}/gatekeeper-constraint-multiple-templates`, {templateNames});
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
