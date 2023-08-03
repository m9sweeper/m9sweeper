import {Component, Inject} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {AlertService} from 'src/app/core/services/alert.service';
import {FormBuilder,  Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ClusterService} from '../../../../../core/services/cluster.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-service-account-wizard',
  templateUrl: './service-account-wizard.component.html',
  styleUrls: ['./service-account-wizard.component.scss']
})
export class ServiceAccountWizardComponent {

  tokenControl = this.fb.control('', [Validators.required]);
  config: string;
  context: string;
  badConfig = false;
  testingConnection = false;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { server: string, context: string },
    private dialogRef: MatDialogRef<ServiceAccountWizardComponent>,
    private clipboard: Clipboard,
    private alertService: AlertService,
    private fb: FormBuilder,
    private readonly clusterService: ClusterService,
              ) { }

  testConfig() {
    this.testingConnection = true;
    this.clusterService.testServiceAccount(this.tokenControl.value, this.data.server, this.data.context)
      .pipe(take(1))
      .subscribe(res => {
        if (res.data?.valid) {
          this.config = res.data.config;
          this.context = res.data.context;
        } else {
          this.alertService.warning(`The token provided could not be used to connect to the cluster at ${this.data.server}`);
          this.badConfig = true;
        }
      },
        () => {
          this.badConfig = true;
          this.alertService.danger('Something went wrong checking your connection. Please try again later');
        },
      () => {
        this.testingConnection = false;
      }
      );
  }

  complete() {
    this.dialogRef.close({ config: this.config, context: this.context });
  }
}
