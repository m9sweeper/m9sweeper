import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { AboutComponent } from './pages/about/about.component';
import { SignupComponent } from './pages/signup/signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { ExternalAuthCbComponent } from './pages/external-auth-cb/external-auth-cb.component';
import { MatDividerModule } from '@angular/material/divider';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { SendResetPasswordMailComponent } from './pages/send-reset-password-mail/send-reset-password-mail.component';
import { SavePasswordComponent } from './pages/save-password/save-password.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [
    LoginComponent,
    AboutComponent,
    SignupComponent,
    ExternalAuthCbComponent,
    SendResetPasswordMailComponent,
    SavePasswordComponent
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    NgxUiLoaderModule,
    SharedModule
  ]
})
export class PublicModule { }
