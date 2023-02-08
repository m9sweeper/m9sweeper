import { Component, OnInit } from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {ClusterService} from '../../../../../core/services/cluster.service';
import {AlertService} from "@full-fledged/alerts";

@Component({
  selector: 'app-license-check',
  templateUrl: './license-check.component.html',
  styleUrls: ['./license-check.component.scss']
})
export class LicenseCheckComponent implements OnInit {

  checkLicenseValidityForm: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder,
              private dialogRef: MatDialogRef<LicenseCheckComponent>,
              private clusterService: ClusterService,
              private alertService: AlertService) {
    this.checkLicenseValidityForm = this.formBuilder.group({
      licenseKey: ['', [Validators.required]],
      instanceKey: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
  }

  onNoClick() {
    this.dialogRef.close({cancel: true});
  }

  onSubmit() {
    const licenseData = this.checkLicenseValidityForm.value;
    let isLicenseValid = false;
    this.clusterService.checkLicenseValidityFromLicensingPortal(licenseData.licenseKey.trim(), licenseData.instanceKey.trim())
      .subscribe(response => {
        if (!response.data.success) {
          this.alertService.danger(response.data.message);
          this.dialogRef.close({isLicenseValid});
        } else {
          isLicenseValid = true;
          this.alertService.success('The license key is valid');
          this.dialogRef.close({isLicenseValid});
        }
      });
  }
}
