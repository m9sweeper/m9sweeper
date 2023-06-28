import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AlertService} from '@full-fledged/alerts';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import { JwtAuthService } from '../services/jwt-auth.service';
import { IServerResponse } from '../entities/IServerResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private readonly router: Router,
    private alertService: AlertService,
    private httpClient: HttpClient,
    private loaderService: NgxUiLoaderService,
    private jwtAuthService: JwtAuthService,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.loaderService.start('auth-guard-loader');
    return this.httpClient.get('/auth/check-status').pipe(
      map((response: IServerResponse<{ loggedIn: boolean }>) => {
        // authentication succeeded
        if (response.data?.loggedIn) {
          this.loaderService.stop('auth-guard-loader');
          return true;
        }

        // authentication failed
        this.authFailed();
        return false;
      }), catchError((err: HttpErrorResponse) => {
        console.log('AuthGuard catch. error:', err);
        this.authFailed();
        return of(false);
      })
    );
  }

  authFailed() {
    this.loaderService.stop('auth-guard-loader');
    this.alertService.danger('Authentication failed!');

    this.loaderService.start('logout');
    this.jwtAuthService.clearToken();
    this.router.navigate(['/public/login'])
      .then(() => this.loaderService.stop('logout'));

    return false;
  }
}
