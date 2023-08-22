import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IServerResponse} from '../entities/IServerResponse';
import {map, shareReplay} from 'rxjs/operators';
import {IGatekeeper, IGatekeeperConstraint, IGatekeeperConstraintTemplate} from '../entities/gatekeeper';

@Injectable({
  providedIn: 'root'
})
export class GatekeeperService {
  constructor(private httpClient: HttpClient) {}

  private buildBaseUrl(clusterId: number): string {
    return `/api/clusters/${clusterId}/gatekeeper`;
  }

  getGatekeeperInstallationInfo(clusterId: number): Observable<{
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
    }>>(`${this.buildBaseUrl(clusterId)}`)
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  getGatekeeperConstraintTemplateBlueprints(clusterId: number): Observable<{
    category: string,
    templates: {
      name: string,
      template: IGatekeeperConstraintTemplate,  // Constraint Template Blueprint
    }[],
  }[]> {
    return this.httpClient.get<IServerResponse<any>>(`${this.buildBaseUrl(clusterId)}/constraint-template-blueprints`)
      .pipe(
        map(response => response?.data),
        shareReplay(),
      );
  }

  getGatekeeperConstraintTemplates(clusterId: number): Observable<any> {
    return this.httpClient.get<IServerResponse<any>>(`${this.buildBaseUrl(clusterId)}/constraint-templates`)
      .pipe(
        map(response => response?.data),
        shareReplay(),
      );
  }

  deployGatekeeperConstraintTemplates(clusterId: number, templates: { name: string, template: string }[]): Observable<{ successfullyDeployed: string[], unsuccessfullyDeployed: string[] }> {
    return this.httpClient.post<IServerResponse<{
      successfullyDeployed: string[],
      unsuccessfullyDeployed: string[],
    }>>(`${this.buildBaseUrl(clusterId)}/constraint-templates`, templates)
      .pipe(
        map(response => response?.data),
        shareReplay(),
      );
  }

  getConstraintTemplateByName(clusterId: number, templateName: string, excludeConstraints = false): Observable<{
    associatedConstraints: IGatekeeperConstraint[] | null,
    template: IGatekeeperConstraintTemplate,
    rawConstraintTemplate: string,
  }> {
    const params = new HttpParams().set('excludeConstraints', excludeConstraints);
    return this.httpClient.get<IServerResponse<{
      associatedConstraints: IGatekeeperConstraint[],
      template: IGatekeeperConstraintTemplate,
      rawConstraintTemplate: string,
    }>>(`${this.buildBaseUrl(clusterId)}/constraint-templates/${templateName}`, { params })
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  updateConstraintTemplate(clusterId: number, templateName: string, template: string) {
    return this.httpClient.put<IServerResponse<void>>(`${this.buildBaseUrl(clusterId)}/constraint-templates/${templateName}`, { template })
      .pipe(
        map(response => response?.data),
        shareReplay()
      );
  }

  deleteConstraintTemplate(clusterId: number, templateName: string) {
    return this.httpClient.delete<IServerResponse<any>>(`${this.buildBaseUrl(clusterId)}/constraint-templates/${templateName}`)
        .pipe(
            map(response => response?.data),
            shareReplay()
        );
  }

  createConstraint(clusterId: number, templateName: string, constraint: any) {
    return this.httpClient.post<IServerResponse<IGatekeeperConstraint>>(`${this.buildBaseUrl(clusterId)}/constraint-templates/${templateName}/constraints`, { constraint })
        .pipe(
            map(response => response?.data),
            shareReplay(),
        );
  }
}
