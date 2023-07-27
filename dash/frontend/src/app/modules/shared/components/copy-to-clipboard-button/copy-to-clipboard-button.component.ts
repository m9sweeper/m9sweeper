import {Component, Input} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-copy-to-clipboard-button',
  templateUrl: './copy-to-clipboard-button.component.html',
})
export class CopyToClipboardButtonComponent {
  /** The text that will be copied to the user's clipboard when they click the button. */
  @Input() text: string;

  /** The message that will be shown in a toast if the data is copied. */
  @Input() successMessage = 'Text successfully copied to clipboard!';

  /** The message that will be shown in a toast if the text can't be copied. */
  @Input() errorMessage = 'Text could not be copied to clipboard.';

  /** Display only an icon as the button if true */
  @Input() iconButton = false;

  constructor(
    private cb: Clipboard,
    private readonly snackBar: MatSnackBar,
    ) { }

  copy() {
    const success = this.cb.copy(this.text);
    if (success) {
      this.snackBar.open(this.successMessage, 'Close', { duration: 2000 });
    } else {
      this.snackBar.open(this.errorMessage, 'Close', { duration: 2000 });
    }
  }
}
