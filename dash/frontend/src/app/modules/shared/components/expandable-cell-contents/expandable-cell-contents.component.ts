import {Component, Input} from '@angular/core';
import {UtilService} from '../../../../core/services/util.service';

/**
 * Will display text, cutting it off with an ellipsis after two lines.
 * Clicking on the text will open the text in a dialog.
 */
@Component({
  selector: 'app-expandable-cell-contents',
  templateUrl: './expandable-cell-contents.component.html',
  styleUrls: ['./expandable-cell-contents.component.scss']
})
export class ExpandableCellContentsComponent {
  /** The text that will be displayed, and used as the body of the full dialog */
  @Input() text: string;
  /** The header for the dialog when displaying the dialog  */
  @Input() dialogHeader: string;

  constructor(
    protected readonly utilsService: UtilService
  ) {}


  displayDialog(): void {
    this.utilsService.showGenericMessageDialog(this.dialogHeader, this.text);
  }
}
