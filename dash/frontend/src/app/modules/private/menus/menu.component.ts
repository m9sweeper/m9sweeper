import { ClusterListMenuService } from './services/cluster-list-menu.service';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import { IMenuItem } from '../../shared/side-nav/interfaces/menu-item.interface';
import { IMenuContentTrigger } from '../../shared/side-nav/interfaces/menu-content-trigger.interface';
import {Router, NavigationStart, Event as NavigationEvent, NavigationEnd, ActivatedRoute} from '@angular/router';
import {Component, Injectable, OnDestroy} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map, shareReplay} from 'rxjs/operators';


@Component({
  selector: 'app-menu-component',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnDestroy {
  public currentMenuItems: IMenuItem[] = [];
  public currentMenuContentTriggers: IMenuContentTrigger[] = [];

  public isHandsetOrXS$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.XSmall])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  private routerEvent$: Subscription;
  toggleMenuExpansionEvents: Subject<void> = new Subject<void>();

  private clusterListMenuItems: IMenuItem[] = [];
  private clusterListMenuContentTriggers: IMenuContentTrigger[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
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
  }

  ngOnDestroy() {
    this.routerEvent$.unsubscribe();
    this.unsubscribeFromAll();
  }

  unsubscribeFromAll() {
    this.clusterListMenu.currentMenuItems.unsubscribe();
    this.clusterListMenu.currentMenuContentTriggers.unsubscribe();
  }

  toggleMenuExpansion() {
    this.toggleMenuExpansionEvents.next();
  }

  updateMenuItems() {
    const currentURL = this.router.url;
    const menuShouldBeClusterList = this.clusterListMenu.associatedRegexPaths.some(rx => rx.test(currentURL));;
    if (menuShouldBeClusterList) {
      this.useClusterListMenu();
    }
  }

  useClusterListMenu() {
    this.clusterListMenu.currentMenuItems.subscribe(newMenuItems => {
      this.currentMenuItems = newMenuItems;
      console.log('updated currentMenuItems', this.currentMenuItems, this.currentMenuContentTriggers);
    });
    this.clusterListMenu.currentMenuContentTriggers.subscribe(newMenuTriggers => {
      this.currentMenuContentTriggers = newMenuTriggers;
      console.log('updated currentMenuContentTriggers', this.currentMenuItems, this.currentMenuContentTriggers);
    });
  }

  callMenuContentTriggerCallback(contentTriggerName: string) {
    const triggeredItem = this.currentMenuContentTriggers.find(element => element.name = contentTriggerName);
    triggeredItem.callback(this);
  }
}
