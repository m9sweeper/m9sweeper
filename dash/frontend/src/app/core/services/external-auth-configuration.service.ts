import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExternalAuthConfigurationService {

  constructor(private httpClient: HttpClient) { }

  loadProviderList(): Observable<any> {
    return this.httpClient.get('/auth/sign-on-method/providers');
  }

  createExternalAuth(authBody: any): Observable<any> {
    return this.httpClient.post('/auth/sign-on-method/providers', authBody);
  }
  updateExternalAuth(authBody: any, id: number): Observable<any> {
    return this.httpClient.put(`/auth/sign-on-method/providers/${id}`, authBody);
  }

  // loadStaticProviderList() {
  //   return ['OAUTH', 'LDAP'];
  // }
}
