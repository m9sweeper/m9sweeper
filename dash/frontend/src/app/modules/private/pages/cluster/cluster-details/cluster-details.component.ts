import { Component, HostListener, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
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

  leftNavWidth: number;
  clusterDashWidth: number;
  mainDivWidth: number;

  constructor(
    private clusterService: ClusterService,
    private sharedSubscriptionService: SharedSubscriptionService,
    private route: ActivatedRoute,
  )
  {}

  ngOnInit(): void {

    this.getClusterById(this.route.snapshot.params.id);
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

  expand() {
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
  getClusterById(clusterId: number) {
    this.clusterService.getClusterById(clusterId).subscribe(response => {
      this.isClusterLoaded = true;
      this.cluster = response.data;
    });
  }
}
