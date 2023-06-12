import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DockerRegistriesService} from '../../../../../core/services/docker-registries.service';
import {AlertService} from '@full-fledged/alerts';
import {CustomValidators} from '../../../form-validator/custom-validators';
import {IDockerRegistries} from '../../../../../core/entities/IDockerRegistries';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';
import {DockerRegistryAuthTypes} from '../../../../../core/enum/DockerRegistryAuthTypes';
import {take} from 'rxjs/operators';
import {ACRAuthDetails, AzureCRAuthDetails, GCRAuthDetails} from '../../../../../core/types/DockerRegistryAuthDetails';
import {ENTER, SPACE} from '@angular/cdk/keycodes';

@Component({
  selector: 'app-docker-registries-create',
  templateUrl: './docker-registries-create.component.html',
  styleUrls: ['./docker-registries-create.component.scss']
})
export class DockerRegistriesCreateComponent implements OnInit {
  createDockerRegistryForm: FormGroup;
  activateHiddenFields = false;
  passwordHide = true;
  currentUser = null;
  authTypes: Array<DockerRegistryAuthTypes>;
  showBasicAuthFields = false;
  showAcrAuthFields = false;
  showGcrAuthFields = false;
  showAzureAuthFields = false;
  loginRequired = false;

  readonly aliasSeparatorKeys = [SPACE, ENTER];

  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<DockerRegistriesCreateComponent>,
              private dockerRegistriesService: DockerRegistriesService,
              private alertService: AlertService,
              private jwtAuthService: JwtAuthService,
              @Inject(MAT_DIALOG_DATA) public data: { isEdit: boolean, dockerRegistry: IDockerRegistries },
  ) {}

  ngOnInit(): void {
    let gcrDetails: GCRAuthDetails;
    let acrDetails: ACRAuthDetails;
    let azureDetails: AzureCRAuthDetails;
    if (this.data.isEdit) {
      switch (this.data.dockerRegistry.authType) {
        case DockerRegistryAuthTypes.GOOGLE_CONTAINER_REGISTRY:
          gcrDetails = this.data.dockerRegistry.authDetails as GCRAuthDetails;
          break;
        case DockerRegistryAuthTypes.AMAZON_CONTAINER_REGISTRY:
          acrDetails = this.data.dockerRegistry.authDetails as ACRAuthDetails;
          break;
        case DockerRegistryAuthTypes.AZURE_CONTAINER_REGISTRY:
          azureDetails = this.data.dockerRegistry.authDetails as AzureCRAuthDetails;
          break;
      }
    }
    this.createDockerRegistryForm = this.formBuilder.group({
      name: [this.data.isEdit ? this.data.dockerRegistry.name : '',
        [CustomValidators.requiredNoTrim,
          Validators.maxLength(100)]],
      hostname: [this.data.isEdit ? this.data.dockerRegistry.hostname : '', [Validators.required]],
      loginRequired: [this.data.isEdit ? this.data.dockerRegistry.loginRequired : false],
      username: [this.data.isEdit ? this.data?.dockerRegistry.username : ''],
      password: [this.data.isEdit ? this.data?.dockerRegistry.password : ''],
      authType: [this.data.isEdit ? this.data.dockerRegistry?.authType : DockerRegistryAuthTypes.NONE],
      gcrAuthJson: [gcrDetails ? gcrDetails?.gcrAuthJson : ''],
      acrAccessKey: [acrDetails ? acrDetails?.acrAccessKey : ''],
      acrSecretKey: [acrDetails ? acrDetails?.acrSecretKey : ''],
      acrDefaultRegion: [acrDetails ? acrDetails?.acrDefaultRegion : ''],
      azureClientId: [azureDetails ? azureDetails?.azureClientId : ''],
      azureClientSecret: [azureDetails ? azureDetails?.azureClientSecret : ''],
      azureTenantId: [azureDetails ? azureDetails?.azureTenantId : ''],
      aliases: [this.data.isEdit ? new Set(this.data.dockerRegistry.aliases) : new Set()],
      aliasInput: ['']
    });
    this.currentUser = this.jwtAuthService.getCurrentUserData().id;
    this.authTypes = [
      DockerRegistryAuthTypes.NONE,
      DockerRegistryAuthTypes.BASIC,
      DockerRegistryAuthTypes.AMAZON_CONTAINER_REGISTRY,
      DockerRegistryAuthTypes.GOOGLE_CONTAINER_REGISTRY,
      DockerRegistryAuthTypes.AZURE_CONTAINER_REGISTRY
    ];
    if (this.data.isEdit) {
      this.loginRequired = this.data.dockerRegistry.loginRequired;
      this.handleHiddenFields({value: this.data.dockerRegistry.authType});
    }
  }

  onSubmit() {
    const dockerRegistryData = this.createDockerRegistryForm.getRawValue();
    switch (dockerRegistryData.authType) {
      case DockerRegistryAuthTypes.GOOGLE_CONTAINER_REGISTRY:
        try {
          // ensure that the input value is a valid JSON format
          JSON.parse(dockerRegistryData.gcrAuthJson.trim());
          dockerRegistryData.authDetails = {
            gcrAuthJson: dockerRegistryData.gcrAuthJson.trim()
          };
        } catch (err) {
          this.alertService.danger('Error while parsing GCR JSON; please check that the credentials are formatted correctly');
          return;
        }
        break;
      case DockerRegistryAuthTypes.AMAZON_CONTAINER_REGISTRY:
        dockerRegistryData.authDetails = {
          acrAccessKey: dockerRegistryData.acrAccessKey.trim(),
          acrSecretKey: dockerRegistryData.acrSecretKey.trim(),
          acrDefaultRegion: dockerRegistryData.acrDefaultRegion.trim()
        };
        break;
      case DockerRegistryAuthTypes.AZURE_CONTAINER_REGISTRY:
        dockerRegistryData.authDetails = {
          azureClientId: dockerRegistryData.azureClientId.trim(),
          azureClientSecret: dockerRegistryData.azureClientSecret.trim(),
          azureTenantId: dockerRegistryData.azureTenantId.trim()
        };
        break;
      default:
        dockerRegistryData.authDetails = null;
        break;
    }
    if (dockerRegistryData.aliasInput) {
      dockerRegistryData.aliases.add(dockerRegistryData.aliasInput.trim());
      dockerRegistryData.aliasInput = '';
    }
    if (dockerRegistryData.aliases.has(dockerRegistryData.hostname)) {
      this.alertService.danger('Registry hostname/aliases must be unique');
      return;
    }
    dockerRegistryData.name = dockerRegistryData.name.trim();
    dockerRegistryData.hostname = dockerRegistryData.hostname.trim();
    dockerRegistryData.username = dockerRegistryData.authType === DockerRegistryAuthTypes.BASIC ? dockerRegistryData.username.trim() : null;
    dockerRegistryData.password = dockerRegistryData.authType === DockerRegistryAuthTypes.BASIC ? dockerRegistryData.password.trim() : null;
    dockerRegistryData.aliases = Array.from(dockerRegistryData.aliases);
    if (this.data.isEdit) {
      this.dockerRegistriesService.updateDockerRegistry(dockerRegistryData, this.data.dockerRegistry.id)
        .pipe(take(1))
        .subscribe(response => {
          this.alertService.success('Docker Registry Updated Successfully');
        }, error => {
          this.alertService.danger(error.error.message);
        }, () => {
          this.dialogRef.close();
        });
    } else {
      this.dockerRegistriesService.createDockerRegistry(dockerRegistryData)
        .pipe(take(1))
        .subscribe(response => {
          this.alertService.success('Docker Registry Created Successfully');
        }, error => {
          this.alertService.danger(error.error.message);
        }, () => {
          this.dialogRef.close();
        });
    }
  }

  onNoClick() {
    this.dialogRef.close({cancel: true});
  }

  handleHiddenFields(event) {
    switch (event.value) {
      case DockerRegistryAuthTypes.NONE:
        this.deactivateBasicAuth();
        this.deactivateAcrAuth();
        this.deactivateGcrAuth();
        this.deactivateAzureAuth();
        break;
      case DockerRegistryAuthTypes.BASIC:
        this.showBasicAuthFields = true;
        this.createDockerRegistryForm.get('username').setValidators([Validators.required]);
        this.createDockerRegistryForm.get('password').setValidators([Validators.required]);
        this.createDockerRegistryForm.get('loginRequired').setValue(true);
        this.deactivateAcrAuth();
        this.deactivateGcrAuth();
        this.deactivateAzureAuth();
        break;
      case DockerRegistryAuthTypes.AMAZON_CONTAINER_REGISTRY:
        this.showAcrAuthFields = true;
        this.createDockerRegistryForm.get('acrAccessKey').setValidators([Validators.required]);
        this.createDockerRegistryForm.get('acrSecretKey').setValidators([Validators.required]);
        this.createDockerRegistryForm.get('acrDefaultRegion').setValidators([Validators.required]);
        this.deactivateBasicAuth();
        this.deactivateGcrAuth();
        this.deactivateAzureAuth();
        break;
      case DockerRegistryAuthTypes.GOOGLE_CONTAINER_REGISTRY:
        this.showGcrAuthFields = true;
        this.createDockerRegistryForm.get('gcrAuthJson').setValidators([Validators.required]);
        this.deactivateBasicAuth();
        this.deactivateAcrAuth();
        this.deactivateAzureAuth();
        break;
      case DockerRegistryAuthTypes.AZURE_CONTAINER_REGISTRY:
        this.showAzureAuthFields = true;
        this.createDockerRegistryForm.get('azureClientId').setValidators([Validators.required]);
        this.createDockerRegistryForm.get('azureClientSecret').setValidators([Validators.required]);
        this.createDockerRegistryForm.get('azureTenantId').setValidators([Validators.required]);
        this.deactivateBasicAuth();
        this.deactivateAcrAuth();
        this.deactivateGcrAuth();
        break;
    }
    this.createDockerRegistryForm.updateValueAndValidity();
  }

  deactivateBasicAuth() {
    this.showBasicAuthFields = false;
    this.createDockerRegistryForm.get('username').setValidators([Validators.nullValidator]);
    this.createDockerRegistryForm.get('password').setValidators([Validators.nullValidator]);
    this.createDockerRegistryForm.get('username').setValue('');
    this.createDockerRegistryForm.get('password').setValue('');
    this.createDockerRegistryForm.get('loginRequired').setValue(false);
  }

  deactivateAcrAuth() {
    this.showAcrAuthFields = false;
    this.createDockerRegistryForm.get('acrAccessKey').setValidators([Validators.nullValidator]);
    this.createDockerRegistryForm.get('acrSecretKey').setValidators([Validators.nullValidator]);
    this.createDockerRegistryForm.get('acrDefaultRegion').setValidators([Validators.nullValidator]);
    this.createDockerRegistryForm.get('acrAccessKey').setValue('');
    this.createDockerRegistryForm.get('acrSecretKey').setValue('');
    this.createDockerRegistryForm.get('acrDefaultRegion').setValue('');
  }

  deactivateGcrAuth() {
    this.showGcrAuthFields = false;
    this.createDockerRegistryForm.get('gcrAuthJson').setValidators([Validators.nullValidator]);
    this.createDockerRegistryForm.get('gcrAuthJson').setValue('');
  }

  deactivateAzureAuth() {
    this.showAzureAuthFields = false;
    this.createDockerRegistryForm.get('azureClientId').setValidators([Validators.nullValidator]);
    this.createDockerRegistryForm.get('azureClientSecret').setValidators([Validators.nullValidator]);
    this.createDockerRegistryForm.get('azureTenantId').setValidators([Validators.nullValidator]);
    this.createDockerRegistryForm.get('azureClientId').setValue('');
    this.createDockerRegistryForm.get('azureClientSecret').setValue('');
    this.createDockerRegistryForm.get('azureTenantId').setValue('');
  }

  addAlias(inputEvent) {
    if (inputEvent.value) {
      this.createDockerRegistryForm.get('aliases').value.add(inputEvent.value.trim());
    }
    inputEvent.chipInput.clear();
  }

  removeAlias(alias) {
    this.createDockerRegistryForm.get('aliases').value.delete(alias);
  }
}
