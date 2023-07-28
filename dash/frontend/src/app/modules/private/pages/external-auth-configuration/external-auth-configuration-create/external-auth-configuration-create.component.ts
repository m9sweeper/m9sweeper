import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ExternalAuthConfigurationService} from '../../../../../core/services/external-auth-configuration.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IAuthConfig, ILDAPConfigStrategy, IOAUTHConfigStrategy} from '../../../../../core/entities/IAuth';
import {AuthenticationType} from '../../../../../core/enum/AuthenticationType';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-external-auth-configuration-create',
  templateUrl: './external-auth-configuration-create.component.html',
  styleUrls: ['./external-auth-configuration-create.component.scss']
})
export class ExternalAuthConfigurationCreateComponent implements OnInit {
  authenticationType: typeof AuthenticationType = AuthenticationType;
  staticAuthTypeList: any[] = Object.keys(this.authenticationType).map(a => {
    return {label: a, value: this.authenticationType[a]};
  });
  authConfigForm: FormGroup;
  oauthAuthActivated = false;
  ldapAuthActivated = false;
  ldapPasswordHide = true;


  constructor(private dialogRef: MatDialogRef<ExternalAuthConfigurationCreateComponent>,
              private externalAuthConfigurationService: ExternalAuthConfigurationService,
              private formBuilder: FormBuilder,
              private snackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public data: {
                isEdit: boolean;
                authConfigData: IAuthConfig;
              }) {
    this.authConfigForm = this.formBuilder.group({
      authType: ['', Validators.required],
      authName: ['', Validators.required],
      providerType: ['', Validators.required],
      isActive: [false, Validators.nullValidator],
      oauthClientId: [''],
      oauthClientSecret: [''],
      oauthAccessTokenUri: [''],
      oauthAuthorizationUri: [''],
      // oauthRedirectUri: [{disabled: true, value: ''}],
      oauthScopes: [''],
      oauthAllowedDomains: [''],
      ldapUrl: [''],
      ldapUserSearchBase: [''],
      ldapUserNameAttribute: [''],
      adminDn: [''],
      adminPassword: [''],
      defaultUserAuthority: [0],
      groupSearchBase: [''],
      groupClass: [''],
      groupMemberAttribute: [''],
      groupMemberUserAttribute: [''],
      groupAuthLevelAttribute: [''],
      groupViewOnlyAttribute: [''],
      groupAdminAttribute: [''],
      groupSuperAdminAttribute: [''],
    });
  }

  ngOnInit(): void {
    if (this.data.isEdit) {
      this.populateForm();
    }
  }

  activateAuthTypeFields() {
    const authType = this.authConfigForm.get('authType').value;
    if (authType === AuthenticationType.OAUTH2) {
      this.oauthAuthActivated = true;
      this.ldapAuthActivated = false;
      this.authConfigForm.controls.oauthAllowedDomains.setValidators([Validators.required]);
    } else if (authType === AuthenticationType.LDAP) {
      this.oauthAuthActivated = false;
      this.ldapAuthActivated = true;
      this.authConfigForm.controls.oauthAllowedDomains.removeValidators([Validators.required]);
    }
    // Recheck the validity of fields which had validators changed
    this.authConfigForm.controls.oauthAllowedDomains.updateValueAndValidity();
  }

  onOAuthProviderTypeChange($event) {
    if (this.oauthAuthActivated && !this.data.isEdit) {
      switch ($event.value) {
        case 'GOOGLE':
          this.authConfigForm.controls.oauthAccessTokenUri.setValue('https://oauth2.googleapis.com/token');
          this.authConfigForm.controls.oauthAuthorizationUri.setValue('https://accounts.google.com/o/oauth2/v2/auth');
          this.authConfigForm.controls.oauthScopes.setValue('profile,openid,email');
          break;
        case 'AZURE':
          this.authConfigForm.controls.oauthAuthorizationUri.setValue('https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize');
          this.authConfigForm.controls.oauthScopes.setValue('openid');
          break;
      }
    }
  }

  onSubmit() {
    const authConfig = {
      authType: this.authConfigForm.value.authType,
      authName: this.authConfigForm.value.authName,
      providerType: this.authConfigForm.value.providerType,
      authConfig: null,
      isRedirectable: this.authConfigForm.value.authType === AuthenticationType.OAUTH2,
      inSiteCredential: this.authConfigForm.value.authType !== AuthenticationType.OAUTH2,
      isActive: this.authConfigForm.value.isActive
    };

    switch (authConfig.authType) {
      case AuthenticationType.OAUTH2 :
        authConfig.authConfig = authConfig.providerType === 'AZURE' ? ({
          clientId: this.authConfigForm.value.oauthClientId,
          authorizationUri: this.authConfigForm.value.oauthAuthorizationUri,
          scopes: this.stringToArray(this.authConfigForm.value.oauthScopes),
          allowedDomains: this.stringToArray(this.authConfigForm.value.oauthAllowedDomains),
        } as IOAUTHConfigStrategy) : ({
          clientId: this.authConfigForm.value.oauthClientId,
          clientSecret: this.authConfigForm.value.oauthClientSecret,
          accessTokenUri: this.authConfigForm.value.oauthAccessTokenUri,
          authorizationUri: this.authConfigForm.value.oauthAuthorizationUri,
          scopes: this.stringToArray(this.authConfigForm.value.oauthScopes),
          allowedDomains: this.stringToArray(this.authConfigForm.value.oauthAllowedDomains),
        } as IOAUTHConfigStrategy);
        break;
      case AuthenticationType.LDAP :
        authConfig.authConfig = ({
          url: this.authConfigForm.value.ldapUrl,
          userSearchBase: this.authConfigForm.value.ldapUserSearchBase,
          usernameAttribute: this.authConfigForm.value.ldapUserNameAttribute,
          adminDn: this.authConfigForm.value.adminDn,
          adminPassword: this.authConfigForm.value.adminPassword,
          defaultUserAuthority: this.authConfigForm.value.defaultUserAuthority,
          groupSearchBase: this.authConfigForm.value?.groupSearchBase,
          groupClass: this.authConfigForm.value?.groupClass,
          groupMemberAttribute: this.authConfigForm.value?.groupMemberAttribute,
          groupMemberUserAttribute: this.authConfigForm.value?.groupMemberUserAttribute,
          groupAuthLevelAttribute: this.authConfigForm.value?.groupAuthLevelAttribute,
          groupAuthLevelMapping: {
            viewOnly: this.authConfigForm.value?.groupViewOnlyAttribute,
            admin: this.authConfigForm.value?.groupAdminAttribute,
            superAdmin: this.authConfigForm.value?.groupSuperAdminAttribute
          }
        } as ILDAPConfigStrategy);
        break;
      default:
        break;
    }


    if (this.data.isEdit) {
      this.externalAuthConfigurationService.updateExternalAuth(authConfig, this.data.authConfigData.id).subscribe(data => {
          this.dialogRef.close();
      }, error => {
        this.snackBar.open(error.error.message, 'Close', { duration: 2000 });
      });
    } else {
      this.externalAuthConfigurationService.createExternalAuth(authConfig).subscribe(data => {
        this.dialogRef.close();
      }, error => {
        this.snackBar.open(error.error.message, 'Close', { duration: 2000 });
      });
    }
  }

  onNoClick(){
    this.dialogRef.close({cancel : true});
  }

  populateForm() {
    this.authConfigForm.controls.authType.setValue(this.data.authConfigData.authType);
    this.authConfigForm.controls.authName.setValue(this.data.authConfigData.authName);
    this.authConfigForm.controls.providerType.setValue(this.data.authConfigData.providerType);
    this.authConfigForm.controls.isActive.setValue(this.data.authConfigData.isActive);

    switch (this.data.authConfigData.authType) {
      case AuthenticationType.OAUTH2 :
        this.oauthAuthActivated = true;
        this.ldapAuthActivated = false;
        this.authConfigForm.controls.oauthClientId.setValue((this.data.authConfigData.authConfig as IOAUTHConfigStrategy).clientId);

        if (this.data.authConfigData.providerType === 'GOOGLE') {
          this.authConfigForm.controls.oauthClientSecret.setValue((this.data.authConfigData.authConfig as IOAUTHConfigStrategy).clientSecret);
          this.authConfigForm.controls.oauthAccessTokenUri.setValue((this.data.authConfigData.authConfig as IOAUTHConfigStrategy).accessTokenUri);
        }
        this.authConfigForm.controls.oauthAuthorizationUri.setValue((this.data.authConfigData.authConfig as IOAUTHConfigStrategy).authorizationUri);
        this.authConfigForm.controls.oauthScopes.setValue((this.data.authConfigData.authConfig as IOAUTHConfigStrategy).scopes.join(','));
        this.authConfigForm.controls.oauthAllowedDomains.setValue((this.data.authConfigData.authConfig as IOAUTHConfigStrategy).allowedDomains.join(','));
        break;

      case AuthenticationType.LDAP:
        this.oauthAuthActivated = false;
        this.ldapAuthActivated = true;
        const ldapConfig = this.data.authConfigData.authConfig as ILDAPConfigStrategy;
        this.authConfigForm.controls.ldapUrl.setValue(ldapConfig.url);
        this.authConfigForm.controls.ldapUserSearchBase.setValue(ldapConfig.userSearchBase);
        this.authConfigForm.controls.ldapUserNameAttribute.setValue(ldapConfig.usernameAttribute);
        this.authConfigForm.controls.adminDn.setValue(ldapConfig.adminDn);
        this.authConfigForm.controls.adminPassword.setValue(ldapConfig.adminPassword);
        this.authConfigForm.controls.defaultUserAuthority.setValue(ldapConfig.defaultUserAuthority);
        this.authConfigForm.controls.groupSearchBase.setValue(ldapConfig.groupSearchBase);
        this.authConfigForm.controls.groupClass.setValue(ldapConfig.groupClass);
        this.authConfigForm.controls.groupMemberAttribute.setValue(ldapConfig.groupMemberAttribute);
        this.authConfigForm.controls.groupMemberUserAttribute.setValue(ldapConfig.groupMemberUserAttribute);
        this.authConfigForm.controls.groupAuthLevelAttribute.setValue(ldapConfig.groupAuthLevelAttribute);
        this.authConfigForm.controls.groupViewOnlyAttribute.setValue(ldapConfig.groupAuthLevelMapping.viewOnly);
        this.authConfigForm.controls.groupAdminAttribute.setValue(ldapConfig.groupAuthLevelMapping.admin);
        this.authConfigForm.controls.groupSuperAdminAttribute.setValue(ldapConfig.groupAuthLevelMapping.superAdmin);
        break;
    }
  }

  private stringToArray(commaSeparatedList) {
    return commaSeparatedList?.split(',')?.map(item => item.trim().toLowerCase());
  }
}
