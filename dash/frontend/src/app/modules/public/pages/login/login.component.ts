import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/api/auth.service';
import { IAuthenticationMethod } from '../../../../core/entities/IAuthenticationMethod';
import { AlertService } from '@full-fledged/alerts';
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IServerResponse } from '../../../../core/entities/IServerResponse';
import { IAuth } from '../../../../core/entities/IAuth';
import { JwtAuthService } from '../../../../core/services/jwt-auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import {NgxUiLoaderService} from 'ngx-ui-loader';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  redirectableAuthenticationMethods: IAuthenticationMethod[] = [];
  inSiteCredentialAuthenticationMethods: IAuthenticationMethod[] = [];
  selectedInSiteCredentialAuthenticationMethod: IAuthenticationMethod;


  loginForm: UntypedFormGroup;

  randomFromNamePostfix: number = Math.random();

  constructor(private authService: AuthService,
              private jwtService: JwtAuthService,
              private alertService: AlertService,
              private formBuilder: UntypedFormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private loaderService: NgxUiLoaderService) { }

  ngOnInit(): void {
    const errorMessage = this.route.snapshot.queryParamMap.get('error_message');
    if (errorMessage){
      this.alertService.danger(errorMessage);
    }
    this.loginForm  =  this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.authService.getAvailableAuthenticationMethods().subscribe((response: IServerResponse<IAuthenticationMethod[]>) => {
      const authenticationMethods = response.data;
      console.log('authenticationMethods: ', authenticationMethods);
      this.inSiteCredentialAuthenticationMethods = authenticationMethods;
      this.selectedInSiteCredentialAuthenticationMethod = this.inSiteCredentialAuthenticationMethods.find(iscam => iscam.type === 'LOCAL_AUTH');
    }, error => {
      this.alertService.danger('Failed to load authentication methods!');
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
    console.log('this.selectedInSiteCredentialAuthenticationMethod: ', this.selectedInSiteCredentialAuthenticationMethod);
    this.loaderService.start('login');
    this.authService.login(
      this.loginForm.value.username,
      this.loginForm.value.password,
      this.selectedInSiteCredentialAuthenticationMethod
    ).subscribe((response: IServerResponse<IAuth>) => {
      this.alertService.success('Login successful');
      const token: string = response.data.accessToken;
      if (token !== null && token.trim() !== '') {
        this.jwtService.saveToken(token);
        this.router.navigate(['/private']).then(() => this.loaderService.stop('login'));
      } else {
        this.loaderService.stop('login');
        console.log('Invalid JWT');
      }
    }, error => {
      console.log('Error: ', error);
      this.loaderService.stop('login');
      this.alertService.danger(error.error.message);
    });

  }
}
