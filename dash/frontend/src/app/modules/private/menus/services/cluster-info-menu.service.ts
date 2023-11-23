import {Injectable, OnDestroy} from '@angular/core';
import {NavServiceInterface} from './nav-service.interface';
import {IMenuItem} from '../../../shared/side-nav/interfaces/menu-item.interface';
import {IMenuContentTrigger} from '../../../shared/side-nav/interfaces/menu-content-trigger.interface';
import {BehaviorSubject, Subscription} from 'rxjs';
import {Event as NavigationEvent, NavigationEnd, Router} from '@angular/router';
import {Authority} from '../../../../core/enum/Authority';

@Injectable({
  providedIn: 'root'
})
export class ClusterInfoMenuService implements NavServiceInterface, OnDestroy {
  menuItems: IMenuItem[];
  menuContentTriggers: IMenuContentTrigger[];

  public associatedRegexPaths = [
    new RegExp('^(/private/clusters/)(.*)'),
  ];
  public currentMenuItems = new BehaviorSubject<IMenuItem[]>([]);
  public currentMenuContentTriggers = new BehaviorSubject<IMenuContentTrigger[]>([]);
  public showOrgSettingsButton = false;
  public showReturnHomeButton = true;

  private routerEvent$: Subscription;
  clusterId;
  constructor(
    private router: Router,
  ) {
    this.getClusterId();
    this.buildMenu();
    this.routerEvent$ = this.router.events.subscribe((event: NavigationEvent) => {
      if (event instanceof NavigationEnd) {
        this.getClusterId();
        this.buildMenu();
      }
    });
  }

  getClusterId() {
    const urlParts = this.router.url.split('/');
    if (urlParts.length > 2 && urlParts[2] === 'clusters') {
      this.clusterId = urlParts[3];
    }
  }

  ngOnDestroy() {
    this.currentMenuItems.complete();
    this.currentMenuContentTriggers.complete();
  }

  buildMenu() {
    this.menuItems = [
      {
        name: 'Summary',
        path: ['/private', 'clusters', `${this.clusterId}`, 'summary'],
        icon: 'graphic_eq',
      },
      {
        name: 'Cluster Info',
        path: ['/private', 'clusters', `${this.clusterId}`, 'info'],
        icon: 'info',
      },
      {
        name: 'Images',
        path: ['/private', 'clusters', `${this.clusterId}`, 'images'],
        icon: 'insert_photo',
      },
      {
        name: 'Workloads',
        path: ['/private', 'clusters', `${this.clusterId}`, 'kubernetes-namespaces'],
        icon: 'network_check',
      },
      {
        name: 'Gatekeeper',
        path: ['/private', 'clusters', `${this.clusterId}`, 'gatekeeper'],
        image: {
          src: '/assets/images/opa-icon-black.png',
          alt: 'GateKeeper Logo',
        },
      },
      {
        name: 'Kubesec',
        path: ['/private', 'clusters', `${this.clusterId}`, 'kubesec'],
        image: {
          src: '/assets/images/kubesec-logo.png',
          alt: 'Kubesec Logo',
        },
      },
      {
        name: 'kube-hunter',
        path: ['/private', 'clusters', `${this.clusterId}`, 'kubehunter'],
        image: {
          src: '/assets/images/kube-hunter-logo.png',
          alt: 'kube-hunter Logo',
        },
      },
      {
        name: 'kube-bench',
        path: ['/private', 'clusters', `${this.clusterId}`, 'kubebench'],
        image: {
          src: '/assets/images/kube-bench-logo.png',
          alt: 'kube-bench Logo',
        },
      },
      {
        name: 'Falco',
        path: ['/private', 'clusters', `${this.clusterId}`, 'falco'],
        image: {
          src: '/assets/images/falco-icon-black.png',
          alt: 'Falco Logo',
        },
      },
      {
        name: 'Reports',
        path: ['/private', 'clusters', `${this.clusterId}`, 'reports'],
        icon: 'feed',
      },
      {
        name: 'Snyk',
        path: ['/private', 'clusters', `${this.clusterId}`, 'reports'],
        image: {
          src: '/assets/images/snyk-logo.png',
          alt: 'Snyk Logo',
        },
      },
    ];
    this.currentMenuItems.next(this.menuItems);
  }

}
