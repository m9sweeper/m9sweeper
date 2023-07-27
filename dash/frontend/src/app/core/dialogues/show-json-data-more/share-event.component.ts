import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-share-event',
  templateUrl: './share-event.component.html',
  styleUrls: ['./share-event.component.scss']
})
export class ShareEventComponent implements OnInit {
  /** The text that will be copied to the user's clipboard when they click the button. */
  @Input() text: string;
  /** The message that will be shown in a toast if the data is copied. */
  @Input() successMessage = 'Text successfully copied to clipboard!';
  /** The message that will be shown in a toast if the text can't be copied. */
  @Input() errorMessage = 'Text could not be copied to clipboard.';

  constructor(
              public dialogRef: MatDialogRef<ShareEventComponent>,
              private cb: Clipboard,
              private readonly snackBar: MatSnackBar,
  ) {}

  currentUrl = window.location.href;

  ngOnInit(): void {

  }
  onClickCopy(){
    const success = this.cb.copy(this.currentUrl);
    if (success) {
      this.snackBar.open(this.successMessage, 'Close', { duration: 2000 });
    } else {
      this.snackBar.open(this.errorMessage, 'Close', { duration: 2000 });
    }
  }
  onClickClose(){
    this.dialogRef.close();
  }

}
