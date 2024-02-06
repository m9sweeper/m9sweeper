import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {inject} from '@angular/core';
import {catchError, map} from 'rxjs/operators';
import {IServerResponse} from '../entities/IServerResponse';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {JwtAuthService} from '../services/jwt-auth.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {AlertService} from '../services/alert.service';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot

): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const loaderService = inject(NgxUiLoaderService);
  const httpClient = inject(HttpClient);
  const alertService = inject(AlertService);
  const jwtAuthService = inject(JwtAuthService);
  const router = inject(Router);
  loaderService.start('auth-guard-loader');

  function authFailed() {
    loaderService.stop('auth-guard-loader');
    alertService.danger('Authentication failed!');
    loaderService.start('logout');
    jwtAuthService.clearToken();
    router.navigate(['/public/login'])
      .then(() => loaderService.stop('logout'));

    return false;
  }

  return httpClient.get('/auth/check-status').pipe(
    map((response: IServerResponse<{ loggedIn: boolean }>) => {
      // authentication succeeded
      if (response.data?.loggedIn) {
        loaderService.stop('auth-guard-loader');
        return true;
      }

      // authentication failed
      authFailed();
      return false;
    }), catchError((err: HttpErrorResponse) => {
      if (!environment.production) {
        console.log('AuthGuard catch. error:', err);
      }
      authFailed();
      return of(false);
    })
  );

};
