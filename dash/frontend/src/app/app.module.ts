import { BrowserModule, Title } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { OverlayModule } from '@angular/cdk/overlay';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import {
  NgxUiLoaderModule,
  NgxUiLoaderConfig,
  SPINNER,
  POSITION,
  PB_DIRECTION, NgxUiLoaderHttpModule
} from 'ngx-ui-loader';
import { AlertModule } from '@full-fledged/alerts';
import { HttpJwtInterceptor } from './core/interceptors/http-jwt-interceptor';
import { AlertDialogComponent } from './modules/shared/alert-dialog/alert-dialog.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import {NgxMatFileInputModule} from '@angular-material-components/file-input';
import { UserProfileImageDirective } from './modules/shared/directives/user-profile-image.directive';
import {SiteLogoDirective} from './modules/shared/directives/site-logo.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {DatePipe} from '@angular/common';
import { TablifyPipe } from './core/pipe/tablify.pipe';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: '#326ce5',
  bgsOpacity: 0.5,
  bgsPosition: POSITION.centerCenter,
  bgsSize: 40,
  bgsType: SPINNER.ballScaleMultiple,
  blur: 5,
  delay: 0,
  fastFadeOut: true,
  fgsColor: '#326ce5',
  fgsPosition: POSITION.centerCenter,
  fgsSize: 60,
  fgsType: SPINNER.ballScaleMultiple,
  gap: 24,
  logoPosition: POSITION.centerCenter,
  logoSize: 120,
  logoUrl: '',
  masterLoaderId: 'master',
  overlayBorderRadius: '0',
  overlayColor: 'rgba(40, 40, 40, 0.8)',
  pbColor: '#326ce5',
  pbDirection: PB_DIRECTION.leftToRight,
  pbThickness: 3,
  hasProgressBar: true,
  text: 'Loading...',
  textColor: '#d8d8d8',
  textPosition: POSITION.centerCenter,
  maxTime: -1,
  minTime: 1
};

@NgModule({
  declarations: [
    AppComponent,
    AlertDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    OverlayModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgxUiLoaderHttpModule.forRoot({loaderId: 'http-loader'}),
    AlertModule.forRoot({maxMessages: 1, timeout: 1000 * 3, positionX: 'left'}),
    MatSlideToggleModule,
    MatIconModule,
    MatDialogModule,
    NgxMatFileInputModule,
    FontAwesomeModule,
    InfiniteScrollModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpJwtInterceptor,
      multi: true
    },
    Title,
    DatePipe,
  ],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
