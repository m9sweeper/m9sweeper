import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClusterService } from '../../../../../core/services/cluster.service';

@Component({
  selector: 'app-cluster-details',
  templateUrl: './cluster-details.component.html',
  styleUrls: ['./cluster-details.component.scss']
})
export class ClusterDetailsComponent implements OnInit {
  cluster: any;
  groupId: any;
  isClusterLoaded = false;

  constructor(
    private clusterService: ClusterService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.getClusterById(this.route.snapshot.params.id);
  }

  getClusterById(clusterId: number) {
    this.clusterService.getClusterById(clusterId).subscribe(response => {
      this.isClusterLoaded = true;
      this.cluster = response.data;
    });
  }
}
