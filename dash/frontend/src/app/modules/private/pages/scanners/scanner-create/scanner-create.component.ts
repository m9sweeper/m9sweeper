import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ScannerService } from '../../../../../core/services/scanner.service';
import { AlertService } from '@full-fledged/alerts';
import { CustomValidators } from '../../../form-validator/custom-validators';
import {IScanner, VulnerabilitySettings} from '../../../../../core/entities/IScanner';
@Component({
  selector: 'app-scanner-create',
  templateUrl: './scanner-create.component.html',
  styleUrls: ['./scanner-create.component.scss']
})
export class ScannerCreateComponent implements OnInit {
  createScannerForm: FormGroup;
  scannerTypes: any;
  trivyVulnerabilitySettings: VulnerabilitySettings;
  displayTrivyVulnerabilitySettings = false;

  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<ScannerCreateComponent>,
              private scannerService: ScannerService,
              private alertService: AlertService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.scannerTypes = [{name: 'Trivy', value: 'TRIVY' }, {name: 'Mock', value: 'MOCK'}];
    this.createScannerForm = this.formBuilder.group({
      name: [this.data.isEdit ? this.data.scannerData.name : '', [CustomValidators.requiredNoTrim,
        Validators.maxLength(255)]],
      description: [this.data.isEdit ? this.data.scannerData.description : '', CustomValidators.requiredNoTrim],
      type: [this.data.isEdit ? this.scannerTypes.find(typeData => typeData.value === this.data.scannerData.type) ?
        this.scannerTypes.find(typeData => typeData.value === this.data.scannerData.type).value : '' : '', Validators.required],
      enabled: [this.data.isEdit ? this.data.scannerData.enabled : false],
      required: [this.data.isEdit ? this.data.scannerData.required : false],
      fixableCritical: [0, Validators.nullValidator],
      fixableMajor: [0, Validators.nullValidator],
      fixableNormal: [1000, Validators.nullValidator],
      fixableLow: [1000, Validators.nullValidator],
      fixableNegligible: [1000, Validators.nullValidator],
      unFixableCritical: [1000, Validators.nullValidator],
      unFixableMajor: [1000, Validators.nullValidator],
      unFixableNormal: [1000, Validators.nullValidator],
      unFixableLow: [1000, Validators.nullValidator],
      unFixableNegligible: [1000, Validators.nullValidator],
    });
    this.trivyVulnerabilitySettings = {
      fixableCritical : 0,
      fixableMajor : 0,
      fixableNormal : 1000,
      fixableLow : 1000,
      fixableNegligible : 1000,
      unFixableCritical : 1000,
      unFixableMajor : 1000,
      unFixableNormal : 1000,
      unFixableLow : 1000,
      unFixableNegligible : 1000
    };
  }

  ngOnInit(): void {
    if (this.data.isEdit) {
      this.setTrivySettings();
      this.displayTrivyVulnerabilitySettings = true;
    }
  }
  onSubmit(){
    const scannerData: IScanner = {...this.createScannerForm.value, ...{policyId: this.data.policyId}};
    scannerData.name = scannerData.name.trim();
    if (scannerData.type === 'TRIVY') {
      scannerData.vulnerabilitySettings = this.getTrivySettings();
    }

    scannerData.description = scannerData.description.trim();
    this.deleteTrivyFormFields(scannerData);

    if (this.data.isPolicyEdit) {
      if (this.data.isEdit) {
        this.scannerService.updateScanner(scannerData, this.data.scannerData.id).subscribe(response => {
          this.alertService.success('Scanned Updated Successfully');
        }, error => {
          this.alertService.danger(error.error.message);
        }, () => {
          this.dialogRef.close({value: scannerData, isClose: false});
        });
      } else {
        this.scannerService.createScanner(scannerData).subscribe(response => {
          this.alertService.success('Scanned Added Successfully');
        }, error => {
          this.alertService.danger(error.error.message);
        }, () => {
          this.dialogRef.close({value: scannerData, isClose: false});
        });
      }
    } else {
      this.dialogRef.close({value: scannerData, isClose: false});
    }
  }
  onNoClick(){
    const scannerData = {...this.createScannerForm.value, ...{policyId: this.data.policyId}};
    this.dialogRef.close({value: scannerData, isClose: true});
  }

  getTrivySettings(): VulnerabilitySettings {
    this.trivyVulnerabilitySettings.fixableCritical = this.createScannerForm.controls.fixableCritical.value;
    this.trivyVulnerabilitySettings.fixableMajor = this.createScannerForm.controls.fixableMajor.value;
    this.trivyVulnerabilitySettings.fixableNormal = this.createScannerForm.controls.fixableNormal.value;
    this.trivyVulnerabilitySettings.fixableLow = this.createScannerForm.controls.fixableLow.value;
    this.trivyVulnerabilitySettings.fixableNegligible = this.createScannerForm.controls.fixableNegligible.value;

    this.trivyVulnerabilitySettings.unFixableCritical = this.createScannerForm.controls.unFixableCritical.value;
    this.trivyVulnerabilitySettings.unFixableMajor = this.createScannerForm.controls.unFixableMajor.value;
    this.trivyVulnerabilitySettings.unFixableNormal = this.createScannerForm.controls.unFixableNormal.value;
    this.trivyVulnerabilitySettings.unFixableLow = this.createScannerForm.controls.unFixableLow.value;
    this.trivyVulnerabilitySettings.unFixableNegligible = this.createScannerForm.controls.unFixableNegligible.value;
    return this.trivyVulnerabilitySettings;
  }

  setTrivySettings(): void {
    const scannerData = this.data.scannerData;
    this.createScannerForm.controls.fixableCritical.setValue(scannerData.vulnerabilitySettings.fixableCritical);
    this.createScannerForm.controls.fixableMajor.setValue(scannerData.vulnerabilitySettings.fixableMajor);
    this.createScannerForm.controls.fixableNormal.setValue(scannerData.vulnerabilitySettings.fixableNormal);
    this.createScannerForm.controls.fixableLow.setValue(scannerData.vulnerabilitySettings.fixableLow);
    this.createScannerForm.controls.fixableNegligible.setValue(scannerData.vulnerabilitySettings.fixableNegligible);

    this.createScannerForm.controls.unFixableCritical.setValue(scannerData.vulnerabilitySettings.unFixableCritical);
    this.createScannerForm.controls.unFixableMajor.setValue(scannerData.vulnerabilitySettings.unFixableMajor);
    this.createScannerForm.controls.unFixableNormal.setValue(scannerData.vulnerabilitySettings.unFixableNormal);
    this.createScannerForm.controls.unFixableLow.setValue(scannerData.vulnerabilitySettings.unFixableLow);
    this.createScannerForm.controls.unFixableNegligible.setValue(scannerData.vulnerabilitySettings.unFixableNegligible);
  }

  displayTrivySettings($event: any) {
    this.displayTrivyVulnerabilitySettings = $event === 'TRIVY' ? true : false;
  }

  deleteTrivyFormFields(scanner) {
    delete scanner.fixableCritical;
    delete scanner.fixableMajor;
    delete scanner.fixableNormal;
    delete scanner.fixableLow;
    delete scanner.fixableNegligible;
    delete scanner.unFixableCritical;
    delete scanner.unFixableMajor;
    delete scanner.unFixableNormal;
    delete scanner.unFixableLow;
    delete scanner.unFixableNegligible;
  }
}
