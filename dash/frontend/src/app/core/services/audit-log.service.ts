import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IServerResponse} from '../entities/IServerResponse';
import {IAuditLog} from '../entities/IAuditLog';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  constructor(private httpClient: HttpClient) { }

  getAuditLogs(): Observable<IServerResponse<IAuditLog[]>> {
    return this.httpClient.get(`api/audit-logs`);
  }

  getEntityTypes(): Observable<IServerResponse<{ entityType: string }[]>> {
    return this.httpClient.get('/api/audit-logs/get-entity-types');
  }

  filterAuditLogs(entityType: string, entityId: number): Observable<IServerResponse<IAuditLog[]>> {
    return this.httpClient.get(`api/audit-logs/filter-audit-logs`, {
      params: new HttpParams()
        .set('entity_type', entityType)
        .set('entity_id', entityId)
    });
  }

  downloadAuditLogs(entityType: string, entityId: number): Observable<IServerResponse<{filename: string, content: string}>> {
    return this.httpClient.get(`api/audit-logs/download`, {
      params: new HttpParams()
        .set('entity_type', entityType)
        .set('entity_id', entityId)
    });
  }
}
