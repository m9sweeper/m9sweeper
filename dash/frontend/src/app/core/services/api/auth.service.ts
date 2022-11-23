import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {IServerResponse} from '../../entities/IServerResponse';
import {IAuthenticationMethod} from '../../entities/IAuthenticationMethod';
import {IAuth} from '../../entities/IAuth';
import {AuthenticationType} from '../../enum/AuthenticationType';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient) { }

  getAvailableAuthenticationMethods(): Observable<IServerResponse<IAuthenticationMethod[]>> {
    return this.httpClient.get('/auth/available-providers');
  }

  login(username: string, password: string, authenticationMethodology: IAuthenticationMethod): Observable<IServerResponse<IAuth>> {
    if ([AuthenticationType.LDAP, AuthenticationType.LOCAL].includes(authenticationMethodology.type)) {
      return this.httpClient.post(authenticationMethodology.requestHandlerPath, {username, password});
    }
    return throwError(new Error('Invalid authentication method'));
  }
}
