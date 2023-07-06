import { ClusterListMenuService } from './cluster-list-menu.service';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import { IMenuItem } from '../../shared/side-nav/interfaces/menu-item.interface';
import { IMenuContentTrigger } from '../../shared/side-nav/interfaces/menu-content-trigger.interface';
import {Router, NavigationStart, Event as NavigationEvent, NavigationEnd, ActivatedRoute} from '@angular/router';
import {Injectable, OnDestroy} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class MenuService implements OnDestroy {
  public currentMenuItems = new BehaviorSubject<IMenuItem[]>([]);
  public currentMenuContentTriggers = new BehaviorSubject<IMenuContentTrigger[]>([]);

  private routerEvent$: Subscription;

  private clusterListMenuItems: IMenuItem[] = [];
  private clusterListMenuContentTriggers: IMenuContentTrigger[] = [];

  constructor(
    private clusterListMenu: ClusterListMenuService,
    private router: Router,
  ) {
    this.updateMenuItems();
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.routerEvent$ = this.router.events.subscribe((event: NavigationEvent) => {
      if (event instanceof NavigationStart) {
        this.updateMenuItems();
      }
    });
    this.clusterListMenu.currentMenuItems.subscribe(newMenuItems => {
      this.clusterListMenuItems = newMenuItems;
    });
    this.clusterListMenu.currentMenuContentTriggers.subscribe(newMenuTriggers => {
      this.clusterListMenuContentTriggers = newMenuTriggers;
    });
  }

  ngOnDestroy() {
    this.currentMenuItems.complete();
    this.currentMenuContentTriggers.complete();

    this.routerEvent$.unsubscribe();
    this.clusterListMenu.currentMenuItems.unsubscribe();
    this.clusterListMenu.currentMenuContentTriggers.unsubscribe();
  }

  updateMenuItems() {
    console.log('current url:', this.router.url);
    const currentURL = this.router.url;
    const menuShouldBeClusterList = this.clusterListMenu.associatedRegexPaths.some(rx => rx.test(currentURL));;
    if (menuShouldBeClusterList) {
      this.currentMenuItems.next(this.clusterListMenuItems);
      this.currentMenuContentTriggers.next(this.clusterListMenuContentTriggers);
    }
  }
}
