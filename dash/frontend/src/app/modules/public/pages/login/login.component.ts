import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/api/auth.service';
import { IAuthenticationMethod } from '../../../../core/entities/IAuthenticationMethod';
import { MatSelectChange } from '@angular/material/select';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { IServerResponse } from '../../../../core/entities/IServerResponse';
import { IAuth } from '../../../../core/entities/IAuth';
import { JwtAuthService } from '../../../../core/services/jwt-auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {take} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  redirectableAuthenticationMethods: IAuthenticationMethod[] = [];
  inSiteCredentialAuthenticationMethods: IAuthenticationMethod[] = [];
  selectedInSiteCredentialAuthenticationMethod: IAuthenticationMethod;


  loginForm: FormGroup;

  randomFromNamePostfix: number = Math.random();

  constructor(private authService: AuthService,
              private jwtService: JwtAuthService,
              private snackBar: MatSnackBar,
              private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private loaderService: NgxUiLoaderService) { }

  ngOnInit(): void {
    const errorMessage = this.route.snapshot.queryParamMap.get('error_message');
    if (errorMessage){
      this.snackBar.open(errorMessage, 'Close', { duration: 2000 });
    }
    this.loginForm  =  this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.authService.getAvailableAuthenticationMethods().subscribe((response: IServerResponse<IAuthenticationMethod[]>) => {
      const authenticationMethods = response.data;
      this.inSiteCredentialAuthenticationMethods = authenticationMethods;
      this.selectedInSiteCredentialAuthenticationMethod = this.inSiteCredentialAuthenticationMethods.find(iscam => iscam.type === 'LOCAL_AUTH');
    }, error => {
      this.snackBar.open('Failed to load authentication methods!', 'Close', { duration: 2000 });
    }, () => {
    });
  }

  onInSiteAuthMethodSelection(event: MatSelectChange) {
    this.selectedInSiteCredentialAuthenticationMethod = (event.value as IAuthenticationMethod);
    if (this.selectedInSiteCredentialAuthenticationMethod.type === 'LOCAL_AUTH') {
      this.loginForm.get('username').setValidators([Validators.required, Validators.email]);
      this.loginForm.get('username').updateValueAndValidity();
    } else if (this.selectedInSiteCredentialAuthenticationMethod.type === 'LDAP') {
      this.loginForm.get('username').clearValidators();
      this.loginForm.get('username').setValidators([Validators.required]);
      this.loginForm.get('username').updateValueAndValidity();
    }
    this.loginForm.reset();
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    this.loaderService.start('login');
    this.authService.login(
      this.loginForm.value.username,
      this.loginForm.value.password,
      this.selectedInSiteCredentialAuthenticationMethod
    ).pipe(take(1)).subscribe((response: IServerResponse<IAuth>) => {
      this.snackBar.open('Login successful', 'Close', { duration: 2000 });
      const token: string = response.data.accessToken;
      if (token !== null && token.trim() !== '') {
        this.jwtService.saveToken(token);
        this.router.navigate(['/private']).then(() => this.loaderService.stop('login'));
      } else {
        this.loaderService.stop('login');
      }
    }, error => {
      this.loaderService.stop('login');
      this.snackBar.open(error.error.message, 'Close', { duration: 2000 });
    });

  }
}
