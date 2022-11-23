import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/route-guards/auth.guard';


const routes: Routes = [
  { path: '', redirectTo: 'public', pathMatch: 'full' },
  { path: 'public', loadChildren: () => import('./modules/public/public.module').then(m => m.PublicModule) },
  { path: 'private', canActivate: [AuthGuard], loadChildren: () => import('./modules/private/private.module').then(m => m.PrivateModule) },
  { path: '**', redirectTo: 'public'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule]
})
export class AppRoutingModule {

  constructor() {

  }
}
