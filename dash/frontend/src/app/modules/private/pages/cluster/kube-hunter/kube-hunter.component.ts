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
  daysPassed: number;
  allReportsForCluster: IKubeHunterReport[];
  scansExist = false;
  mostRecentVulnerabilities = {low: 0, medium: 0, high: 0};

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
  ) {
  }

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
        if (res.reportCount > 0) {
          this.scansExist = true;
          res.list.forEach(reports => {
            reports.nodes = JSON.parse(reports.nodes);
            reports.services = JSON.parse(reports.services);
            reports.vulnerabilities = JSON.parse(reports.vulnerabilities);
          });
          this.allReportsForCluster = res.list;
          if (res.list[0] != null){
            this.daysPassed = Math.floor((Date.now() - res.list[0].createdAt) / (1000 * 60 * 60 * 24));
            if (this.daysPassed >= 90){
              this.ourAdvice = 'It has been ' + this.daysPassed + ' days since you ran Kube Hunter. You should run it again soon.';
            } else {
              this.ourAdvice = 'It has been ' + this.daysPassed + ' days since you last ran Kube Hunter.';
            }
            res.list[0].vulnerabilities?.value?.value?.forEach( vulnerability => {
              if (vulnerability.severity === 'low') {
                this.mostRecentVulnerabilities.low += 1;
              } else if (vulnerability.severity === 'medium') {
                this.mostRecentVulnerabilities.medium += 1;
              } else if (vulnerability.severity === 'high') {
                this.mostRecentVulnerabilities.high += 1;
              }
            });
          }
          this.reportCount = res.reportCount;
          this.populateTable();
        }
      }, (e) => {
        if (e.status === 404) {
          this.ourAdvice = 'Run Kube Hunter to find vulnerabilities within your cluster.';
        }
        },
        () => this.loaderService.stop());
  }

  populateTable() {
    this.allReportsForCluster?.forEach(reports => reports.date = new Date(+reports.createdAt).toLocaleString());
    this.dataSource = new MatTableDataSource(this.allReportsForCluster);
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
  toReportDetails(row: IKubeHunterReport) {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'kubehunter', row.id]);
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
