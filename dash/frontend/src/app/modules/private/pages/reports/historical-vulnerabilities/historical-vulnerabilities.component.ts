import { Component, OnInit } from '@angular/core';
import {IHistoricalVulnerabilities} from '../../../../../core/entities/IRunningVulnerabilitiesPreview';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ReportsService} from '../../../../../core/services/reports.service';
import {ActivatedRoute} from '@angular/router';
import {NamespaceService} from '../../../../../core/services/namespace.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {CsvService} from '../../../../../core/services/csv.service';
import {AlertService} from '@full-fledged/alerts';
import {take} from 'rxjs/operators';
import {format} from 'date-fns';

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
  filterForm: UntypedFormGroup;
  clusterNamespaces: Array<string>;
  previousRequest: {namespaces};

  constructor(
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private namespaceService: NamespaceService,
    private loaderService: NgxUiLoaderService,
    private csvService: CsvService,
    private alertService: AlertService
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
        this.alertService.warning((err));
        this.loaderService.stop();
      });
  }

  rebuildWithFilters() {
    if (!this.filtersValid) {
      this.alertService.warning('Invalid filter settings; please recheck filter values');
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
        this.loaderService.stop('csv-download');
        this.alertService.danger(`Error downloading report: ${error?.error?.message}`);
      }, () => {
        this.loaderService.stop('csv-download');
      });
  }

}
