import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClusterService } from '../../../../../core/services/cluster.service';
import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import {SharedSubscriptionService} from '../../../../../core/services/shared.subscription.service';

@Component({
  selector: 'app-cluster-details',
  templateUrl: './cluster-details.component.html',
  styleUrls: ['./cluster-details.component.scss']
})
export class ClusterDetailsComponent implements OnInit {

  faIcons: any = {
    arrowDoubleLeft: faAngleDoubleLeft,
    arrowDoubleRight: faAngleDoubleRight
  };

  cluster: any;
  groupId: any;
  isClusterLoaded = false;
  height: number;
  width: number;
  isExpanded: boolean;
  isSmallSize: boolean;
  isSmallDevice = false;
  constructor(
    private clusterService: ClusterService,
    private sharedSubscriptionService: SharedSubscriptionService,
    private route: ActivatedRoute,
  )
  {}

  ngOnInit(): void {
    this.isExpanded = localStorage.getItem('expand') ? JSON.parse(localStorage.getItem('expand')) : true;
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.screenSizeExpand(this.width);
    document.documentElement.style.setProperty('--cluster-details-height', `${this.height}px`);
    this.getClusterById(this.route.snapshot.params.id);
  }

  @HostListener('window:resize', ['$event'])
  calculateScreenSize($event?: any) {
    this.scrHeight = document.documentElement.clientHeight;
    this.scrWidth = document.documentElement.clientWidth;
    this.isSmallDevice = false;
    document.documentElement.style.setProperty('--cluster-details-height', `${this.height}px`);
    document.documentElement.style.setProperty('--dashboard-details-width', `${this.width}px`);
    this.screenSizeExpand(this.scrWidth);
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
  menubarCollapse(){
    if (this.isSmallDevice){
      this.expand();
    }
  }
  expand() {
    if (this.isSmallSize) {
      this.isSmallDevice = !this.isSmallDevice;
      this.expandMenuBarForSmallDevice(this.width);
    }
    else {
      this.isExpanded = !this.isExpanded;
      localStorage.setItem('expand', `${this.isExpanded}`);
      this.screenSizeExpand(this.width);
    }
    this.sharedSubscriptionService.setCurrentExpandStatus(this.isExpanded);
  }

  expandMenuBarForSmallDevice(width: number) {
    let menuWidth: number;
    let containerWidthForSmallDevice: number;
    if (this.isSmallDevice){
      this.isExpanded = true;
      menuWidth = 300;
      containerWidthForSmallDevice =  width;
    }
    else {
      this.isExpanded = false;
      menuWidth = 65;
      containerWidthForSmallDevice = width - menuWidth;
    }
    document.documentElement.style.setProperty('--navigation-menu-width', `${menuWidth}px`);
    document.documentElement.style.setProperty('--cluster-container-width', `${containerWidthForSmallDevice}px`);
  }
  screenSizeExpand(width: number) {
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
        containerWidth =  width - menuWidth;
      } else {
        menuWidth = 65;
        containerWidth = width - menuWidth;
      }
    }
    document.documentElement.style.setProperty('--navigation-menu-width', `${menuWidth}px`);
    document.documentElement.style.setProperty('--cluster-container-width', `${containerWidth}px`);
  }
  getClusterById(clusterId: number) {
    this.clusterService.getClusterById(clusterId).subscribe(response => {
      this.isClusterLoaded = true;
      this.cluster = response.data;
    });
  }
}
