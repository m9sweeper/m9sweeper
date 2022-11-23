import {Component, HostListener, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {AlertService} from '@full-fledged/alerts';
import {UserService} from '../../../../core/services/user.service';
import {CustomValidators} from '../../form-validator/custom-validators';

@Component({
  selector: 'app-user-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit{

  width: number;
  height: number;
  changePasswordForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.changePasswordForm = this.formBuilder.group({
        currentPassword: ['', Validators.required],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      {
        validators:
          CustomValidators.checkPasswordAndConfirmPassword('password', 'confirmPassword')
      });
  }

  ngOnInit(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight - 50;
    this.getScreenHeight(this.height);
  }

  @HostListener('window:resize', ['$event'])
  calculateScreenSize($event?: any) {
    this.scrHeight = window.innerHeight;
    this.getScreenHeight(this.scrHeight);
  }

  set scrHeight(val: number) {
    if (val !== this.height) {
      this.height = val - 50;
    }
  }

  get scrHeight(): number {
    return this.height;
  }

  getScreenHeight(height: number) {
    document.documentElement.style.setProperty('--change-password-container-height', `${height}px`);
  }

  onSubmit() {
    this.userService
      .changeLocalUserPassword(this.changePasswordForm.value)
      .subscribe(response => {
        if (response.data){
          this.alertService.success('Password changed successfully');
          this.router.navigate(['/private']);
        }
      }, event => {
        this.alertService.danger(event.error.message);
      });
  }

}
