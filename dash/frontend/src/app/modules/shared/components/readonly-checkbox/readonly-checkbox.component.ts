import {Component, Input} from '@angular/core';
import {ThemePalette} from '@angular/material/core';


@Component({
  selector: 'app-readonly-checkbox',
  templateUrl: './readonly-checkbox.component.html',
  styleUrls: ['./readonly-checkbox.component.scss']
})
export class ReadonlyCheckboxComponent {
  @Input() checked: boolean;
  @Input() indeterminate: boolean;
  @Input() color: ThemePalette = 'primary';

}
