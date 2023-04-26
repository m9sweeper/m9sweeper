import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {KubeBenchDialogComponent} from './kube-bench-dialog/kube-bench-dialog.component';
import {FormBuilder, } from '@angular/forms';
import {KubeBenchService} from '../../../../../core/services/kube-bench.service';
import {take} from 'rxjs/operators';
import {IKubeBenchLog, IKubeBenchReport} from '../../../../../core/entities/IKubeBenchReport';
import {ActivatedRoute, Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {UserService} from '../../../../../core/services/user.service';
import {KubeBenchDeleteReportDialogComponent} from './kube-bench-delete-report-dialog/kube-bench-delete-report-dialog.component';

@Component({
  selector: 'app-kube-bench',
  templateUrl: './kube-bench.component.html',
  styleUrls: ['./kube-bench.component.scss']
})
export class KubeBenchComponent implements OnInit {

  subMenuTitle: string;
  displayedColumns = ['date', 'total pass', 'total fail', 'total warnings'];
  datasource: IKubeBenchReport[];
  lastRun: IKubeBenchLog;
  clusterId: number;
  benchmarkStatus: string;
  statusInvalid: boolean;
  ourAdvice: string;
  isSuperAdmin = false;
  firstRun = true;

  reportCount: number;
  page: number;
  limit = this.getLimitFromLocalStorage() ? Number (this.getLimitFromLocalStorage()) : 20;


  constructor(
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private kubeBenchService: KubeBenchService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private router: Router,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.route.parent.params.pipe(take(1)).subscribe(param => this.clusterId = param.id);
    this.subMenuTitle = 'Kube Bench';
    this.getAllBenchReportsByCluster(this.clusterId);
  }

  openDialog() {
    this.dialog.open(KubeBenchDialogComponent, {
      maxWidth: '1000px',
      minWidth: '800px',
      maxHeight: '80vh',
      closeOnNavigation: true,
      disableClose: false,
      data: {
        clusterId: this.clusterId
      }
    });
  }

  getUserAuthority() {
    return this.userService.getAuthorityList().pipe(take(1)).subscribe(authList => {
      for (const authLevel of authList.data) {
        if (authLevel.type === 'SUPER_ADMIN') {
          this.isSuperAdmin = true;
          this.displayedColumns.push('delete');
          break;
        }
      }
    });
  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getAllBenchReportsByCluster(this.clusterId, this.limit, this.page);

  }

  async getAllBenchReportsByCluster(clusterId: number, limit?: number, page?: number) {
      return this.kubeBenchService.getAllBenchReportsByCluster(this.clusterId, this.limit, this.page)
        .pipe(take(1))
        .subscribe(rtrn => {
          // The API returns the data sorted
          this.lastRun = rtrn.list[0]?.resultsJson;
          this.datasource = rtrn.list;
          this.getOurAdvice(rtrn.list[0]?.createdAt || -1);
          if (this.isSuperAdmin) {
            for (const row of this.datasource) {
              row.superAdmin = true;
            }
          }
          this.reportCount = rtrn.reportCount;
        }, e => {
          this.datasource = [];
          if (e.status === 404) {
            this.ourAdvice = 'Run kube-bench to ensure your clusters meet CIS security standards!';
            this.benchmarkStatus = 'No Reports Found';
            this.statusInvalid = true;
          }
        });
  }

  unixToDate(input: number): string {
    return this.datePipe.transform(input, 'MM/dd/yyyy');
  }

  getOurAdvice(lastRunTime: number){
    if (lastRunTime === -1) {
      this.ourAdvice = 'Run kube-bench to ensure your clusters meet CIS security standards!';
      this.benchmarkStatus = 'No Reports Found';
      this.statusInvalid = true;
      return;
    }
    const dateNow = new Date().getTime();
    if (lastRunTime < dateNow - 30 * (86400000)){
      this.ourAdvice = 'It has been more than 30 days since your last security check. We recommend you run Kube Bench again.';
      this.benchmarkStatus = 'Report Outdated';
      this.statusInvalid = true;
    } else {
      this.ourAdvice = 'You do not need to run Kube Bench again.';
      this.benchmarkStatus = 'Report Valid';
      this.statusInvalid = false;
    }
  }

  deleteReport(id: number) {
    const deleteDialog = this.dialog.open(KubeBenchDeleteReportDialogComponent, {
      closeOnNavigation: true,
      disableClose: false,
    });
    deleteDialog.afterClosed().subscribe(result => {
      if (result) {
        this.kubeBenchService.deleteKubeBenchReportById(id).pipe(take(1)).subscribe( () => {
          this.getAllBenchReportsByCluster(this.clusterId);
          });
      }
    });
  }

  toReportDetails(id: string){
      this.router.navigate(['/private', 'clusters', this.clusterId, 'kubebench', id]);
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('image_table_limit', String(limit));
  }
  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('image_table_limit');
  }

}
