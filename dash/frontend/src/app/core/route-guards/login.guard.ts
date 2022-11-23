import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of} from 'rxjs';
import {AlertService} from '@full-fledged/alerts';
import {HttpClient} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {NgxUiLoaderService} from 'ngx-ui-loader';

@Injectable({
  providedIn: 'root'
})

export class LoginGuard implements CanActivate {

  constructor(private alertService: AlertService,
              private httpClient: HttpClient,
              private router: Router,
              private loaderService: NgxUiLoaderService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.httpClient.options('/auth/validate').pipe(map(() => {
      this.router.navigate(['/private']);
      return false;
    }), catchError(err => {
      return of(true);
    }));
  }
}
