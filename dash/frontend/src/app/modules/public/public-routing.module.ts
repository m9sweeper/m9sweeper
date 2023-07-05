import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {ExternalAuthCbComponent} from './pages/external-auth-cb/external-auth-cb.component';
import { SendResetPasswordMailComponent } from './pages/send-reset-password-mail/send-reset-password-mail.component';
import { SavePasswordComponent } from './pages/save-password/save-password.component';
import { LoginGuard } from '../../core/route-guards/login.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', canActivate: [LoginGuard], component: LoginComponent },
  { path: 'login-error', component: LoginComponent },
  { path: 'external-auth/:code', canActivate: [LoginGuard], component: ExternalAuthCbComponent },
  { path: 'reset-password', canActivate: [LoginGuard], component: SendResetPasswordMailComponent },
  { path: 'reset-password/:token', canActivate: [LoginGuard], component: SavePasswordComponent },
  { path: 'account-activation/:token', canActivate: [LoginGuard], component: SavePasswordComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
