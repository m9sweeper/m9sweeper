import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

interface SimpleMessageDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-simple-message-dialog',
  templateUrl: './simple-message-dialog.component.html',
  styleUrls: ['./simple-message-dialog.component.scss']
})
export class SimpleMessageDialogComponent {
  constructor(private matDialogRef: MatDialogRef<SimpleMessageDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SimpleMessageDialogData,
              ) {}

  close(){
    this.matDialogRef.close();
  }
}
