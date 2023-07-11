import {NgModule} from '@angular/core';
import {SiteLogoDirective} from './directives/site-logo.directive';
import {RbacDirective} from './directives/rbac.directive';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import { GenericErrorDialogComponent } from './generic-error-dialog/generic-error-dialog.component';
import {DatepickerComponent} from './datepicker-component/datepicker.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {CommonModule} from '@angular/common';
import { CopyToClipboardButtonComponent } from './components/copy-to-clipboard-button/copy-to-clipboard-button.component';
import {MatButtonModule} from '@angular/material/button';
import {SideNavComponent} from './side-nav/side-nav.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {RouterModule, RouterOutlet} from '@angular/router';
import {MatListModule} from '@angular/material/list';

@NgModule({
  declarations: [
    ConfirmationDialogComponent,
    DatepickerComponent,
    GenericErrorDialogComponent,
    RbacDirective,
    SiteLogoDirective,
    CopyToClipboardButtonComponent,
    SideNavComponent,
  ],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatDatepickerModule,
    FormsModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
    MatSidenavModule,
    RouterOutlet,
    RouterModule,
    MatListModule,
  ],
  exports: [
    DatepickerComponent,
    RbacDirective,
    SiteLogoDirective,
    CopyToClipboardButtonComponent,
    SideNavComponent,
  ]
})
export class SharedModule {

}
