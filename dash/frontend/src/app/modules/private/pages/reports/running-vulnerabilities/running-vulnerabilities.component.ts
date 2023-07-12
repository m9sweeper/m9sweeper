import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ReportsService} from '../../../../../core/services/reports.service';
import {ActivatedRoute} from '@angular/router';
import {take} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NamespaceService} from '../../../../../core/services/namespace.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {CsvService} from '../../../../../core/services/csv.service';
import {AlertService} from '@full-fledged/alerts';
import {IRunningVulnerabilities} from '../../../../../core/entities/IRunningVulnerabilitiesPreview';
import {format} from 'date-fns';
import {MatPaginator} from '@angular/material/paginator';


@Component({
  selector: 'app-running-vulnerabilities',
  templateUrl: './running-vulnerabilities.component.html',
  styleUrls: ['./running-vulnerabilities.component.scss']
})
export class RunningVulnerabilitiesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  clusterId: number;
  vulnerabilityCount: number;
  limit: number;
  page = 0;  // which page we're on
  lowNumCurrentShownVulnerabilities: number;
  highNumCurrentShownVulnerabilities: number;
  vulnerabilities: Array<IRunningVulnerabilities>;
  dataSource: MatTableDataSource<IRunningVulnerabilities>;
  displayedColumns: string[] = ['image', 'namespaces', 'scanResults', 'lastScanned', 'totalCritical', 'totalMajor',
    'totalMedium', 'totalLow', 'totalNegligible', 'totalFixableCritical', 'totalFixableMajor', 'totalFixableMedium',
    'totalFixableLow', 'totalFixableNegligible'];
  filterForm: FormGroup;
  clusterNamespaces: Array<string>;
  previousRequest: {namespaces, isCompliant};

  constructor(
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private namespaceService: NamespaceService,
    private loaderService: NgxUiLoaderService,
    private csvService: CsvService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.limit = 20;
    this.filterForm = this.formBuilder.group({
      limit: [this.limit, [Validators.required, Validators.min(1)]],
      namespaces: [[]],
      date: [],
      isCompliant: []
    });
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
  }
  ngAfterViewInit() {
    this.paginator.pageSize = this.limit;
  }

  pageEvent(pageEvent: any) {
    this.page = pageEvent.pageIndex;

    this.buildReport(
      pageEvent.pageSize,
      this.clusterId,
      this.filterForm.get('namespaces').value,
      this.filterForm.get('isCompliant').value
    ); // reload when page event changes
  }

  buildReport(limit: number, clusterId: number, namespaces?: string[], isCompliant?: boolean) {
    this.loaderService.start();
    let date;
    if (this.filterForm.get('date').value) {
      date = format(new Date(this.filterForm.get('date').value), 'yyyy-MM-dd');
    }
    this.reportsService.getRunningVulnerabilities(limit, clusterId, namespaces, date, isCompliant, this.page)
      .pipe(take(1))
      .subscribe(response => {
        this.vulnerabilityCount = response.data.count;
        this.vulnerabilities = response.data.results;
        this.dataSource = new MatTableDataSource(response.data.results);
        this.limit = limit;
        this.paginator.pageSize = limit;
        this.filterForm.get('limit').setValue(limit);
        console.log({limit: this.limit, page: this.page, response});
        this.lowNumCurrentShownVulnerabilities = (this.limit * this.page) + 1;
        this.highNumCurrentShownVulnerabilities = (this.limit * this.page) + response.data.results.length;
        if (this.vulnerabilityCount < this.limit) {
          this.limit = this.vulnerabilityCount;
        }
        this.loaderService.stop();
      }, (err) => {
        if (err?.error && err.error?.message) {
          this.alertService.warning(err.error.message);
        } else if (err?.error) {
          this.alertService.warning(err.error);
        } else {
          this.alertService.warning(err);
        }
        this.loaderService.stop();
      });
  }

  rebuildWithFilters() {
    if (!this.filtersValid) {
      this.alertService.warning('Invalid filter settings; please recheck filter values');
    }
    else {
      this.paginator.pageIndex = 0;
      this.page = 0;
      this.previousRequest = {
        namespaces: this.filterForm.get('namespaces').value,
        isCompliant: this.filterForm.get('isCompliant').value
      };
      const newLimit = this.filterForm.get('limit').value;
      this.buildReport(
        newLimit,
        this.clusterId,
        this.filterForm.get('namespaces').value,
        this.filterForm.get('isCompliant').value
      );
    }
  }

  get filtersValid(): boolean {
    return true;
    // return this.filterForm.valid;
  }

  downloadReport() {
    this.loaderService.start('csv-download');
    let date;
    if (this.filterForm.get('date').value) {
      date = format(new Date(this.filterForm.get('date').value), 'yyyy-MM-dd');
    }
    this.reportsService.downloadRunningVulnerabilities(this.clusterId, this.previousRequest?.namespaces,
        date, this.previousRequest?.isCompliant)
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
