import { BrowserModule, Title } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
import { HttpJwtInterceptor } from './core/interceptors/http-jwt-interceptor';
import { AlertDialogComponent } from './modules/shared/alert-dialog/alert-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {DatePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';

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
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FontAwesomeModule,
    HttpClientModule,
    InfiniteScrollModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,  // can't be lazy-loaded (needed in modules that may not be active at call-time)
    MatSlideToggleModule,
    NgxUiLoaderHttpModule.forRoot({loaderId: 'http-loader'}),
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    OverlayModule,
    MatSnackBarModule,
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
