import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})

export class ReportsComponent implements OnInit, OnDestroy {
  clusterId: number;
  private unsubscribe$ = new Subject<void>();

  listOfReports: {
    title: string,
    description: string,
    path: string[],
    icon: string,
  }[] = [];

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.parent.parent.params
      .pipe(take(1))
      .subscribe(param => {
        this.clusterId = param.id;
        this.buildListOfReports();
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  buildListOfReports() {
    this.listOfReports = [
      {
        title: 'Vulnerability Export',
        description: 'Export details about every CVE that is running or was running in the cluster',
        path: ['/private', 'clusters', this.clusterId.toString(), 'reports', 'vulnerability-export'],
        icon: 'list_alt',
      },
      {
        title: 'Vulnerability Visualization',
        description: 'Display a visualization of vulnerabilities on the cluster',
        path: ['/private', 'clusters', this.clusterId.toString(), 'reports', 'vulnerability-visualization'],
        icon: 'analytics',
      },
      {
        title: 'Running Vulnerabilities',
        description: 'A description of every running image and the total vulnerabilities it has',
        path: ['/private', 'clusters', this.clusterId.toString(), 'reports', 'running-vulnerabilities'],
        icon: 'warning',
      },
      {
        title: 'Vulnerability History',
        description: 'A break down of your overall security posture by day over the past month.',
        path: ['/private', 'clusters', this.clusterId.toString(), 'reports', 'historical-vulnerabilities'],
        icon: 'history',
      },
      {
        title: 'Images by Worst Vulnerability',
        description: 'Display a visualization of all images running on the cluster grouped by the highest severity vulnerability present on each',
        path: ['/private', 'clusters', this.clusterId.toString(), 'reports', 'worst-images'],
        icon: 'stacked_bar_chart',
      },
      {
        title: 'Vulnerability Difference Over Time',
        description: 'Display a chart of how many vulnerabilities in the cluster have been removed or added by day',
        path: ['/private', 'clusters', this.clusterId.toString(), 'reports', 'vulnerability-difference-over-time'],
        icon: 'query_stats',
      },
      {
        title: 'Vulnerability Difference By Date',
        description: 'Display a list of vulnerabilities fixed and vulnerabilities added between two dates',
        path: ['/private', 'clusters', this.clusterId.toString(), 'reports', 'vulnerability-difference-by-date'],
        icon: 'addchart',
      },
      {
        title: 'Printable Audit Report',
        description: 'Generate a PDF report',
        path: ['/private', 'clusters', this.clusterId.toString(), 'reports', 'printable-audit-report'],
        icon: 'print',
      },
    ];
  }
}
