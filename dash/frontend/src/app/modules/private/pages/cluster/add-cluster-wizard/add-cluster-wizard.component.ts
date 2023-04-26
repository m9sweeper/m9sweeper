import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';
import {Observable, throwError} from 'rxjs';
import {parse as YmlParse} from 'yaml';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {ClusterService} from '../../../../../core/services/cluster.service';
import {IKubeConfig} from '../../../../../core/entities/IKubeConfig';
import { URL } from 'url';
import {CustomValidators} from '../../../form-validator/custom-validators';
import {AlertService} from '@full-fledged/alerts';
import {MatStepper} from '@angular/material/stepper';
import {ClusterGroupService} from '../../../../../core/services/cluster-group.service';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';
import {CommonService} from '../../../../../core/services/common.service';
import {ServiceAccountWizardComponent} from '../service-account-wizard/service-account-wizard.component';
import {take} from 'rxjs/operators';
import {MatSelectChange} from '@angular/material/select';
import {MatRadioChange} from '@angular/material/radio';

@Component({
  selector: 'app-add-cluster-wizard',
  templateUrl: './add-cluster-wizard.component.html',
  styleUrls: ['./add-cluster-wizard.component.scss']
})
export class AddClusterWizardComponent implements OnInit {
  createClusterForm: FormGroup;
  serviceAccountForm = this.formBuilder.group({
    automaticInstall: [false, Validators.required],
    config: ['']
  },
    {validators: this.validateConfigOption});

  config: IKubeConfig;
  serviceAccountContext: string;
  isCompleted = true;
  submitting = false;
  installWebhook = 'automatically';
  nextClusterId: number;
  baseUrl: string;
  validatorsPatternForPortNumber = /^\d+$/;
  @ViewChild('defaultWebhookTextArea') defaultWebhookTextArea: ElementRef;

  constructor( private dialogRef: MatDialogRef<AddClusterWizardComponent>,
               private formBuilder: FormBuilder,
               private clusterService: ClusterService,
               private clusterGroupService: ClusterGroupService,
               private jwtAuthService: JwtAuthService,
               private alertService: AlertService,
               private commonService: CommonService,
               protected dialog: MatDialog,
               @Inject(MAT_DIALOG_DATA) public data: any) {
      this.createClusterForm = this.formBuilder.group({
      name: ['', [CustomValidators.requiredNoTrim, Validators.maxLength(100)]],
      ipAddress: [''],
      port: ['', [Validators.required, Validators.pattern(this.validatorsPatternForPortNumber)]],
      groupId: [this.data.groupId],
      context: ['', [Validators.maxLength(255)]],
      kubeConfig: [''],
      gracePeriodDays: [0, [Validators.nullValidator]],
      automaticClusterInstall: [true]
    });
      this.commonService.getBaseUrl().subscribe(response => {
        const url = response.data.baseUrl;
        try {
          const baseUrl = new URL(url);
          this.baseUrl = `${baseUrl.hostname}${baseUrl.pathname}`;
        } catch (e) {
            this.baseUrl = response.data.baseUrl;
        }
        if (this.data.isEdit) {
          this.setDefaultWebhookText();
        }
      });
  }

  ngOnInit(): void {
    if (this.data.isEdit) {
      this.nextClusterId = this.data.clusterId;
      this.populateClusterWizard();
    }
    this.dialogRef.disableClose = false;
  }

  onNoClick(){
    this.dialogRef.close({cancel: true});
  }

  populateClusterWizard(){
    this.createClusterForm.get('automaticClusterInstall').setValue(false);
    this.createClusterForm.get('name').setValue(this.data.cluster.name);
    this.createClusterForm.get('ipAddress').setValue(this.data.cluster.ipAddress);
    this.createClusterForm.get('gracePeriodDays').setValue(this.data.cluster.gracePeriodDays || 0);
    // this.createClusterForm.get('context').setValue(this.data.cluster.context);
    this.createClusterForm.get('port').setValue(this.data.cluster.port);
    // this.createClusterForm.get('kubeConfig').setValue(this.data.cluster.kubeConfig);
    this.createClusterForm.get('gracePeriodDays').setValue(this.data.cluster.gracePeriodDays);
    // this.updateContext({source: {value: this.data.cluster.context}});
    this.createClusterForm.updateValueAndValidity();
  }

  onSubmit(stepper?: MatStepper){
    const formValues = this.createClusterForm.getRawValue();
    delete formValues.automaticClusterInstall;
    if (this.data.isEdit) {
      this.updateCluster(formValues, stepper);
    } else {
      if (this.createClusterForm.value.groupId === null){
        const formData = {
          name: 'default',
          userId: this.jwtAuthService.getCurrentUserData().id
        };
        this.clusterGroupService.createClusterGroup(formData).subscribe(response => {
          formValues.groupId = response.data.id;
          this.createCluster(formValues, stepper);
        }, error => {
        });
      }
      else {
        this.createCluster(formValues, stepper);
      }
    }
  }
  createCluster(formValue: any, stepper?: MatStepper){
    formValue.name = this.createClusterForm.value.name.trim();
    formValue.context = this.serviceAccountContext || this.createClusterForm.value.context.trim();
    formValue.gracePeriodDays = Number(formValue.gracePeriodDays);
    const serviceAccountValues = this.serviceAccountForm.getRawValue();
    this.submitting = true;
    this.clusterService.createCluster({
      ...formValue,
      installWebhook: this.installWebhook,
      serviceAccountConfig: serviceAccountValues.automaticInstall ? undefined : serviceAccountValues.config
    })
      .pipe(take(1))
      .subscribe((response) => {
        this.nextClusterId = response.data.id;
        this.setDefaultWebhookText();
        this.submitting = false;
        this.isCompleted = false;
        this.dialogRef.disableClose = true;
        stepper.next();
        this.alertService.success('Cluster added successfully');
      }, error => {
        this.submitting = false;
        this.alertService.danger(error.error.message);
      });
  }

  updateCluster(formValue: any, stepper?: MatStepper){
    formValue.name = this.createClusterForm.value.name.trim();
    formValue.context = this.serviceAccountContext || this.createClusterForm.value.context.trim();
    formValue.gracePeriodDays = Number(formValue.gracePeriodDays);
    formValue.groupId = this.data.cluster.groupId;
    const serviceAccountValues = this.serviceAccountForm.getRawValue();
    this.submitting = true;
    this.clusterService.updateCluster({
      ...formValue,
      installWebhook: this.installWebhook,
      serviceAccountConfig: serviceAccountValues.automaticInstall ? 'automatically' : serviceAccountValues.config
    }, this.data.clusterId)
      .pipe(take(1))
      .subscribe((response) => {
        this.submitting = false;
        this.isCompleted = false;
        this.dialogRef.disableClose = true;
        stepper.next();
        this.alertService.success('Cluster updated successfully');
      }, error => {
        this.submitting = false;
        this.alertService.danger(error.error.message);
      });
  }

  viewResults(){
    this.dialogRef.close({result: true});
  }

  // Reset the kube config and context. Leaves the host & port populated so
  // the user can switch mode easily in edit mode
  automaticClusterInstallChange(e: MatRadioChange) {
    // Clear the  form
    this.createClusterForm.get('kubeConfig').setValue('');
    this.createClusterForm.get('context').setValue('');
    // Default the webhook install method dependent on if they are in automatic or manual mode
    this.installWebhook = e.value ? 'automatically' : 'manually';
  }

  onConfigFileChoose($event) {
    if ($event.target.files.length > 0) {
      const configFile: File = $event.target.files[0];
      const fileName = configFile.name;
      this.readConfigFile(configFile).subscribe(result => {
        try {
          this.config = YmlParse(result) as IKubeConfig;
          // @TODO: Potentially upgrade validation that the yaml file is a valid kubeconfig
          if (!this.config?.contexts) {
            this.alertService.warning('Selected file was not a valid kubeconfig');
            this.config = undefined;
          }
        } catch (e) {
          this.alertService.warning('Selected file was not a valid YAML file');
          this.config = undefined;
        }
      }, error => {

      });
    }
    return false;
  }

  /*
    A selection change event is fired not only when an option is selected but also when it is deselected.
  */
  updateContext($event: MatSelectChange) {
    const context = this.config?.contexts?.find(ctx => ctx.name === $event?.value);
    // Clear the config related fields if we have deselected a kubeconfig
    if (!context)  {
      this.createClusterForm.get('ipAddress').setValue('');
      this.createClusterForm.get('port').setValue('');
      this.createClusterForm.get('kubeConfig').setValue('');
      // If no admin kubeconfig is used, the user must manually install the service account & webhook
      this.serviceAccountForm.controls.automaticInstall.patchValue(false);
      this.installWebhook = 'manually';
      return;
    }

    const cluster = this.config.clusters.find(cl => cl.name === context.context.cluster);

    const serverInfo = new URL(cluster.cluster.server);
    const domain = serverInfo.protocol + '//' + serverInfo.hostname;
    const port = serverInfo.port || 443;
    this.createClusterForm.get('ipAddress').setValue(domain);
    this.createClusterForm.get('port').setValue(port);

    // Copy the original context so that the data for the other contexts isn't removed
    // and create a kubeconfig that has only the selected context in it to pass back to the backend
    const contextConfig = {...this.config};
    contextConfig.clusters = [cluster];
    contextConfig.contexts = [context];
    contextConfig['current-context'] = context.name;
    contextConfig.users = contextConfig.users.filter(o => o.name === context.context.user);
    this.createClusterForm.get('kubeConfig').setValue(btoa(JSON.stringify(contextConfig)));
    // Default to automatically installing the service account & webhook
    this.serviceAccountForm.controls.automaticInstall.patchValue(true);
    this.installWebhook = 'automatically';
  }

  readConfigFile(blob: File | Blob): Observable<string> {
    if (!(blob instanceof Blob)) {
      return throwError(new Error('`blob` must be an instance of File or Blob.'));
    }

    return new Observable<string>(obs => {
      const reader = new FileReader();

      reader.onerror = err => obs.error(err);
      reader.onabort = err => obs.error(err);
      reader.onload = () => obs.next(reader.result?.toString());
      reader.onloadend = () => obs.complete();

      return reader.readAsText(blob);
    });
  }

  installServiceAccount() {
    this.dialog.open(ServiceAccountWizardComponent, {
      data: {
        server: this.createClusterForm.get('ipAddress').value + ':' + this.createClusterForm.get('port').value,
        context: this.createClusterForm.get('context').value
      },
    }).afterClosed()
      .pipe(take(1))
      .subscribe((data: {config: string, context?: string}) => {
        if (data?.config) {
          this.serviceAccountContext = data.context;
          this.serviceAccountForm.controls.config.patchValue(data.config);
          this.serviceAccountForm.controls.automaticInstall.patchValue(false);
        } else {
          this.serviceAccountContext = undefined;
          this.serviceAccountForm.controls.config.patchValue('');
          this.serviceAccountForm.controls.automaticInstall.patchValue(true);
        }
      });
  }

  setDefaultWebhookText(): void {
    // Indentation intentionally weird here, tabbing it in would cause those tabs to become part of the string,
    // and this would then become invalid yaml
    const text = `apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: "m9sweeper-validation-hook-cluster-${this.data.isEdit ? this.data.clusterId : this.nextClusterId}"
webhooks:
  - name: "m9sweeper-validation-hook.m9sweeper.io"
    rules:
      - apiGroups: ["*"]
        apiVersions: ["v1", "v1beta1"]
        operations: ["CREATE"]
        resources: ["pods"]
        scope: "*"
    clientConfig:
      url: "https://${this.baseUrl}/api/clusters/${this.data.isEdit ? this.data.clusterId : this.nextClusterId}/validation"
    admissionReviewVersions: ["v1", "v1beta1"]
    failurePolicy: Ignore
    sideEffects: None
    timeoutSeconds: 10`;
    try {
      this.defaultWebhookTextArea.nativeElement.innerHTML = text;
    } catch (e) {
      console.log('could not read native element', e);
    }
  }

  validateConfigOption(group: FormGroup): {manualNoConfig: boolean} {
    if (group.get('automaticInstall').value === false) {
      return group.get('config').value ? null : {manualNoConfig: true};
    }
    return null;
  }

  displayWebhookText() {
    return { display : this.installWebhook === 'manually' ? '' : 'none' };
  }
}
