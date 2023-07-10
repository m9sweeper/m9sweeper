import { ClusterListMenuService } from './services/cluster-list-menu.service';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import { IMenuItem } from '../../shared/side-nav/interfaces/menu-item.interface';
import { IMenuContentTrigger } from '../../shared/side-nav/interfaces/menu-content-trigger.interface';
import {Router, NavigationStart, Event as NavigationEvent, NavigationEnd, ActivatedRoute} from '@angular/router';
import {Component, Injectable, OnDestroy} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map, shareReplay} from 'rxjs/operators';
import {SettingsMenuService} from './services/settings-menu.service';
import {ClusterInfoMenuService} from './services/cluster-info-menu.service';


@Component({
  selector: 'app-menu-component',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnDestroy {
  public currentMenuItems: IMenuItem[] = [];
  public currentMenuContentTriggers: IMenuContentTrigger[] = [];
  public showOrgSettingsButton = true;

  public isHandsetOrXS$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.XSmall])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  private routerEvent$: Subscription;
  toggleMenuExpansionEvents: Subject<void> = new Subject<void>();

  private clusterListMenuItems: IMenuItem[] = [];
  private clusterListMenuContentTriggers: IMenuContentTrigger[] = [];

  menuOptions = {
    clusterList: 'cluster-list',
    clusterInfo: 'cluster-info',
    settings: 'settings',
  };
  currentMenuToUse = this.menuOptions.settings;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private clusterListMenu: ClusterListMenuService,
    private clusterInfoMenu: ClusterInfoMenuService,
    private router: Router,
    private settingsMenu: SettingsMenuService,
  ) {
    this.updateMenuItems();
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.routerEvent$ = this.router.events.subscribe((event: NavigationEvent) => {
      if (event instanceof NavigationEnd) {
        this.updateMenuItems();
      }
    });
    this.instantiateClusterListMenuSubscriptions();
    this.instantiateClusterInfoMenuSubscriptions();
    this.instantiateSettingsMenuSubscriptions();
  }

  ngOnDestroy() {
    this.routerEvent$.unsubscribe();
    this.unsubscribeFromAll();
  }

  unsubscribeFromAll() {
    this.clusterListMenu.currentMenuItems.unsubscribe();
    this.clusterListMenu.currentMenuContentTriggers.unsubscribe();
    this.settingsMenu.currentMenuItems.unsubscribe();
    this.settingsMenu.currentMenuContentTriggers.unsubscribe();
  }

  toggleMenuExpansion() {
    this.toggleMenuExpansionEvents.next();
  }

  updateMenuItems() {
    const currentURL = this.router.url;
    const menuShouldBeClusterList = this.clusterListMenu.associatedRegexPaths.some(rx => rx.test(currentURL));
    const menuShouldBeClusterInfo = this.clusterInfoMenu.associatedRegexPaths.some(rx => rx.test(currentURL));
    if (menuShouldBeClusterList) {
      this.currentMenuToUse = this.menuOptions.clusterList;
      this.currentMenuItems = this.clusterListMenu.currentMenuItems.getValue();
      this.currentMenuContentTriggers = this.clusterListMenu.currentMenuContentTriggers.getValue();
      this.showOrgSettingsButton = this.clusterListMenu.showOrgSettingsButton;
    } else if (menuShouldBeClusterInfo) {
      this.currentMenuToUse = this.menuOptions.clusterInfo;
      this.currentMenuItems = this.clusterInfoMenu.currentMenuItems.getValue();
      this.currentMenuContentTriggers = this.clusterInfoMenu.currentMenuContentTriggers.getValue();
      this.showOrgSettingsButton = this.clusterInfoMenu.showOrgSettingsButton;
    } else {
      this.currentMenuToUse = this.menuOptions.settings;
      this.currentMenuItems = this.settingsMenu.currentMenuItems.getValue();
      this.currentMenuContentTriggers = this.settingsMenu.currentMenuContentTriggers.getValue();
      this.showOrgSettingsButton = this.settingsMenu.showOrgSettingsButton;
    }
  }

  instantiateClusterListMenuSubscriptions() {
    this.clusterListMenu.currentMenuItems.subscribe(newMenuItems => {
      if (this.currentMenuToUse === this.menuOptions.clusterList) {
        this.currentMenuItems = newMenuItems;
      }
    });
    this.clusterListMenu.currentMenuContentTriggers.subscribe(newMenuTriggers => {
      if (this.currentMenuToUse === this.menuOptions.clusterList) {
        this.currentMenuContentTriggers = newMenuTriggers;
      }
    });
  }

  instantiateClusterInfoMenuSubscriptions() {
    this.clusterInfoMenu.currentMenuItems.subscribe(newMenuItems => {
      if (this.currentMenuToUse === this.menuOptions.clusterInfo) {
        this.currentMenuItems = newMenuItems;
      }
    });
    this.clusterInfoMenu.currentMenuContentTriggers.subscribe(newMenuTriggers => {
      if (this.currentMenuToUse === this.menuOptions.clusterInfo) {
        this.currentMenuContentTriggers = newMenuTriggers;
      }
    });
  }

  instantiateSettingsMenuSubscriptions() {
    this.settingsMenu.currentMenuItems.subscribe(newMenuItems => {
      if (this.currentMenuToUse === this.menuOptions.settings) {
        this.currentMenuItems = newMenuItems;
      }
    });
    this.settingsMenu.currentMenuContentTriggers.subscribe(newMenuTriggers => {
      if (this.currentMenuToUse === this.menuOptions.settings) {
        this.currentMenuContentTriggers = newMenuTriggers;
      }
    });
  }

  callMenuContentTriggerCallback(contentTriggerName: string) {
    const triggeredItem = this.currentMenuContentTriggers.find(element => element.name = contentTriggerName);
    switch (this.currentMenuToUse) {
      case this.menuOptions.clusterList:
        // return this.clusterListMenu[triggeredItem.callback];
        // return triggeredItem.callback(ClusterListMenuService);
        return triggeredItem.callback(this.clusterListMenu);
      case this.menuOptions.clusterInfo:
        return triggeredItem.callback(this.clusterInfoMenu);
      default:
        return triggeredItem.callback(this.settingsMenu);
    }
  }
}
