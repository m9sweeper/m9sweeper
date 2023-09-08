import {Component, Input} from '@angular/core';
import {UtilService} from '../../../../core/services/util.service';

/**
 * Will display text, cutting it off with an ellipsis after two lines.
 * If clickable, clicking on the text will open the text in a dialog.
 */
@Component({
  selector: 'app-ellipsis-text',
  templateUrl: './ellipsis-text.component.html',
  styleUrls: ['./ellipsis-text.component.scss']
})
export class EllipsisTextComponent {
  /** The text that will be displayed.
   * Used as the body of the dialog when opened in clickable mode
  **/
  @Input() text: string;
  /** The header for the dialog when displaying the dialog  */
  @Input() dialogHeader?: string;
  /** Whether the text can be clicked to open the full text in a dialog */
  @Input() clickable = true;

  constructor(
    protected readonly utilsService: UtilService
  ) {}


  displayDialog(): void {
    if (this.clickable) {
      this.utilsService.showGenericMessageDialog(this.dialogHeader, this.text);
    }
  }
}
