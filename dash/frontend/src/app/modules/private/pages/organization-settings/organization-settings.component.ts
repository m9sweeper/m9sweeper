import {Component, HostListener, OnInit} from '@angular/core';
import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-organization-settings',
  templateUrl: './organization-settings.component.html',
  styleUrls: ['./organization-settings.component.scss']
})
export class OrganizationSettingsComponent implements OnInit {

  faIcons: any = {
    arrowDoubleLeft: faAngleDoubleLeft,
    arrowDoubleRight: faAngleDoubleRight
  };

  leftNavWidth: number;
  mainDivWidth: number;

  constructor() {
  }

  ngOnInit(): void {}

  @HostListener('window:resize', ['$event'])
  collapseIfSmallScreen() {
    const mainDiv = document.querySelector('.main-container');
    this.mainDivWidth = mainDiv.clientWidth;

    const leftNavTag = document.getElementById('left-nav');
    const clusterDashTag = document.getElementById('cluster-dashboard');

    if (this.mainDivWidth < 800 ){
      leftNavTag.className += ' responsive';
      clusterDashTag.className += ' responsive';
    }
  }

  expand() {
    // collapse or expand left nav

    // get the current left nav menu width    // get the current left nav menu width
    const leftNav = document.querySelector('.cluster-group-menu');
    this.leftNavWidth = leftNav.clientWidth;
    // find associated class by id
    const leftNavTag = document.getElementById('left-nav');
    const clusterDashTag = document.getElementById('cluster-dashboard');
    // check whether to expand or collapse left nav
    if (this.leftNavWidth === 300){
      leftNavTag.className += ' responsive';
      clusterDashTag.className += ' responsive';
    }else{
      leftNavTag.className = 'cluster-group-menu';
      clusterDashTag.className = 'cluster-dashboard';
    }

  }
}
