import { Component, OnInit } from '@angular/core';
import {IHistoricalVulnerabilities} from '../../../../../core/entities/IRunningVulnerabilitiesPreview';
import {MatTableDataSource} from '@angular/material/table';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ReportsService} from '../../../../../core/services/reports.service';
import {ActivatedRoute} from '@angular/router';
import {NamespaceService} from '../../../../../core/services/namespace.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {CsvService} from '../../../../../core/services/csv.service';
import {take} from 'rxjs/operators';
import {format} from 'date-fns';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-historical-vulnerabilities',
  templateUrl: './historical-vulnerabilities.component.html',
  styleUrls: ['./historical-vulnerabilities.component.scss']
})
export class HistoricalVulnerabilitiesComponent implements OnInit {
  clusterId: number;
  vulnerabilityCount: number;
  limit: number;
  vulnerabilities: Array<IHistoricalVulnerabilities>;
  dataSource: MatTableDataSource<IHistoricalVulnerabilities>;
  displayedColumns: string[] = ['savedDate', 'totalCritical', 'totalMajor',
    'totalMedium', 'totalLow', 'totalNegligible', 'totalFixableCritical', 'totalFixableMajor', 'totalFixableMedium',
    'totalFixableLow', 'totalFixableNegligible'];
  filterForm: FormGroup;
  clusterNamespaces: Array<string>;
  previousRequest: {namespaces};

  constructor(
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private namespaceService: NamespaceService,
    private loaderService: NgxUiLoaderService,
    private csvService: CsvService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.limit = 20;
    this.route.parent.parent.params
      .pipe(take(1))
      .subscribe(param => this.clusterId = param.id);
    this.buildReport(this.limit, this.clusterId);

    this.namespaceService.getAllK8sNamespaces(this.clusterId)
      .pipe(take(1))
      .subscribe((response) => {
        this.clusterNamespaces = new Array<string>();
        for (const namespace of response.data) {
          this.clusterNamespaces.push(namespace.name);
        }
        this.clusterNamespaces.sort();
      });

    this.filterForm = this.formBuilder.group({
      limit: [this.limit, [Validators.required, Validators.min(1)]],
      namespaces: [[]],
      start: [],
      end: []
    });
  }

  buildReport(limit: number, clusterId: number, namespaces?: string[], startDate?: string, endDate?: string) {
    this.loaderService.start();
    this.reportsService.getHistoricalVulnerabilities(limit, clusterId, namespaces, startDate, endDate)
      .pipe(take(1))
      .subscribe(response => {
        this.vulnerabilityCount = response.data.count;
        this.vulnerabilities = response.data.results;
        this.dataSource = new MatTableDataSource(response.data.results);
        if (this.vulnerabilityCount < this.limit) {
          this.limit = this.vulnerabilityCount;
        }
        this.loaderService.stop();
      }, (err) => {
        this.snackBar.open((err), 'Close', { duration: 2000 });
        this.loaderService.stop();
      });
  }

  rebuildWithFilters() {
    if (!this.filtersValid) {
      this.snackBar.open('Invalid filter settings; please recheck filter values', 'Close', { duration: 2000 });
    }
    else {
      this.limit = this.filterForm.get('limit').value;
      this.previousRequest = {
        namespaces: this.filterForm.get('namespaces').value,
      };
      let startDate;
      let endDate;
      if (this.filterForm.get('start').value) {
        startDate = format(new Date(this.filterForm.get('start').value), 'yyyy-MM-dd');
      }
      if (this.filterForm.get('end').value) {
        endDate = format(new Date(this.filterForm.get('end').value), 'yyyy-MM-dd');
      }
      this.buildReport(
        this.limit,
        this.clusterId,
        this.filterForm.get('namespaces').value,
        startDate,
        endDate
      );
    }
  }

  get filtersValid(): boolean {
    return this.filterForm.valid;
  }

  downloadReport() {
    this.loaderService.start('csv-download');
    let startDate;
    let endDate;
    if (this.filterForm.get('start').value) {
      startDate = format(new Date(this.filterForm.get('start').value), 'yyyy-MM-dd');
    }
    if (this.filterForm.get('end').value) {
      endDate = format(new Date(this.filterForm.get('end').value), 'yyyy-MM-dd');
    }
    this.reportsService.downloadHistoricalVulnerabilities(this.filterForm.get('limit').value,
      this.clusterId, this.previousRequest?.namespaces, startDate, endDate)
      .pipe(take(1))
      .subscribe((response) => {
        this.csvService.downloadCsvFile(response.data.csv, response.data.filename);
      }, (error) => {
        this.loaderService.stop();
        this.snackBar.open(`Error downloading report: ${error?.error?.message}`, 'Close', { duration: 2000 });
      }, () => {
        this.loaderService.stop('csv-download');
      });
  }

}
