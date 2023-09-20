import {Injectable, OnDestroy} from '@angular/core';
import {NavServiceInterface} from './nav-service.interface';
import {IMenuItem} from '../../../shared/side-nav/interfaces/menu-item.interface';
import {IMenuContentTrigger} from '../../../shared/side-nav/interfaces/menu-content-trigger.interface';
import {BehaviorSubject} from 'rxjs';
import {Authority} from '../../../../core/enum/Authority';

@Injectable({
  providedIn: 'root'
})
export class SettingsMenuService implements NavServiceInterface, OnDestroy {
  menuItems: IMenuItem[];
  menuContentTriggers: IMenuContentTrigger[];


  public associatedRegexPaths = [
    new RegExp('^(/private)(.*)'),
  ];
  public currentMenuItems = new BehaviorSubject<IMenuItem[]>([]);
  public currentMenuContentTriggers = new BehaviorSubject<IMenuContentTrigger[]>([]);
  public showOrgSettingsButton = false;
  public showReturnHomeButton = true;

  constructor() {
    this.buildMenu();
  }

  ngOnDestroy() {
    this.currentMenuItems.complete();
    this.currentMenuContentTriggers.complete();
  }

  buildMenu() {
    this.menuItems = [
      {
        name: 'Users',
        path: ['/private', 'users'],
        icon: 'folder_shared',
        allowedRoles: [Authority.ADMIN, Authority.SUPER_ADMIN],
      },
      {
        name: 'Policies',
        path: ['/private', 'policies'],
        icon: 'assignment_turned_in',
      },
      {
        name: 'Exceptions',
        path: ['/private', 'exceptions'],
        icon: 'assignment_late',
      },
      {
        name: 'Sign on Methods',
        path: ['/private', 'single-sign-on'],
        icon: 'vpn_key',
        allowedRoles: [Authority.ADMIN, Authority.SUPER_ADMIN],
      },
      {
        name: 'Docker Registries',
        path: ['/private', 'docker-registries'],
        icon: 'shopping_basket',
      },
      {
        name: 'API Key Management',
        path: ['/private', 'api-key'],
        icon: 'code',
        allowedRoles: [Authority.SUPER_ADMIN],
      },
      {
        name: 'Audit Logs',
        path: ['/private', 'audit-logs'],
        icon: 'fingerprint',
        allowedRoles: [Authority.SUPER_ADMIN],
      },
      {
        name: 'Falco Settings',
        path: ['/private', 'falco'],
        image: {
          src: '/assets/images/falco-icon-black.png',
          alt: 'Falco Logo',
          classes: 'falco-img',
        },
      },
    ];
    this.currentMenuItems.next(this.menuItems);
  }
}
