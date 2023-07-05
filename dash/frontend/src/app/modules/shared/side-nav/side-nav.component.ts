import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable, Subject} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Router} from '@angular/router';
import {IMenuItems} from './menu-items.interface';
import {JwtAuthService} from '../../../core/services/jwt-auth.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements AfterViewInit {
  sidenavExpanded = true;
  @Input() isHandsetOrXS: Observable<boolean>;
  @Input() menuItems: IMenuItems[];

  isAdmin: boolean;

  constructor(
    private jwtAuthService: JwtAuthService,
    private router: Router,
  ) {
    this.isAdmin = this.jwtAuthService.isAdmin();}

  ngAfterViewInit() {
    this.isHandsetOrXS.subscribe(val => {
      console.log('new isHandsetOrXS value', val);
    });
  }

  expandSidenav(willBeOpen: boolean) {
    this.sidenavExpanded = willBeOpen;
  }
  public toggleExpandCollapse() {
    this.expandSidenav(!this.sidenavExpanded);
  }

  pathToURL(path: string | string[]): string {
    if (!Array.isArray(path)) {
      path = [path];
    }
    console.log('url path', path.join('/'));
    return path.join('/');
  }

  route(path: string | string[]) {
    if (!Array.isArray(path)) {
      path = [path];
    }
    this.router.navigate(path);
  }
}
