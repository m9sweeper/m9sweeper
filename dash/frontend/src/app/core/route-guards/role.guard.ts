import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {JwtAuthService} from '../services/jwt-auth.service';
import {AlertService} from '../services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard  {

  constructor(private readonly router: Router,
              private readonly jwtAuthService: JwtAuthService,
              private readonly alertService: AlertService) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const allowedRoles = next.data.allowedUserRoles as string[];
    const currentUserRoles = this.jwtAuthService.currentUserAuthorities as string[];
    const isAllowed = allowedRoles.filter(r => currentUserRoles.includes(r))?.length > 0;
    if (!isAllowed) {
      this.alertService.danger('Permission Denied!');
      if (!this.router.getCurrentNavigation().previousNavigation) {
        this.router.navigate(['private/dashboard']);
      }
    }
    return isAllowed;
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot,
                   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }
}
