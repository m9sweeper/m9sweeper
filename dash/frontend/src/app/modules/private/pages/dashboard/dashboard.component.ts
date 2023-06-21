import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ClusterService } from '../../../../core/services/cluster.service';
import { IClusterGroup } from '../../../../core/entities/IClusterGroup';
import { ClusterGroupService } from '../../../../core/services/cluster-group.service';
import { JwtAuthService } from '../../../../core/services/jwt-auth.service';
import { ClusterGroupCreateComponent } from '../cluster-group/cluster-group-create/cluster-group-create.component';
import { Subscription } from 'rxjs';
import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import {SharedSubscriptionService} from '../../../../core/services/shared.subscription.service';
import {AddClusterWizardComponent} from '../cluster/add-cluster-wizard/add-cluster-wizard.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  faIcons: any = {
    arrowDoubleLeft: faAngleDoubleLeft,
    arrowDoubleRight: faAngleDoubleRight
  };

  clustersList: any;
  groupId: any;
  userClusterGroups: IClusterGroup[];
  userId: number;
  defaultGroupId: number;
  subscription: Subscription;
  updatedClusterGroup: Subscription;
  colorScheme = ['#3498DB', '#34DBA3', '#DBDB34', '#DB3434', '#AAAAAA'];
  azureColorSchema = ['#004C1A', '#AA0000', '#2F6C71', '#B600A0', '#008272', '#001E51', '#004B51'];
  showAddClusterLink = false;
  width: number;
  height: number;
  isExpanded: boolean;
  initialWidth: any;
  isSmallDevice = false;
  isSmallSize: boolean;
  isAdmin: boolean;
  leftNavWidth: number;
  mainDivWidth: number;

  constructor(
    private clusterService: ClusterService,
    private sharedSubscriptionService: SharedSubscriptionService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private  router: Router,
    private clusterGroupService: ClusterGroupService,
    private jwtAuthService: JwtAuthService
  )
  {
    this.userId = this.jwtAuthService.getCurrentUserData().id;
    this.isAdmin = this.jwtAuthService.isAdmin();
  }

  ngOnInit(): void {
   // this.isExpanded = localStorage.getItem('expand') ? JSON.parse(localStorage.getItem('expand')) : true;
   // this.sharedSubscriptionService.setCurrentExpandStatus(this.isExpanded);
    this.width = document.documentElement.clientWidth;
   // this.height = document.documentElement.clientHeight - 50;
   // this.initialWidth = document.documentElement.clientWidth;
    this.screenSizeExpand(this.width); // for charts?
    this.getAllClusterByGroupId();
    this.groupId = +this.route.snapshot.params.groupId;
    // this.route.params.subscribe(routeParams => {
    //   this.getClusterByClusterGroupId(routeParams.groupId);
    // });
    this.updatedClusterGroup = this.clusterGroupService.getCurrentGroup().subscribe(updatedClusterGroup => {
      const tempGroup = this.userClusterGroups.filter(group => group.id === updatedClusterGroup.groupId);
      const previousClusterGroupIndex = this.userClusterGroups.indexOf(tempGroup[0]);
      this.userClusterGroups[previousClusterGroupIndex].name = updatedClusterGroup.name;
    });
  }

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
/*
  @HostListener('window:resize', ['$event'])
  calculateScreenSize($event?: any) {
    this.scrHeight = document.documentElement.clientHeight;
    this.scrWidth = document.documentElement.clientWidth;
    this.isSmallDevice = false;
    this.screenSizeExpand(this.scrWidth);
  }

  set scrHeight(val: number) {
    if (val !== this.height) {
      this.height = val - 50;
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

 */

  getClusterByClusterGroupId(groupId: number) {
    this.subscription = this.clusterService.getClustersByClusterGroupId(groupId).subscribe(response => {
      this.clustersList = response.data;
      this.clusterService.sendData(this.clustersList);
    });
  }

  getAllClusterByGroupId(){
    this.clusterGroupService.getClusterGroups().subscribe(groups => {
      if (groups.data) {
        this.showAddClusterLink = true;
        this.userClusterGroups = groups.data;
        this.defaultGroupId = this.userClusterGroups[0].id;
        if (this.router.url === '/private/dashboard') {
          this.router.navigate(['/private/dashboard', 'group', this.userClusterGroups[0].id]);
        }
      }
      else {
        this.openDefaultCreateClusterDialog();
      }
    });
  }

  openDefaultCreateClusterDialog() {
    const openAddCluster = this.dialog.open(AddClusterWizardComponent, {
      width: '900px',
      height: '75%',
      minHeight: '300px',
      closeOnNavigation: true,
      disableClose: true,
      data: { groupId:  null}
    });
    openAddCluster.afterClosed().subscribe(response => {
      if (response && response?.result === true) {
        this.getAllClusterByGroupId();
      }
    });
  }

  openAddGroupDialog() {
    // this.menubarCollapse();
    const confirmDialog = this.dialog.open(ClusterGroupCreateComponent, {
      width: '520px',
      closeOnNavigation: true,
      disableClose: true,
      data: {}
    });
    confirmDialog.afterClosed().subscribe(result => {
      if (result === undefined) {
        this.getAllClusterByGroupId();
      }
    });
  }

  shortGroupName(name: string){
    const trimmedName = name.trim();
    if (trimmedName.length > 1 ) {
    const splitNameArray = trimmedName.split(' ').filter(value => value);
    return splitNameArray.length > 1 ? splitNameArray[0][0] + splitNameArray[1][0] : splitNameArray[0].substr(0, 2);
  }
    return trimmedName;
  }

  calculateMenuColor(rowIndex: number ) {
    if (rowIndex < 5) {
      return this.azureColorSchema[rowIndex];
    }
    return this.azureColorSchema[rowIndex % 7];
  }
/*
  menubarCollapse(){
    if (this.isSmallDevice){
      this.expand();
    }
  }

 */
  expand(){
    // collapse or expand left nav

    // get the current left nav menu width
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
/*
  expandMenuBarForSmallDevice(width: number){
    let menuWidth: number;
    let containerWidth: number;
    if (this.isSmallDevice){
      this.isExpanded = true;
      menuWidth = 300;
      containerWidth =  width;
    }
    else {
      this.isExpanded = false;
      menuWidth = 65;
      containerWidth = width - menuWidth;
    }
  //  document.documentElement.style.setProperty('--dashboard-container-height', `${this.height}px`);
  //  document.documentElement.style.setProperty('--dashboard-container-width', `${containerWidth}px`);
  //  document.documentElement.style.setProperty('--dashboard-navbar-menu-width', `${menuWidth}px`);
  }
*/
  screenSizeExpand(width: number){
    let menuWidth: number;
    let containerWidth: number;

    if (width <= 800) {
      menuWidth = 65;
      this.isSmallSize = true;
      this.isExpanded = false;
    } else {
      this.isSmallSize = false;
      this.isSmallDevice = false;
      if (this.isExpanded) {
        menuWidth = 300;
      } else {
        menuWidth = 65;
      }
    }
    containerWidth = width - menuWidth;
   // document.documentElement.style.setProperty('--dashboard-container-height', `${this.height}px`);
    document.documentElement.style.setProperty('--dashboard-container-width', `${containerWidth}px`);
   // document.documentElement.style.setProperty('--dashboard-navbar-menu-width', `${menuWidth}px`);
  }


}
