import {AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable, Subject} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Router} from '@angular/router';
import {IMenuItem} from './interfaces/menu-item.interface';
import {JwtAuthService} from '../../../core/services/jwt-auth.service';
import {IMenuContentTrigger} from './interfaces/menu-content-trigger.interface';
import {Authority, AuthorityValues} from '../../../core/enum/Authority';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements AfterViewInit {
  sidenavExpanded = false;
  @Input() isHandsetOrXS: Observable<boolean>;
  @Input() menuItems: IMenuItem[] = [];
  @Input() contentTriggerButtons: IMenuContentTrigger[] = [];
  @Input() toggleExpandCollapseObservable: Observable<void>;
  @Input() showOrgSettingsButton = true;
  @Output() contentTriggerButtonClicked = new EventEmitter<string>();

  isAdmin: boolean;

  allUserRoles = AuthorityValues;

  constructor(
    private jwtAuthService: JwtAuthService,
    private router: Router,
  ) {
    this.isAdmin = this.jwtAuthService.isAdmin();
  }

  ngAfterViewInit() {
    this.isHandsetOrXS.subscribe(val => {
      console.log('new isHandsetOrXS value', val);
    });
    this.toggleExpandCollapseObservable.subscribe(() => {
      this.toggleExpandCollapse();
    });
  }

  expandSidenav(willBeOpen: boolean) {
    console.log('expandSidenav', willBeOpen);
    this.sidenavExpanded = willBeOpen;
  }
  public toggleExpandCollapse() {
    this.expandSidenav(!this.sidenavExpanded);
  }

  contentTriggerClicked(nameOfTriggeredItem) {
    this.toggleExpandCollapse();
    this.contentTriggerButtonClicked.emit(nameOfTriggeredItem);
  }

  route(path: string | string[]) {
    if (!Array.isArray(path)) {
      path = [path];
    }
    this.router.navigate(path);
  }
}
