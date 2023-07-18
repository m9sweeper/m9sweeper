import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ClusterService } from '../../../../core/services/cluster.service';
import { IClusterGroup } from '../../../../core/entities/IClusterGroup';
import { ClusterGroupService } from '../../../../core/services/cluster-group.service';
import { JwtAuthService } from '../../../../core/services/jwt-auth.service';
import { Subscription } from 'rxjs';
import {SharedSubscriptionService} from '../../../../core/services/shared.subscription.service';
import {AddClusterWizardComponent} from '../cluster/add-cluster-wizard/add-cluster-wizard.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  groupId: any;
  userClusterGroups: IClusterGroup[];
  userId: number;
  defaultGroupId: number;
  subscription: Subscription;
  updatedClusterGroup: Subscription;
  colorScheme = ['#3498DB', '#34DBA3', '#DBDB34', '#DB3434', '#AAAAAA'];
  showAddClusterLink = false;
  width: number;
  height: number;
  isAdmin: boolean;

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
    this.getAllClusterByGroupId();
    this.groupId = +this.route.snapshot.params.groupId;
    // this.route.params.subscribe(routeParams => {
    //   this.getClusterByClusterGroupId(routeParams.groupId);
    // });
    this.updatedClusterGroup = this.clusterGroupService.getCurrentGroup()
      .subscribe({
        next: updatedClusterGroup => {
          if (updatedClusterGroup) {
            const tempGroup = this.userClusterGroups?.filter(group => group.id === updatedClusterGroup.groupId) || [];
            const previousClusterGroupIndex = this.userClusterGroups?.indexOf(tempGroup[0]);
            this.userClusterGroups[previousClusterGroupIndex].name = updatedClusterGroup?.name || '';
          }
        }
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
}
