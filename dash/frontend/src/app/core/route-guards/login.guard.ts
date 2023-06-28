import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of} from 'rxjs';
import {AlertService} from '@full-fledged/alerts';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import { IServerResponse } from '../entities/IServerResponse';
import { JwtAuthService } from '../services/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private alertService: AlertService,
    private httpClient: HttpClient,
    private router: Router,
    private jwtAuthService: JwtAuthService,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.httpClient.get('/auth/check-status').pipe(
      map((response: IServerResponse<{ loggedIn: boolean }>) => {
        if (response.data?.loggedIn) {
          this.router.navigate(['/private']);
          return false;
        }
        this.jwtAuthService.clearToken();
        return true;
      }), catchError((err: HttpErrorResponse) => {
        console.log('LoginGuard catch. error:', err);
        return of(true);
      })
    );
  }

}
