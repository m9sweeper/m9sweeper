import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AlertService } from 'src/app/core/services/alert.service';
import { JwtAuthService } from '../../../../../core/services/jwt-auth.service';
import { ClusterGroupService } from '../../../../../core/services/cluster-group.service';
import { CustomValidators } from '../../../form-validator/custom-validators';
import {take} from 'rxjs/operators';


@Component({
  selector: 'app-cluster-group-create',
  templateUrl: './cluster-group-create.component.html',
  styleUrls: ['./cluster-group-create.component.scss']
})
export class ClusterGroupCreateComponent implements OnInit {
  userId = null;
  errorMsg = null;
  successMsg = null;
  clusterGroupCreateForm: FormGroup;
  constructor(private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<ClusterGroupCreateComponent>,
              private jwtAuthService: JwtAuthService,
              private alertService: AlertService,
              private clusterGroupService: ClusterGroupService,
              @Inject(MAT_DIALOG_DATA) public data: any
              ) {
    this.userId = this.jwtAuthService.getCurrentUserData().id;
  }

  ngOnInit(): void {
    this.clusterGroupCreateForm = this.formBuilder.group({
      name: [this.data.isEdit ? this.data.clusterGroupName : '',
        [CustomValidators.requiredNoTrim,
          Validators.maxLength(100)]],
      userId: ['']
    });
  }

  saveClusterGroup() {
    this.clusterGroupCreateForm.controls.userId.setValue(this.userId);
    const formData = this.clusterGroupCreateForm.getRawValue();
    formData.name = formData.name.trim();
    if (this.data.isEdit) {
      this.clusterGroupService.updateClusterGroup(formData, this.data.clusterGroupId).pipe(take(1))
        .subscribe({
          next: response => {
            if (response?.data) {
              this.successMsg = 'Cluster group updated successfully';
              this.alertService.success('Cluster group updated successfully');
              this.clusterGroupService.setCurrentGroup({name: formData.name.trim(), groupId: this.data.clusterGroupId });
              this.dialogRef.close(true);
            }
          },
          error: error => {
            this.errorMsg = error?.data?.message;
            this.alertService.danger(error.error.message);
          }
        });
    }
     else {
      this.clusterGroupService.createClusterGroup(formData)
        .pipe(take(1))
        .subscribe({
          next: isCreated => {
            if (+isCreated?.data?.id > 0 ) {
              this.successMsg = 'Cluster group created successfully';
              this.alertService.success('Cluster group created successfully');
              this.dialogRef.close(true);
            }
          },
          error: error => {
            this.errorMsg = error?.data?.message;
            this.alertService.danger(error.error.message);
          }
        });
    }

  }

  closeClusterGroup() {
    this.dialogRef.close({cancel: true});
  }

}
