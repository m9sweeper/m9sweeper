import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { Validators,  FormGroup, FormBuilder} from '@angular/forms';
import {IConstraintSpecMatchKinds} from '../../../../../core/entities/gatekeeper';

@Component({
  selector: 'app-add-constraint-criteria',
  templateUrl: './add-constraint-criteria.component.html',
  styleUrls: ['./add-constraint-criteria.component.scss']
})
export class AddConstraintCriteriaComponent implements OnInit {

  addConstraintCriteria: FormGroup;
  constraintCriteria: IConstraintSpecMatchKinds = {};

  constructor(
    public dialogRef: MatDialogRef<AddConstraintCriteriaComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.addConstraintCriteria = this.formBuilder.group({
      kinds: ['', [Validators.required]],
      apiGroups: ['', [Validators.nullValidator]],
    });
  }

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    const criteriaFormValue = this.addConstraintCriteria.value;
    this.constraintCriteria.kinds = criteriaFormValue.kinds.split(',').map(kind => kind.trim());
    this.constraintCriteria.apiGroups =  criteriaFormValue.apiGroups.split(',').map(apiGroup => apiGroup.trim());
    this.dialogRef.close({constraintCriteria: this.constraintCriteria});
  }
}
