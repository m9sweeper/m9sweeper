import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ITheme } from './core/entities/ITheme';
import { ThemeService } from './core/services/theme.service';
import { Subscription, timer, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OverlayContainer } from '@angular/cdk/overlay';
import { filter } from 'rxjs/operators';
import { JwtAuthService } from './core/services/jwt-auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  theme: ITheme;

  private themeChangeSubscriber: Subscription;
  private unsubscribe$ = new Subject<void>();

  @HostBinding('class') componentCssClass;

  constructor(
    private themeService: ThemeService,
    private overlayContainer: OverlayContainer,
    private titleService: Title,
    private jwtAuthService: JwtAuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const childActivatedRoute = this.getRouteChild(this.activatedRoute);
        childActivatedRoute.data.subscribe(data => {
          this.titleService.setTitle(data.title); });
      });

    this.themeChangeSubscriber = this.themeService.theme.subscribe((currentTheme: ITheme) => {
      this.theme = currentTheme;
    });

    // timer(0, 10000)
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(() => {
    //     if (this.jwtAuthService.isTokenExpired()) {
    //       console.log('rerouting to the login page');
    //       this.jwtAuthService.clearToken();
    //       this.router.navigate(['/login']);
    //     }
    //   });

    console.log('overlayContainer.getContainerElement ===> ', Array.from(this.overlayContainer.getContainerElement().classList));
  }

  ngOnDestroy(): void {
    if (this.themeChangeSubscriber) { this.themeChangeSubscriber.unsubscribe(); }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getRouteChild(activatedRoute: ActivatedRoute) {
    if (activatedRoute.firstChild) {
      return this.getRouteChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

}
