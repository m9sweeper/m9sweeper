import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {inject} from '@angular/core';
import {catchError, map} from 'rxjs/operators';
import {IServerResponse} from '../entities/IServerResponse';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {JwtAuthService} from '../services/jwt-auth.service';

export const LoginGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const httpClient = inject(HttpClient);
  const jwtAuthService = inject(JwtAuthService);
  const router = inject(Router);
  return httpClient.get('/auth/check-status').pipe(
      map((response: IServerResponse<{ loggedIn: boolean }>) => {
        if (response.data?.loggedIn) {
          router.navigate(['/private']);
          return false;
        }
        jwtAuthService.clearToken();
        return true;
      }), catchError((err: HttpErrorResponse) => {
        if (!environment.production) {
          console.log('LoginGuard catch. error:', err);
        }
        return of(true);
      })
    );

};
