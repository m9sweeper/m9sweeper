import {Component, Inject, Input, OnInit} from '@angular/core';
import {IKubesecReport} from '../../../../../../core/entities/IKubesecReport';
import {MatTableDataSource} from '@angular/material/table';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-kubesec-report',
  templateUrl: './kubesec-report.component.html',
  styleUrls: ['./kubesec-report.component.scss']
})
export class KubesecReportComponent implements OnInit {
  @Input() kubesecReport: IKubesecReport;
  displayName: string;

  passedDataSource: MatTableDataSource<any>;
  adviseDataSource: MatTableDataSource<any>;
  criticalDataSource: MatTableDataSource<any>;
  criticalDisplayedColumns: string[] = ['criticalId', 'criticalPoints', 'criticalReason'];
  adviseDisplayColumns: string[] = ['adviseReason'];
  passedDisplayColumns: string[] = ['passedId', 'passedPoints', 'passedReason'];

  passed: any[];
  advise: any[];
  critical: any[];

  passedTotal = 0;
  criticalTotal = 0;

  backgroundOpacity = 0.75;
  scoreColors = {
    red: `rgb(255, 0, 0, ${this.backgroundOpacity})`,
    yellow: `rgb(238, 238, 0, ${this.backgroundOpacity})`,
    orange: `rgb(255, 165, 0, ${this.backgroundOpacity})`,
    green: `rgb(0, 255, 0, ${this.backgroundOpacity})`,
  };

  kubesecReportDownloadHref: string;

  constructor(
    private loaderService: NgxUiLoaderService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loaderService.start();
    this.populateTable();
    this.kubesecReportDownloadHref = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.kubesecReport));
  }

  populateTable() {
    console.log(this.kubesecReport);
    this.displayName = 'Kubesec ' + this.kubesecReport.object.substring(4);

    this.passed = this.kubesecReport.scoring.passed ? this.kubesecReport.scoring.passed : [];
    this.advise = this.kubesecReport.scoring.advise ? this.kubesecReport.scoring.advise : [];
    this.critical = this.kubesecReport.scoring.critical ? this.kubesecReport.scoring.critical : [];

    this.passedTotal = 0;
    this.passed.forEach((item) => {
      this.passedTotal += item.points;
    });

    this.criticalTotal = 0;
    this.critical.forEach((item) => {
      this.criticalTotal += item.points;
    });

    this.passedDataSource = new MatTableDataSource(this.passed);
    this.adviseDataSource = new MatTableDataSource(this.advise);
    this.criticalDataSource = new MatTableDataSource(this.critical);
    this.loaderService.stop();
  }

  decideScoreColor(scoreNum): string | number {
    scoreNum = +scoreNum;  // cast to number just in case
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
  decideCriticalScoreColor(scoreNum): string | number {
    scoreNum = Math.abs(+scoreNum);  // cast to positive number just in case
    if (scoreNum <= 0) {
      return this.scoreColors.green;
    } else if (0 < scoreNum && scoreNum <= 3) {
      return this.scoreColors.orange;
    } else if (3 < scoreNum && scoreNum <= 6) {
      return this.scoreColors.yellow;
    } else {
      return this.scoreColors.red;
    }
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
