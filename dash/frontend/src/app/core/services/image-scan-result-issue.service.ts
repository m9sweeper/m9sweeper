import { HttpClient , HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';
import { IImageScanResultIssue } from '../entities/IImageScanResultIssue';
import { MatSort } from '@angular/material/sort';
import {ReportsCsvDto} from '../../../../../backend/src/modules/reports/dto/reports-csv-dto';

@Injectable({
  providedIn: 'root'
})
export class ImageScanResultIssueService {

  constructor(private httpClient: HttpClient) {
  }

  getCountOfImageScanResultsIssues(id: number, all: number): Observable<IServerResponse<number>> {
    return this.httpClient.get(`/api/images/scan/issues/count/${id}`, {
      params: new HttpParams().set('all', String(all))
    });
  }

  getImageScanResultsIssues(imageScanResultsId: number, scanDate: number, all: boolean, page: number, limit: number,
                            sort: MatSort, policyId?: number): Observable<IServerResponse<{totalCount: number, list: IImageScanResultIssue[]}>> {
    const url = `/api/images/scan/issues/${imageScanResultsId}`;
    let params = new HttpParams()
      .set('scanDate', String(scanDate))
      .set('page', String(page))
      .set('limit', String(limit))
      .set('sort[field]', sort.active)
      .set('sort[direction]', sort.direction)
      .set('all', all ? '1' : '0');
    if (policyId) {
      params = params.set('policyId', String(policyId));
    }
    return this.httpClient.get(url, { params });
  }

  getImageScanResultsIssuesCsv(imageId: number, imageScanResultsId: number, scanDate: number, all: boolean,
                               sort: MatSort, policyId: number): Observable<IServerResponse<ReportsCsvDto>> {
    const url = `/api/images/scan/issues/${imageScanResultsId}/download`;
    const params = new HttpParams()
      .set('imageId', String(imageId))
      .set('scanDate', String(scanDate))
      .set('sort[field]', sort.active)
      .set('sort[direction]', sort.direction)
      .set('all', all ? '1' : '0')
      .set('policyId', String(policyId));
    return this.httpClient.get(url, { params });
  }
}
