import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Breadcrumb} from './breadcrumb.interface';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent implements OnChanges {
  @Input() breadcrumbs: Breadcrumb[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    // order these by the place
    this.breadcrumbs.sort((a, b) => a.place - b.place);
  }
}
