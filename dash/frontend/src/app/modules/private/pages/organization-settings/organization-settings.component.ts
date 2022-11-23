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

  width: number;
  height: number;
  isExpanded: boolean;
  isSmallSize: boolean;
  isSmallDevice = false;

  constructor() {
  }

  ngOnInit(): void {
    this.isExpanded = localStorage.getItem('expand') ? JSON.parse(localStorage.getItem('expand')) : true;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    document.documentElement.style.setProperty('--organization-container-height', `${this.height}px`);
    this.screenSizeMaintenance(this.width);
  }

  @HostListener('window:resize', ['$event'])
  calculateScreenSize($event?: any) {
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
    this.isSmallDevice = false;
    document.documentElement.style.setProperty('--organization-container-height', `${this.height}px`);
    this.screenSizeMaintenance(this.scrWidth);
  }

  set scrHeight(val: number) {
    if (val !== this.height) {
      this.height = val;
    }
  }

  get scrHeight(): number {
    return this.height;
  }

  set scrWidth(val: number) {
    if (val !== this.width) {
      this.width = val;
    }
  }

  get scrWidth(): number {
    return this.width;
  }

  expand() {
    if (this.isSmallSize) {
      this.isSmallDevice = !this.isSmallDevice;
      this.expandMenuBarForSmallDevice(this.width);
    } else {
      this.isExpanded = !this.isExpanded;
      localStorage.setItem('expand', `${this.isExpanded}`);
      this.screenSizeMaintenance(this.width);
    }
  }
  expandMenuBarForSmallDevice(width: number) {
    let menuWidth: number;
    let containerWidthForSmallDevice: number;
    if (this.isSmallDevice) {
      this.isExpanded = true;
      menuWidth = 300;
      containerWidthForSmallDevice = width;
    } else {
      this.isExpanded = false;
      menuWidth = 65;
      containerWidthForSmallDevice = width - menuWidth;
    }
    document.documentElement.style.setProperty('--navigation-menu-width', `${menuWidth}px`);
    document.documentElement.style.setProperty('--organization-container-width', `${containerWidthForSmallDevice}px`);
  }

  screenSizeMaintenance(width: number) {
    let menuWidth: number;
    let containerWidth: number;
    if (width <= 800) {
      menuWidth = 65;
      containerWidth = width - menuWidth;
      this.isSmallSize = true;
      this.isExpanded = false;
    } else {
      this.isSmallSize = false;
      this.isSmallDevice = false;
      if (this.isExpanded) {
        menuWidth = 300;
        containerWidth = width - menuWidth;
      } else {
        menuWidth = 65;
        containerWidth = width - menuWidth;
      }
    }
    document.documentElement.style.setProperty('--navigation-menu-width', `${menuWidth}px`);
    document.documentElement.style.setProperty('--organization-container-width', `${containerWidth}px`);
  }

}
