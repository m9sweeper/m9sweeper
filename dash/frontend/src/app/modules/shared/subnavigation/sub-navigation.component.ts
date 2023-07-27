import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sub-navigation',
  templateUrl: './sub-navigation.component.html',
  styleUrls: ['./sub-navigation.component.scss']
})
export class SubNavigationComponent {
  @Input() buttonTitle: string;
  @Input() buttonUrl: any;
  @Input() title: string;
  @Input() buttonIcon: string;
}
