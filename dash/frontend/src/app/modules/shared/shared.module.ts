import {NgModule} from '@angular/core';
import {SiteLogoDirective} from './directives/site-logo.directive';
import {RbacDirective} from './directives/rbac.directive';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import { GenericErrorDialogComponent } from './generic-error-dialog/generic-error-dialog.component';
import {DatepickerComponent} from './datepicker-component/datepicker.component';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {FormsModule} from '@angular/forms';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {CommonModule} from '@angular/common';
import { CopyToClipboardButtonComponent } from './components/copy-to-clipboard-button/copy-to-clipboard-button.component';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';

@NgModule({
  declarations: [
    ConfirmationDialogComponent,
    DatepickerComponent,
    GenericErrorDialogComponent,
    RbacDirective,
    SiteLogoDirective,
    CopyToClipboardButtonComponent,
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
  ],
  exports: [
    DatepickerComponent,
    RbacDirective,
    SiteLogoDirective,
    CopyToClipboardButtonComponent,
  ]
})
export class SharedModule {

}
