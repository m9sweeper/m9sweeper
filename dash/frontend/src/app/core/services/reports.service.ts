import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {VulnerabilitySeverity} from '../enum/VulnerabilitySeverity';
import {IServerResponse} from '../entities/IServerResponse';
import {IVulnerabilityExportPreview} from '../entities/IVulnerabilityExportPreview';
import {
  IHistoricalVulnerabilitiesPreview,
  IRunningVulnerabilitiesPreview
} from '../entities/IRunningVulnerabilitiesPreview';
import {IWorstImageReport} from '../entities/IWorstImageReport';
import {IVulnerabilityDifferenceByDay} from '../entities/IVulnerabilityDifferenceByDay';
import {IReportsCsv} from '../entities/IReportsCsv';


@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  constructor(
    private httpClient: HttpClient,
  ) {}
  readonly baseUrl = '/api/reports';

  getVulnerabilityExport(limit: number, clusterId: number, namespaces?: Array<string>,
                         severityLevels?: Array<VulnerabilitySeverity>, fixAvailable?: boolean, date?: string):
    Observable<IServerResponse<IVulnerabilityExportPreview>> {
    const exportParams = this.buildReportQueryParams(clusterId, {namespaces,
      severityLevels, fixAvailable, limit, date});

    return this.httpClient.get(`${this.baseUrl}/vulnerability-export`, {
      params: exportParams
    });
  }

  downloadVulnerabilityExport(clusterId: number, namespaces?: Array<string>,
                              severityLevels?: Array<VulnerabilitySeverity>, fixAvailable?: boolean, date?: string):
    Observable<IServerResponse<IReportsCsv>> {
    const exportParams = this.buildReportQueryParams(clusterId, {namespaces,
      severityLevels, fixAvailable, date});

    return this.httpClient.get(`${this.baseUrl}/vulnerability-export/download`, {
      params: exportParams
    });
  }

  buildReportQueryParams(clusterId: number,
                         options?: {
                                   namespaces?: Array<string>
                                   severityLevels?: Array<VulnerabilitySeverity>
                                   fixAvailable?: boolean
                                   limit?: number
                                   date?: string
                                   startDate?: string
                                   endDate?: string
                                   compliant?: boolean,
                                   page?: number,
                                 }
                                 ): HttpParams {
    let exportParams = new HttpParams()
      .set('cluster-id', clusterId.toString());
    if (options?.namespaces) {
      options.namespaces.forEach((namespace: string) => {
        exportParams = exportParams.append('namespaces[]', namespace);
      });
    }
    if (options?.severityLevels) {
      options.severityLevels.forEach((severity: VulnerabilitySeverity) => {
        exportParams = exportParams.append('severity[]', severity);
      });
    }
    if (options?.fixAvailable?.toString()) {
      exportParams = exportParams.set('fix-available', options.fixAvailable.toString());
    }
    if (options?.limit) {
      exportParams = exportParams.set('limit', options.limit.toString());
    }
    if (options?.date) {
      exportParams = exportParams.set('date', options.date);
    }
    if (options?.startDate) {
      exportParams = exportParams.set('start-date', options.startDate);
    }
    if (options?.endDate) {
      exportParams = exportParams.set('end-date', options.endDate);
    }
    if (options?.compliant?.toString()) {
      exportParams = exportParams.set('compliant', options.compliant.toString());
    }
    if (options?.page?.toString()) {
      exportParams = exportParams.set('page', options.page.toString());
    }
    return exportParams;
  }

  getRunningVulnerabilities(limit: number, clusterId: number, namespaces?: Array<string>, date?: string, compliant?: boolean, page?: number):
    Observable<IServerResponse<IRunningVulnerabilitiesPreview>> {
    const params = this.buildReportQueryParams(clusterId, {namespaces, limit, date, compliant, page});
    return this.httpClient.get(`${this.baseUrl}/running-vulnerabilities`, {params});
  }

  downloadRunningVulnerabilities(clusterId: number, namespaces?: Array<string>, date?: string, compliant?: boolean):
    Observable<IServerResponse<IReportsCsv>> {
    const exportParams = this.buildReportQueryParams(clusterId, {namespaces, date, compliant});
    return this.httpClient.get(`${this.baseUrl}/running-vulnerabilities/download`, {
      params: exportParams
    });
  }

  getHistoricalVulnerabilities(limit: number, clusterId: number, namespaces?: Array<string>, startDate?: string, endDate?: string):
    Observable<IServerResponse<IHistoricalVulnerabilitiesPreview>> {
    const params = this.buildReportQueryParams(clusterId, {namespaces, limit, startDate, endDate});
    return this.httpClient.get(`${this.baseUrl}/historical-vulnerabilities`, {params});
  }

  getWorstImages(clusterId: number, namespaces?: Array<string>, startDate?: string, endDate?: string):
    Observable<IServerResponse<IWorstImageReport[]>>{
    const params = this.buildReportQueryParams(clusterId, {namespaces, startDate, endDate});
    return this.httpClient.get(`${this.baseUrl}/worst-images`, {params});
  }

  downloadHistoricalVulnerabilities(limit: number, clusterId: number, namespaces?: Array<string>, startDate?: string,
                                    endDate?: string): Observable<IServerResponse<IReportsCsv>> {
    const exportParams = this.buildReportQueryParams(clusterId, {namespaces, limit, startDate, endDate});
    return this.httpClient.get(`${this.baseUrl}/historical-vulnerabilities/download`, {
      params: exportParams
    });
  }

  getVulnerabilityDifferenceByDate(clusterId: number, startDate: string, endDate: string, limit: number, namespaces?: Array<string>,
                                   fixAvailable?: boolean, severityLevels?: Array<VulnerabilitySeverity>)
    : Observable<IServerResponse<IVulnerabilityDifferenceByDay>> {
    const params = this.buildReportQueryParams(clusterId, {startDate, endDate, namespaces,
      fixAvailable, severityLevels, limit});
    return this.httpClient.get<IServerResponse<IVulnerabilityDifferenceByDay>>(`${this.baseUrl}/vulnerability-difference`, {params});
  }

  downloadVulnerabilityDifferenceByDate(clusterId: number, startDate: string, endDate: string, namespaces?: Array<string>,
                                        fixAvailable?: boolean, severityLevels?: Array<VulnerabilitySeverity>)
    : Observable<IServerResponse<IReportsCsv>> {
    const params = this.buildReportQueryParams(clusterId, {startDate, endDate, namespaces,
      fixAvailable, severityLevels});
    return this.httpClient.get<IServerResponse<IReportsCsv>>(`${this.baseUrl}/vulnerability-difference/download`,
      {params});
  }

  generateSimpleSecurityAuditReport(): Observable<any> {
    const url = this.baseUrl.concat('/printable-audit-report');
    return this.httpClient.get(url);
  }
}
