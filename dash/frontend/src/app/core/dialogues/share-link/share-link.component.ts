import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';

interface ShareLinkData {
  title: string;
  description: string;
  /** The text that will be copied to the user's clipboard when they click the button. */
  textToCopy: string;
  /** The message that will be shown in a toast if the data is copied. */
  successMessage: string;
  /** The message that will be shown in a toast if the text can't be copied. */
  errorMessage: string;
}

@Component({
  selector: 'app-share-link',
  templateUrl: './share-link.component.html',
  styleUrls: ['./share-link.component.scss']
})
export class ShareLinkComponent implements OnInit {
  defaultData: ShareLinkData = {
    title: 'Share',
    description: 'Copy this link to share it with someone else',
    textToCopy: 'placeholder',
    successMessage: 'Text successfully copied to clipboard!',
    errorMessage: 'Text could not be copied to clipboard.',
  };
  valuesToUse: ShareLinkData;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Partial<ShareLinkData>,
    private cb: Clipboard,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.valuesToUse = {...this.defaultData, ...this.data};
  }

  onClickCopy(){
    const success = this.cb.copy(this.valuesToUse.textToCopy);
    if (success) {
      this.snackBar.open(this.valuesToUse.successMessage, 'Close', { duration: 2000 });
    } else {
      this.snackBar.open(this.valuesToUse.errorMessage, 'Close', { duration: 2000 });
    }
  }

}
