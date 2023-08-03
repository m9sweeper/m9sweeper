import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { JwtAuthService } from '../../core/services/jwt-auth.service';
import { ClusterGroupService } from '../../core/services/cluster-group.service';
import { ClusterService } from '../../core/services/cluster.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ITheme } from '../../core/entities/ITheme';
import { ThemeService } from '../../core/services/theme.service';
import {fromEvent, Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, shareReplay, take, takeUntil} from 'rxjs/operators';
import {UpdateUserProfileComponent} from './pages/user/update-user-profile/update-user-profile.component';
import {UserService} from '../../core/services/user.service';
import {UserProfileImageDirective} from '../shared/directives/user-profile-image.directive';
import {NgxUiLoaderConfig, NgxUiLoaderService, POSITION, SPINNER} from 'ngx-ui-loader';
import {AlertService} from '../../core/services/alert.service';
import {DefaultThemes} from '../../core/enum/DefaultThemes';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'app-private',
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.scss']
})
export class PrivateComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  public isHandsetOrXS$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.XSmall])
    .pipe(
      map(result => {
        return result.matches;
      }),
      shareReplay()
    );

  faIcons = {
    bars: faBars
  };

  theme: ITheme;
  allThemes: ITheme[] = [];
  loggedInUserName = null;
  userId: number;
  defaultRouteLink = ['/private', 'dashboard'];
  currentGroupId: number;
  width: number;
  isSmallDevice: boolean;
  isDarkMode: boolean;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild(UserProfileImageDirective) directive = null;
  showSearchBar: boolean;
  isLocalAuthUser = true;
  isAdmin: boolean;


  httpLoaderConfig: NgxUiLoaderConfig = {
    bgsType: SPINNER.threeBounce,
    bgsPosition: POSITION.centerLeft,
  };

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private jwtAuthService: JwtAuthService,
    private dialog: MatDialog,
    private clusterGroupService: ClusterGroupService,
    private clusterService: ClusterService,
    private themeService: ThemeService,
    private userService: UserService,
    private alertService: AlertService,
    private loaderService: NgxUiLoaderService,
  ) {
    this.allThemes.push(...[{name: 'Dark', cssClass: 'dark-theme'}, {name: 'Light', cssClass: 'light-theme'}, {name: 'Default', cssClass: 'default-theme'}]);
    const currentLoggedInUser = this.jwtAuthService.currentUser;
    this.isLocalAuthUser = this.jwtAuthService.isLocalUser();
    this.userId = currentLoggedInUser.id;
    this.isAdmin = this.jwtAuthService.isAdmin();
  }

  ngOnInit(): void {
    this.width = window.innerWidth;
    this.getScreenSize(this.width);
    this.getUserProfile();
    this.defaultLink();
    this.themeService.theme
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe( {
        next: theme => {
          this.isDarkMode = theme.name === 'Dark';
        }
    });

    // 1 check outside the subscription is necessary in case the user refreshes the page since that won't fire a router event
    this.setShowSearchBar();
    this.router.events.pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.setShowSearchBar();
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getUserProfile(){
    this.userService.getUserProfileSetting()
      .pipe(take(1))
      .subscribe( {
        next: response => {
          this.loggedInUserName = `${response.data.firstName} ${response.data.lastName}`;
        }
      });
  }

  @HostListener('window:resize', ['$event'])
  calculateScreenSize($event?: any) {
    this.scrWidth = window.innerWidth;
    this.getScreenSize(this.scrWidth);
  }

  set scrWidth(val: number) {
    if (val !== this.width) {
      this.width = val;
    }
  }

  get scrWidth(): number {
    return this.width;
  }

  getScreenSize(width: number) {
    this.isSmallDevice = width < 500;
  }

  ngAfterViewInit(): void {
    fromEvent<any>(this.searchInput.nativeElement, 'keyup')
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntil(this.unsubscribe$)
      ).subscribe({
      next: res => {
        this.searchClusters(res, this.currentGroupId);
      }
    });
  }

  changeTheme(event: MatSlideToggleChange) {
    this.themeService.changeTheme(this.themeService.getTheme(event.checked ? DefaultThemes.Dark : DefaultThemes.Default));
  }

  userSignOut(){
    this.loaderService.start('logout');
    this.jwtAuthService.clearToken();
    this.router.navigate(['/public/login'])
      .then(() => this.loaderService.stop('logout'));
  }

  defaultLink() {
    this.clusterGroupService.getCurrentGroupId()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: groupId => {
          // Due to JS "magic", nulls are treated as 0 by isNaN()
          if (!isNaN(groupId) && groupId !== null) {
            this.defaultRouteLink = ['/private', 'dashboard', 'group', String(groupId)];
          } else {
            this.defaultRouteLink = ['/private', 'dashboard'];
          }
          this.currentGroupId = groupId;
        }
      });
  }

  // Checks if we are on a page that should display the search bar
  setShowSearchBar(): void {
     this.showSearchBar = !!this.router.url.match(/^\/private\/dashboard\/group\/\d+$/);
  }

  searchClusters(event: KeyboardEvent, groupId: number) {
    const input = this.searchInput.nativeElement.value;
    if (groupId) {
      if (input === '' && event.key !== 'Backspace') {
        this.clusterService.sendData({result: null});
      } else {
        this.clusterService.searchClusters(input, groupId)
          .pipe(take(1))
          .subscribe({
            next: data => {
              this.clusterService.sendData({result: data});
          }
        });
      }
    }
  }

  openUpdateUserProfile() {
    const confirmDialog = this.dialog.open(UpdateUserProfileComponent, {
      width: '500px',
      closeOnNavigation: true,
      disableClose: true,
      data: {}
    });
    confirmDialog.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.getUserProfile();
        }
      });
  }
}
