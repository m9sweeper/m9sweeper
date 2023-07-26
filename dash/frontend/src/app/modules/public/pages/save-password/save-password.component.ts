// This component is used for account-activation and password-reset
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { CustomValidators } from '../../../private/form-validator/custom-validators';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-change-password',
  templateUrl: './save-password.component.html',
  styleUrls: ['./save-password.component.scss']
})

export class SavePasswordComponent implements OnInit {

  changePasswordForm: FormGroup;
  token: string;
  isAccountActivation: boolean;
  title = 'Reset Password';
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.changePasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      token: JSON.stringify(this.route.snapshot.paramMap.get('token'))
    },
      { validators:
          CustomValidators.checkPasswordAndConfirmPassword('password', 'confirmPassword')});
  }

  ngOnInit(): void {
    this.isAccountActivation = this.router.url.includes('account-activation');
    if (this.isAccountActivation){
      this.title = 'Set Password';
    }
  }

  onSubmit() {

    if (this.isAccountActivation){
      this.userService
        .setLocalUserPassword(this.changePasswordForm.value)
        .subscribe(response => {
          if (response.data) {
            this.snackBar.open('Password set successfully', 'Close');
            this.router.navigate(['/public/login']);
          }
        }, event => {
          this.snackBar.open(event.error.message, 'Close');
        });
    }
    else {
      this.userService
        .resetLocalUserPassword(this.changePasswordForm.value)
        .subscribe(response => {
            if (response.data) {
              this.snackBar.open('Password reset successfully', 'Close');
              this.router.navigate(['/public/login']);
            }
        }, event => {
          this.snackBar.open(event.error.message, 'Close');
        });
    }
  }

}
