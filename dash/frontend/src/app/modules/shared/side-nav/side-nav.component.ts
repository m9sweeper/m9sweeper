import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {
  sidenavExpanded = true;

  constructor() {}

  ngOnInit() {}

  expandSidenav(willBeOpen: boolean) {
    this.sidenavExpanded = willBeOpen;
  }
  public toggleExpandCollapse() {
    this.expandSidenav(!this.sidenavExpanded);
  }
}
