import {Component, Input} from '@angular/core';

interface BreadcrumbInfo {
  place: number;  // location in the list
  link?: string[];  // the routerLink array (if it should be a link)
  text: string;
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent {
  @Input() breadcrumbs: BreadcrumbInfo[];

  constructor() {}
}
