import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {IMenuItem} from './interfaces/menu-item.interface';
import {JwtAuthService} from '../../../core/services/jwt-auth.service';
import {IMenuContentTrigger} from './interfaces/menu-content-trigger.interface';
import {AuthorityValues} from '../../../core/enum/Authority';
import {MatSidenav} from '@angular/material/sidenav';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements AfterViewInit {
  @Input() isHandsetOrXSObservable: Observable<boolean>;
  @Input() menuItems: IMenuItem[] = [];
  @Input() contentTriggerButtons: IMenuContentTrigger[] = [];
  @Input() toggleSidenavObservable: Observable<void>;
  @Input() showOrgSettingsButton = true;
  @Input() showReturnHomeButton = true;
  @Output() contentTriggerButtonClicked = new EventEmitter<string>();

  @ViewChild(MatSidenav) sidenav: MatSidenav;

  isHandsetOrXS: boolean;
  sidenavExpanded = false;
  isAdmin: boolean;

  allUserRoles = AuthorityValues;

  constructor(
    private jwtAuthService: JwtAuthService,
    private router: Router,
  ) {
    this.isAdmin = this.jwtAuthService.isAdmin();
  }

  ngAfterViewInit() {
    this.isHandsetOrXSObservable.subscribe((newIsHandsetOrXS) => {
      this.isHandsetOrXS = newIsHandsetOrXS;
    });
    this.toggleSidenavObservable.subscribe(() => {
      this.toggleSidenav();
    });
  }

  public toggleSidenav() {
    if (this.isHandsetOrXS) {
      this.sidenav.toggle().then();
    }
  }

  contentTriggerClicked(nameOfTriggeredItem) {
    this.toggleSidenav();
    this.contentTriggerButtonClicked.emit(nameOfTriggeredItem);
  }

  route(path: string | string[]) {
    if (!Array.isArray(path)) {
      path = [path];
    }
    this.router.navigate(path);
  }
}
