import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-generic-error-dialog',
  templateUrl: './generic-error-dialog.component.html',
  styleUrls: ['./generic-error-dialog.component.scss']
})
export class GenericErrorDialogComponent implements OnInit {
  // Fields to be populated from data
  title = 'Error';
  message = 'Something went wrong. Please try again later.';
  btnText = 'OK';

  constructor(private matDialogRef: MatDialogRef<GenericErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      this.title = data.title || this.title;
      this.message = data.message || this.message;
      this.btnText = data.btnText || this.btnText;
    }
  }

  ngOnInit(): void {
    if (!this.title) { this.title = 'Error'; }
  }

  close(): void {
    this.matDialogRef.close();
  }

}
