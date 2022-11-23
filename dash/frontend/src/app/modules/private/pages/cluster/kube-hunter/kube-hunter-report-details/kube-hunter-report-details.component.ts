import { Component, OnInit } from '@angular/core';
import {take} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {IKubeHunterReport, IKubeHunterVulnerabilities} from '../../../../../../core/entities/IKubeHunterReport';
import {KubeHunterService} from '../../../../../../core/services/kube-hunter.service';
import {MatTableDataSource} from '@angular/material/table';
import {ClusterService} from '../../../../../../core/services/cluster.service';
import {ICluster} from '../../../../../../core/entities/ICluster';

@Component({
  selector: 'app-kube-hunter-report-details',
  templateUrl: './kube-hunter-report-details.component.html',
  styleUrls: ['./kube-hunter-report-details.component.scss']
})
export class KubeHunterReportDetailsComponent implements OnInit {

  id: number;
  dateRan: string;
  cluster: ICluster;
  report: IKubeHunterReport;
  nodes: any;
  vulnerabilities: IKubeHunterVulnerabilities[];
  issues: {[location: string]: IKubeHunterVulnerabilities[]} = {};


  displayedColumns: string[] = ['severity', 'category', 'vulnerability', 'description', 'additionalInfo'];
  dataSource: MatTableDataSource<IKubeHunterVulnerabilities>[] = [];
  location: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private kubehunterService: KubeHunterService,
    private clusterService: ClusterService,
  ) {
    this.id = +this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.kubehunterService
      .getKubeHunterReportById(this.id)
      .pipe(take(1))
      .subscribe(report => {
        this.report = report;
        this.vulnerabilities = JSON.parse(report.vulnerabilities).value.value as IKubeHunterVulnerabilities[];
        for (const vuln of this.vulnerabilities) {
          if (this.issues[vuln.location]) {
            this.issues[vuln.location].push(vuln);
          } else {
            this.issues[vuln.location] = [vuln];
          }
        }
        this.dateRan = new Date(+report.createdAt).toLocaleDateString();
        this.getCluster(report.clusterId);
        this.populateTable();
    });
  }

  populateTable() {
    this.dataSource = Object.keys(this.issues).map( issue => {
      this.location.push(issue);
      return new MatTableDataSource(this.issues[issue]);
    });
  }

  getCluster(clusterId: number) {
    this.clusterService.getClusterById(clusterId).pipe(take(1)).subscribe(cluster => this.cluster = cluster.data);
  }
}
