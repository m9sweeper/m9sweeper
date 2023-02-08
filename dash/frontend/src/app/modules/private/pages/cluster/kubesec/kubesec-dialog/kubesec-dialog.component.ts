import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-kubesec-dialog',
  templateUrl: './kubesec-dialog.component.html',
  styleUrls: ['./kubesec-dialog.component.scss']
})
export class KubesecDialogComponent implements OnInit {
  displayName: string;

  message: string;
  score: string;
  isCompleted = true;
  passed: [];
  advise: [];
  critical: [];
  criticalDisplayedColumns: string[] = ['criticalId', 'criticalPoints', 'criticalReason'];
  adviseDisplayColumns: string[] = ['adviseId', 'advisePoints', 'adviseReason'];
  passedDisplayColumns: string[] = ['passedId', 'passedPoints', 'passedReason'];
  passedDataSource: MatTableDataSource<any>;
  adviseDataSource: MatTableDataSource<any>;
  criticalDataSource: MatTableDataSource<any>;
  scoreColors = ['#ff0000', '#eeee00', '#ffa500', '#00ff00'];

  kubesecReportDownloadHref: string;

  constructor(@Inject(MAT_DIALOG_DATA) public kubesecReport,
              private loaderService: NgxUiLoaderService,
              private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.loaderService.start();
    this.populateTable();
    this.kubesecReportDownloadHref = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.kubesecReport));
  }

  populateTable() {
    this.displayName = 'KubeSec ' + this.kubesecReport.object.substring(4);
    this.message = this.kubesecReport.message;
    this.score = this.kubesecReport.score;
    this.kubesecReport.scoring.passed ? this.passed = this.kubesecReport.scoring.passed : this.passed = [];
    this.kubesecReport.scoring.advise ? this.advise = this.kubesecReport.scoring.advise : this.advise = [];
    this.kubesecReport.scoring.critical ? this.critical = this.kubesecReport.scoring.critical : this.critical = [];
    this.passedDataSource = new MatTableDataSource(this.passed);
    this.adviseDataSource = new MatTableDataSource(this.advise);
    this.criticalDataSource = new MatTableDataSource(this.critical);
    this.loaderService.stop();
  }

  decideScoreColor(score: string): string {
    const scoreNum = +score;
    if (scoreNum <= 0) {
      return this.scoreColors[0];
    } else if (0 < scoreNum && scoreNum <= 3) {
      return this.scoreColors[1];
    } else if (3 < scoreNum && scoreNum <= 6) {
      return this.scoreColors[2];
    } else {
      return this.scoreColors[3];
    }
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

}
