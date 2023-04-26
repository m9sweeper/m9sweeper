import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ExternalAuthConfigurationService} from '../../../../../core/services/external-auth-configuration.service';
import {UntypedFormBuilder, UntypedFormGroup,  Validators} from '@angular/forms';
import {AlertService} from '@full-fledged/alerts';
import {IAuthConfig, ILDAPConfigStrategy, IOAUTHConfigStrategy} from '../../../../../core/entities/IAuth';
import {AuthenticationType} from '../../../../../core/enum/AuthenticationType';

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
  authConfigForm: UntypedFormGroup;
  oauthAuthActivated = false;
  ldapAuthActivated = false;
  ldapPasswordHide = true;

  constructor(private dialogRef: MatDialogRef<ExternalAuthConfigurationCreateComponent>,
              private externalAuthConfigurationService: ExternalAuthConfigurationService,
              private formBuilder: UntypedFormBuilder,
              private alertService: AlertService,
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

    } else if (authType === AuthenticationType.LDAP) {
      this.oauthAuthActivated = false;
      this.ldapAuthActivated = true;
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
        authConfig.authConfig = ({
          clientId: this.authConfigForm.value.oauthClientId,
          clientSecret: this.authConfigForm.value.oauthClientSecret,
          accessTokenUri: this.authConfigForm.value.oauthAccessTokenUri,
          authorizationUri: this.authConfigForm.value.oauthAuthorizationUri,
          // redirectUri: '/auth/redirectable-login/oauth2-callback',
          scopes: this.scopesToArray(this.authConfigForm.value.oauthScopes)
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
          console.log('Updating: ', data);
          this.dialogRef.close();
      }, error => {
          this.alertService.danger(error.error.message);
      });
    } else {
      this.externalAuthConfigurationService.createExternalAuth(authConfig).subscribe(data => {
        console.log('Creating: ', data);
        this.dialogRef.close();
      }, error => {
        this.alertService.danger(error.error.message);
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
        this.authConfigForm.controls.oauthClientSecret.setValue((this.data.authConfigData.authConfig as IOAUTHConfigStrategy).clientSecret);
        this.authConfigForm.controls.oauthAccessTokenUri.setValue((this.data.authConfigData.authConfig as IOAUTHConfigStrategy).accessTokenUri);
        this.authConfigForm.controls.oauthAuthorizationUri.setValue((this.data.authConfigData.authConfig as IOAUTHConfigStrategy).authorizationUri);
        // this.authConfigForm.controls.oauthRedirectUri.setValue((this.data.authConfigData.authConfig as IOAUTHConfigStrategy).redirectUri);
        this.authConfigForm.controls.oauthScopes.setValue((this.data.authConfigData.authConfig as IOAUTHConfigStrategy).scopes.join(','));
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

  private scopesToArray(scopes) {
    return scopes.split(',').map(scope => scope.trim());
  }
}


