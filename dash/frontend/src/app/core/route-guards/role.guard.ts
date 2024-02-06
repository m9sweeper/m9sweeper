import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {inject} from '@angular/core';
import {JwtAuthService} from '../services/jwt-auth.service';
import {AlertService} from '../services/alert.service';

export const RoleGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const router = inject(Router);
  const alertService = inject(AlertService);
  const jwtAuthService = inject(JwtAuthService);
  const allowedRoles = next.data.allowedUserRoles as string[];
  const currentUserRoles = jwtAuthService.currentUserAuthorities as string[];
  const isAllowed = allowedRoles.filter(r => currentUserRoles.includes(r))?.length > 0;
  if (!isAllowed) {
      alertService.danger('Permission Denied!');
      if (!router.getCurrentNavigation().previousNavigation) {
        router.navigate(['private/dashboard']);
      }
    }
  return isAllowed;

};
