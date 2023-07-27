import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { take } from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  templateUrl: './send-reset-password-mail.component.html',
  styleUrls: ['./send-reset-password-mail.component.scss']
})
export class SendResetPasswordMailComponent {

  resetForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private loadingService: NgxUiLoaderService
  ) {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    this.loadingService.start('send-reset-email');
    this.userService
      .sendLocalUserResetPasswordMail(this.resetForm.value)
      .pipe(take(1))
      .subscribe((response) => {
        if (response.data) {
          this.router.navigate(['/public/login']);
          this.snackBar.open('Please check your mailbox', 'Close', { duration: 2000 });
        }
        else {
          this.snackBar.open('Invalid user account.', 'Close', { duration: 2000 });
        }

      }, e => {
        this.snackBar.open(e.error.message, 'Close', { duration: 2000 });
      },
        () => this.loadingService.stop('send-reset-email'));
  }
}
