import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BreadcrumbInfo} from '../../../../core/breadcrumbInfo.interface';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent implements OnChanges {
  @Input() breadcrumbs: BreadcrumbInfo[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    // order these by the place
    this.breadcrumbs.sort((a, b) => a.place - b.place);
  }
}
