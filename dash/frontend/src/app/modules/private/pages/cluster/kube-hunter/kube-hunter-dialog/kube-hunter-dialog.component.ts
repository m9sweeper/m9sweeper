import {Component, Inject, OnInit} from '@angular/core';
import {CommonService} from '../../../../../../core/services/common.service';
import {switchMap, take, takeUntil, takeWhile} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {Subject, timer} from 'rxjs';
import {IKubeHunterReport} from '../../../../../../core/entities/IKubeHunterReport';
import {KubeHunterService} from '../../../../../../core/services/kube-hunter.service';
import {AlertService} from 'src/app/core/services/alert.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-kube-hunter-dialog',
  templateUrl: './kube-hunter-dialog.component.html',
  styleUrls: ['./kube-hunter-dialog.component.scss']
})
export class KubeHunterDialogComponent implements OnInit {

  cronjobOpt = true;
  cronjobTime = 'daily';
  isCompleted = true;
  backendUrl: string;
  clusterId: number;
  report: IKubeHunterReport;
  modalOpened = Date.now();

  cronjobScheduleOpts = {
    weekly: '0 0 * * 0',
    daily: '0 0 * * *',
    monthly: '0 0 1 * *'
  };

  private unsubscribe$ = new Subject<void>();
  apiKey: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { clusterId: number },
    private matDialogRef: MatDialogRef<KubeHunterDialogComponent>,
    private commonService: CommonService,
    private loaderService: NgxUiLoaderService,
    private kubeHunterService: KubeHunterService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loaderService.start();
    this.commonService.getBaseUrl().pipe(take(1)).subscribe(url => {
      this.backendUrl = url.data.baseUrl;
      this.loaderService.stop();

    });
    this.clusterId = this.data.clusterId;
    this.kubeHunterService.getKubeHunterApiKey().pipe(take(1)).subscribe({
      next: response => {
        this.apiKey = response[0]?.api;
      }
    });
    this.lookForReport();
  }

  lookForReport() {
    // Check every 30s to see if a new report has displayed
    timer(30000, 30000).pipe(
      takeWhile(() => !this.report),
      switchMap(() => {
        return this.kubeHunterService.getRecentKubehunterScan(this.clusterId, this.modalOpened);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe((report) => {
      this.report = report;
      if (this.report) {
        this.alertService.info('kube-hunter done running');
      }
    });
  }

  viewReport(id: number) {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'kubehunter', id])
      .then(() => this.matDialogRef.close({ dontRefresh: true}));
  }
}


