import { Component } from '@angular/core';
import {FormBuilder, FormGroup,  Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '@full-fledged/alerts';
import { UserService } from '../../../../core/services/user.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { take } from 'rxjs/operators';

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
    private alertService: AlertService,
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
          this.alertService.success('Please check your mailbox');
        }
        else {
          this.alertService.danger('Invalid user account.');
        }

      }, e => {
        console.log('Error: ', e.error);
        this.alertService.danger(e.error.message);
      },
        () => this.loadingService.stop('send-reset-email'));
  }
}
