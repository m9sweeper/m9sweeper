import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {take, tap} from 'rxjs/operators';
import {KubeHunterService} from '../../../../../core/services/kube-hunter.service';
import {IKubeHunterReport} from '../../../../../core/entities/IKubeHunterReport';
import {ActivatedRoute, Router} from '@angular/router';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import {KubeHunterDialogComponent} from './kube-hunter-dialog/kube-hunter-dialog.component';
import {NgxUiLoaderService} from 'ngx-ui-loader';

@Component({
  selector: 'app-kube-hunter',
  templateUrl: './kube-hunter.component.html',
  styleUrls: ['./kube-hunter.component.scss']
})
export class KubeHunterComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();
  clusterId: number;
  allReportsForCluster: IKubeHunterReport[];
  scansExist = false;
  mostRecentVulnerabilities = {low: 0, medium: 0, high: 0};
  receivedResponse = false;

  penetrationTestStatusInvalid: boolean;
  penetrationTestText: string;

  displayedColumns: string[] = ['date', 'time', 'numVulnerabilities'];
  dataSource: MatTableDataSource<any>;

  reportCount = 0;
  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 20;
  page = 0;
  ourAdvice: string;

  constructor(
    private kubeHunterService: KubeHunterService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private loaderService: NgxUiLoaderService,
  ) {}

  ngOnInit(): void {
    this.route.parent.params.pipe(take(1)).subscribe(param => this.clusterId = param.id);
    this.getReports();
  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getReports();
  }

  getReports() {
    this.kubeHunterService
      .allReportsForCluster(this.clusterId, this.limit, this.page)
      .pipe(
        tap(() => this.loaderService.start()),
        take(1),
      )
      .subscribe(res => {
        this.receivedResponse = true;
        this.scansExist = !!res?.list?.length;
        this.allReportsForCluster = res?.list || [];
        this.reportCount = res?.reportCount || 0;
        res?.list?.forEach(reports => {
          reports.nodes = JSON.parse(reports.nodes);
          reports.services = JSON.parse(reports.services);
          reports.vulnerabilities = JSON.parse(reports.vulnerabilities);
        });
        this.populateMessages(res?.list[0]);
        this.populateTable();
      }, (e) => {
        if (e.status === 404) {
          this.ourAdvice = 'Run kube-hunter to find vulnerabilities within your cluster.';
          this.penetrationTestText = 'Unknown';
        }
      },
      () => this.loaderService.stop());
  }

  populateTable() {
    this.dataSource = new MatTableDataSource(this.allReportsForCluster);
  }

  populateMessages(recentScan: IKubeHunterReport): void {
    // Reset vulnerability counts
    this.mostRecentVulnerabilities.high = this.mostRecentVulnerabilities.medium
      = this.mostRecentVulnerabilities.low = 1;

    if (!recentScan) {
      this.ourAdvice = 'Run kube-hunter to audit your cluster security';
      this.penetrationTestText = 'Not yet run';
      this.penetrationTestStatusInvalid = true;
      return;
    }
    // Calculate the messaging for the penetration test status & Our advice column based on
    // how long it has been since the most recent scan
    const daysPassed = Math.floor((Date.now() - recentScan.createdAt) / (1000 * 60 * 60 * 24));
    if (daysPassed >= 90) {
      this.ourAdvice = 'It has been ' + daysPassed + ' days since you ran kube-hunter. You should run it again soon.';
      this.penetrationTestStatusInvalid = true;
      this.penetrationTestText = 'Report Outdated';
    } else if (daysPassed >= 10) {
      this.ourAdvice = 'It has been ' + daysPassed + ' days since you last ran kube-hunter.';
      this.penetrationTestStatusInvalid = true;
      this.penetrationTestText = 'Report Outdated';
    } else {
      this.ourAdvice = 'It has been ' + daysPassed + ' days since you last ran kube-hunter.';
      this.penetrationTestStatusInvalid = false;
      this.penetrationTestText = 'Report Valid';
    }
    recentScan.vulnerabilities?.value?.value?.forEach(vulnerability => {
      if (vulnerability.severity === 'low') {
        this.mostRecentVulnerabilities.low += 1;
      } else if (vulnerability.severity === 'medium') {
        this.mostRecentVulnerabilities.medium += 1;
      } else if (vulnerability.severity === 'high') {
        this.mostRecentVulnerabilities.high += 1;
      }
    });
}

  openDialog() {
    const dialog = this.dialog.open(KubeHunterDialogComponent, {
      maxWidth: '800px',
      maxHeight: '80vh',
      closeOnNavigation: true,
      disableClose: false,
      data: {
        clusterId: this.clusterId,
      }
    });

    dialog.afterClosed()
      .pipe(take(1))
      .subscribe((data?: { dontRefresh?: boolean }) => {
        // If closed after navigating away, dontRefresh should be true.
        // If closing by clicking off the modal data will be undefined
        if (!data?.dontRefresh) {
          this.getReports();
        }
      });
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('KH_table_limit', String(limit));
  }

  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('KH_table_limit');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
