import {Component, Inject, Input, OnInit} from '@angular/core';
import {IKubeSecReport} from '../../../../../../core/entities/IkubeSecReport';
import {MatTableDataSource} from '@angular/material/table';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-kubesec-report',
  templateUrl: './kubesec-report.component.html',
  styleUrls: ['./kubesec-report.component.scss']
})
export class KubeSecReportComponent implements OnInit {
  @Input() kubeSecReport: IKubeSecReport;
  displayName: string;

  passed: any[];
  advise: any[];
  critical: any[];
  criticalDisplayedColumns: string[] = ['criticalId', 'criticalPoints', 'criticalReason'];
  adviseDisplayColumns: string[] = ['adviseId', 'advisePoints', 'adviseReason'];
  passedDisplayColumns: string[] = ['passedId', 'passedPoints', 'passedReason'];
  passedDataSource: MatTableDataSource<any>;
  adviseDataSource: MatTableDataSource<any>;
  criticalDataSource: MatTableDataSource<any>;
  backgroundOpacity = 0.75;
  scoreColors = {
    red: `rgb(255, 0, 0, ${this.backgroundOpacity})`,
    yellow: `rgb(238, 238, 0, ${this.backgroundOpacity})`,
    orange: `rgb(255, 165, 0, ${this.backgroundOpacity})`,
    green: `rgb(0, 255, 0, ${this.backgroundOpacity})`,
  };

  kubeSecReportDownloadHref: string;

  constructor(
    private loaderService: NgxUiLoaderService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loaderService.start();
    this.populateTable();
    this.kubeSecReportDownloadHref = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.kubeSecReport));
  }

  populateTable() {
    this.displayName = 'KubeSec ' + this.kubeSecReport.object.substring(4);
    this.kubeSecReport.scoring.passed ? this.passed = this.kubeSecReport.scoring.passed : this.passed = [];
    this.kubeSecReport.scoring.advise ? this.advise = this.kubeSecReport.scoring.advise : this.advise = [];
    this.kubeSecReport.scoring.critical ? this.critical = this.kubeSecReport.scoring.critical : this.critical = [];
    this.passedDataSource = new MatTableDataSource(this.passed);
    this.adviseDataSource = new MatTableDataSource(this.advise);
    this.criticalDataSource = new MatTableDataSource(this.critical);
    this.loaderService.stop();
  }

  decideScoreColor(): string {
    const scoreNum = +this.kubeSecReport.score;
    if (scoreNum <= 0) {
      return this.scoreColors.red;
    } else if (0 < scoreNum && scoreNum <= 3) {
      return this.scoreColors.yellow;
    } else if (3 < scoreNum && scoreNum <= 6) {
      return this.scoreColors.orange;
    } else {
      return this.scoreColors.green;
    }
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
