import {Injectable, OnDestroy} from '@angular/core';
import {NavServiceInterface} from './nav-service.interface';
import {IMenuItem} from '../../../shared/side-nav/interfaces/menu-item.interface';
import {IMenuContentTrigger} from '../../../shared/side-nav/interfaces/menu-content-trigger.interface';
import {BehaviorSubject} from 'rxjs';

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
        name: 'Organization',
        path: ['/private', 'settings'],
        icon: 'settings',
      },
      {
        name: 'Users',
        path: ['/private', 'users'],
        icon: 'folder_shared',
      },
      {
        name: 'Licenses',
        path: ['/private', 'licenses'],
        icon: 'lock_open',
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
      },
      {
        name: 'Audit Logs',
        path: ['/private', 'audit-logs'],
        icon: 'fingerprint',
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
