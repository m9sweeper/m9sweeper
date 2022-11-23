import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AlertService} from '@full-fledged/alerts';
import {HttpClient} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {NgxUiLoaderService} from 'ngx-ui-loader';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private readonly router: Router,
              private alertService: AlertService,
              private httpClient: HttpClient,
              private loaderService: NgxUiLoaderService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.loaderService.start('auth-guard-loader');
    return this.httpClient.options('/auth/validate').pipe(map(() => {
      this.loaderService.stop('auth-guard-loader');
      return true;
    }), catchError(err => {
      this.loaderService.stop('auth-guard-loader');
      this.alertService.danger('Authentication failed!');
      this.router.navigate(['public/login']);
      return of(false);
    }));
  }
}
