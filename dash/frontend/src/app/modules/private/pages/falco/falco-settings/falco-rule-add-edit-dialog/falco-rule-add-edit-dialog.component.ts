import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FalcoRuleAction} from '../../../../../../core/enum/FalcoRuleAction';
import {CustomValidatorService} from '../../../../../../core/services/custom-validator.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {IFalcoRule} from '../../../../../../core/entities/IFalcoRule';
import {FalcoService} from '../../../../../../core/services/falco.service';
import {AlertService} from '@full-fledged/alerts';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-falco-rule-add-edit-dialog',
  templateUrl: './falco-rule-add-edit-dialog.component.html',
  styleUrls: ['./falco-rule-add-edit-dialog.component.scss']
})
export class FalcoRuleAddEditDialogComponent implements OnInit {

  ruleForm: FormGroup;
  namespaces: string[] = [];
  actionOptions = [
    {
      displayName: 'Ignore',
      value: FalcoRuleAction.Ignore
    },
    {
      displayName: 'Silence',
      value: FalcoRuleAction.Silence
    },
  ];

  editMode = false;
  constructor(
    protected fb: FormBuilder,
    protected customValidators: CustomValidatorService,
    protected dialogRef: MatDialogRef<FalcoRuleAddEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected data: { namespaces: string[], rule: IFalcoRule, clusterId: number },
    protected falcoService: FalcoService,
    protected alert: AlertService
  ) { }

  ngOnInit(): void {
    this.namespaces = this.data?.namespaces || [];
    this.editMode = !!this.data?.rule?.id;

    if (!this.data?.clusterId) {
      this.alert.danger('Failed to initialize rule dialog, refresh the page and try again');
      this.dialogRef.close();
    }

    this.ruleForm = this.fb.group({
      id: [this.data?.rule?.id || ''],
        clusterId: [this.data?.rule?.clusterId || this.data.clusterId],
      action: [this.data?.rule?.action || FalcoRuleAction.Ignore, [Validators.required]],
      namespace: [this.data?.rule?.namespace || ''],
      falcoRule: [this.data?.rule?.falcoRule || ''],
      image: [this.data?.rule?.image || ''],
    }, {
      validators: [this.customValidators.atLeastOne(['namespace', 'falcoRule', 'image'])]
      });
  }

  save() {
    const rule = this.ruleForm.getRawValue();
    const request = this.editMode
    ? this.falcoService.updateRule(this.data?.clusterId, rule)
      : this.falcoService.createRule(this.data?.clusterId, rule);

    request
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.alert.success(`Rule successfully ${this.editMode ? 'updated' : 'created'}!`);
          this.dialogRef.close({ rule: res?.data });
        }
      });

  }

}
