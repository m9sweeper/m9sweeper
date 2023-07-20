import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-hideable-text',
  templateUrl: './hideable-text.component.html',
  styleUrls: ['./hideable-text.component.scss']
})
export class HideableTextComponent {

  // tslint:disable-next-line:variable-name
  protected _text: string;
  stars = '';



  /** The text to be hidden/shown (and copied if enabled) */
  @Input('text')
  set text(value: string) {
    this._text = value;
    // Unicode character 2217 is the 'Asterisk Operator'.
    // A standard asterisk is displayed above the vertical center of the line height
    // This kind is vertically centered
    // Thus, we use this because if we used normal asterisks, the text wouldn't look centered
    this.stars = '\u2217'.repeat(this._text?.length || 0);
  }

  get text(): string {
    return this._text;
  }
  /** Enables/disables the copy to clipboard button */
  @Input() canCopy = false;

  /** Set the hidden (When a variable passed here is changed, it will override the current status) */
  @Input('hidden') hidden = true;

  toggleHidden() {
    this.hidden = !this.hidden;
  }
}
