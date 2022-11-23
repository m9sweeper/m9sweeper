import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {IServerResponse} from '../entities/IServerResponse';
import {IScanner} from '../entities/IScanner';


@Injectable({
  providedIn: 'root'
})
export class ScannerService {
  // private subject = new Subject<any>();

  constructor( private httpClient: HttpClient ) { }

  getAllScanners(): Observable<IServerResponse<IScanner[]>> {
    return this.httpClient.get(`/api/scanners`);
  }
  getAllScannersByPolicyId(policyId: number): Observable<IServerResponse<IScanner[]>> {
    return this.httpClient.get(`/api/scanners/policy/${policyId}`);
  }
  createScanner(scanner: IScanner): Observable<IServerResponse<IScanner>> {
    return this.httpClient.post('/api/scanners', scanner);
  }
  updateScanner(scanner: IScanner, id: number): Observable<IServerResponse<IScanner>> {
    return this.httpClient.put(`/api/scanners/${id}`, scanner);
  }
  deleteScannerById(id: number): Observable<IServerResponse<number>>{
    return this.httpClient.delete(`/api/scanners/${id}`);
}
  // sendData(message: string) {
  //   this.subject.next(message);
  // }
  //
  // clearData() {
  //   this.subject.next();
  // }
  //
  // getData(): Observable<any> {
  //   return this.subject.asObservable();
  // }
}
