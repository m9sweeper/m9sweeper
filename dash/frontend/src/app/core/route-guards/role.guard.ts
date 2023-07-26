import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateChild, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {JwtAuthService} from '../services/jwt-auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {

  constructor(private readonly router: Router,
              private readonly jwtAuthService: JwtAuthService,
              private readonly snackBar: MatSnackBar,
              ) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const allowedRoles = next.data.allowedUserRoles as string[];
    const currentUserRoles = this.jwtAuthService.currentUserAuthorities as string[];
    const isAllowed = allowedRoles.filter(r => currentUserRoles.includes(r))?.length > 0;
    if (!isAllowed) {
      this.snackBar.open('Permission Denied!', 'Close');
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
