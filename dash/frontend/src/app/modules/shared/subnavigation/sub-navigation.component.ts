import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {Authority} from '../../../core/enum/Authority';

@Component({
  selector: 'app-sub-navigation',
  templateUrl: './sub-navigation.component.html',
  styleUrls: ['./sub-navigation.component.scss']
})
export class SubNavigationComponent {
  @Input() buttonTitle: string;
  @Input() buttonUrl: any;
  @Input() buttonAllowedRoles: Authority[] = [Authority.READ_ONLY, Authority.ADMIN, Authority.SUPER_ADMIN];
  @Input() button2?: {
    title: string,
    url?: any,
    color?: ThemePalette,
    icon?: string,
    allowedRoles?: Authority[];
  };
  @Input() title: string;
  @Input() buttonIcon: string;
  @Output() buttonClicked = new EventEmitter<any>();
  @Output() button2Clicked = new EventEmitter<any>();

  emitButtonEvent($event) {
    this.buttonClicked.emit($event);
  }
  emitButton2Event($event) {
    this.button2Clicked.emit($event);
  }
}
