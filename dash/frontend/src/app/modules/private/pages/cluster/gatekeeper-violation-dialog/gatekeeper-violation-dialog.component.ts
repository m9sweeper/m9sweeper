import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { jsonToTableHtmlString } from 'json-table-converter';
import { IGatekeeperConstraintViolation } from '../../../../../core/entities/IGateKeeperConstraint';

@Component({
  selector: 'app-gatekeeper-violation-dialog',
  templateUrl: './gatekeeper-violation-dialog.component.html',
  styleUrls: ['./gatekeeper-violation-dialog.component.scss']
})
export class GatekeeperViolationDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<GatekeeperViolationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {violations: IGatekeeperConstraintViolation}) { }

  ngOnInit(): void {
  }

  get tableHtml(): string {
    return jsonToTableHtmlString(this.data.violations);
  }

  onClose() {
    this.dialogRef.close();
  }

}
