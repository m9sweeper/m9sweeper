import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FalcoRuleAction} from '../../../../../../core/enum/FalcoRuleAction';
import {CustomValidatorService} from '../../../../../../core/services/custom-validator.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {IFalcoRule} from '../../../../../../core/entities/IFalcoRule';

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
    @Inject(MAT_DIALOG_DATA) protected data: { namespaces: string[], rule: IFalcoRule },
  ) { }

  ngOnInit(): void {
    this.namespaces = this.data?.namespaces || [];
    this.editMode = !! this.data?.rule;
    this.ruleForm = this.fb.group({
      id: [this.data?.rule?.id || ''],
      action: [this.data?.rule?.action || FalcoRuleAction.Ignore, [Validators.required]],
      namespace: [this.data?.rule?.namespace || ''],
      type: [this.data?.rule?.type || ''],
      image: [this.data?.rule?.image || ''],
    }, {
      validators: [this.customValidators.atLeastOne(['namespace', 'type', 'image'])]
      }
      );

    // this.ruleForm.valueChanges.subscribe({
    //   next: (e) => console.log(e)
    // });
  }

  confirmRule() {
    const rule = this.ruleForm.getRawValue();
    this.dialogRef.close({ rule });
  }

}
