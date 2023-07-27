import {Component, OnInit} from '@angular/core';
import {FalcoService} from '../../../../../core/services/falco.service';
import {MatTableDataSource} from '@angular/material/table';
import {take} from 'rxjs/operators';
import {IFalcoLog} from '../../../../../core/entities/IFalcoLog';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

import {FormBuilder, FormGroup, } from '@angular/forms';

import {EnumService} from '../../../../../core/services/enum.service';
import {format} from 'date-fns';
import {CustomValidatorService} from '../../../../../core/services/custom-validator.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';

import {CsvService} from '../../../../../core/services/csv.service';

import {FalcoDialogComponent} from '../falco-dialog/falco-dialog.component';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';
import {UtilService} from '../../../../../core/services/util.service';
import {FalcoJsonDataDialogComponent} from '../falco-json-data-dialog/falco-json-data-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-falco-events-list',
  templateUrl: './falco-events-list.component.html',
  styleUrls: ['./falco-events-list.component.scss']
})
export class FalcoEventsListComponent implements OnInit {

  dataSource: MatTableDataSource<IFalcoLog>;
  displayedColumns = ['calendarDate', 'namespace', 'pod', 'image', 'priority', 'message'];
  clusterId: number;
  dialogRef: MatDialogRef<FalcoJsonDataDialogComponent>;

  filterForm: FormGroup;
  priorityLevels: string [] = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Informational', 'Debug'];
  orderByOptions: string [] = ['Priority Desc', 'Priority Asc', 'Date Desc', 'Date Asc'];

  logCount: number; // accumulated log total per forward/backward click
  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 20; // page size
  page: number; // number of pages
  startDate: string;
  endDate: string;
  signature: string;
  isAllowed: boolean;
  allowedRoles: string [] = ['ADMIN', 'SUPER_ADMIN'];

  constructor(
    private falcoService: FalcoService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private enumService: EnumService,
    private formBuilder: FormBuilder,
    private customValidatorService: CustomValidatorService,
    private loaderService: NgxUiLoaderService,
    private csvService: CsvService,
    private router: Router,
    private jwtAuthService: JwtAuthService,
    private snackBar: MatSnackBar,
    private utilService: UtilService,
  ) {}

  ngOnInit() {
    this.filterForm = this.formBuilder.group({
      selectedPriorityLevels: [[]],
      selectedOrderBy: [],
      startDate: [],
      endDate: [],
      namespaceInput: [],
      podInput: [],
      imageInput: [],
    });

    this.route.parent.parent.params
      .pipe(take(1))
      .subscribe(param => {
        this.clusterId = param.id;
        this.getEvents(); // load logs
      });
    this.getUserAuthority();

  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);

    this.getEvents(); // load logs when page event changes
  }

  getEvents() {
    if (this.filterForm.get('startDate').value) {
      this.startDate = format(new Date(this.filterForm.get('startDate').value), 'yyyy-MM-dd');
    }
    if (this.filterForm.get('endDate').value) {
      this.endDate = format(new Date(this.filterForm.get('endDate').value), 'yyyy-MM-dd');
    }

    this.falcoService.getFalcoLogs(
      this.clusterId, {
        limit: this.limit,
        page: this.page,
        selectedPriorityLevels: this.filterForm.get('selectedPriorityLevels').value,
        selectedOrderBy: this.filterForm.get('selectedOrderBy').value,
        startDate: this.startDate,
        endDate: this.endDate,
        namespace: this.filterForm.get('namespaceInput').value,
        pod: this.filterForm.get('podInput').value,
        image: this.filterForm.get('imageInput').value,
        signature: this.signature}
    )
      .pipe(take(1))
      .subscribe(response => {
        this.dataSource = new MatTableDataSource(response.data.list);
        this.logCount = response.data.logCount;
      }, (err) => {
        if (err?.error?.message) {
          this.snackBar.open(err.error.message, 'Close', { duration: 2000 });
        } else if (err?.error) {
          this.snackBar.open(err.error, 'Close', { duration: 2000 });
        } else if (err?.message) {
          this.snackBar.open(err.message, 'Close', { duration: 2000 });
        } else {
          this.snackBar.open(err, 'Close', { duration: 2000 });
        }
      });

  }
  getUserAuthority() {
    const currentUserRoles = this.jwtAuthService.currentUserAuthorities as string[];
    this.isAllowed = this.allowedRoles.filter(role => currentUserRoles.includes(role))?.length > 0;
  }

  displayEventDetails(event: IFalcoLog) {
    this.dialog.open(FalcoJsonDataDialogComponent, {
      width: 'auto',
      height: '100%',
      autoFocus: false,
      data: {content: event, header: 'Event Log Details'}
    });
  }

  downloadReport() {
    this.loaderService.start('csv-download');
    // should only download filtered logs
    this.falcoService.downloadFalcoExport( this.clusterId, {
                                          limit: this.limit,
                                          page: this.page,
                                          selectedPriorityLevels: this.filterForm.get('selectedPriorityLevels').value,
                                          selectedOrderBy: this.filterForm.get('selectedOrderBy').value,
                                          startDate: this.startDate,
                                          endDate: this.endDate,
                                          namespace: this.filterForm.get('namespaceInput').value,
                                          pod: this.filterForm.get('podInput').value,
                                          image: this.filterForm.get('imageInput').value,
                                          signature: this.signature}
      )
        .pipe(take(1))
        .subscribe((response) => {
          this.csvService.downloadCsvFile(response.data.csv, response.data.filename);
        }, (error) => {
          this.loaderService.stop('csv-download');
          this.snackBar.open(`Error downloading report: ${error.error.message}`, 'Close', { duration: 2000 });
        }, () => {
          this.loaderService.stop('csv-download');
        });
    }

  rebuildWithFilters(){
    if (!this.filtersValid) {
      this.snackBar.open('Invalid filter settings; please recheck filter values', 'Close', { duration: 2000 });
    }else {
        this.getEvents();
    }
  }

  get filtersValid(): boolean {
    return this.filterForm.valid;
  }

  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('falco_table_limit');
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('falco_table_limit', String(limit));
  }


  openDialog() {
    const dialog = this.dialog.open(
      FalcoDialogComponent,
      {
        maxWidth: '1000px',
        maxHeight: '80vh',
        // width: '100%',
        closeOnNavigation: true,
        disableClose: false,
        data: {
          clusterId: this.clusterId,
        }
      },
    );

    dialog.afterClosed()
      .pipe(take(1))
      .subscribe((data?: { dontRefresh?: boolean }) => {
        // If closed after navigating away, dontRefresh should be true.
        // If closing by clicking off the modal data will be undefined
        if (!data?.dontRefresh) {
          this.getEvents();
        }
      });
  }

  stripDomainName(image: string): string {
    if (!image) { return image; }

    // if we want to return the repository name with the domain stripped out, use this instead
    // return this.utilService.getImageNameWithRepository(image);

    return this.utilService.getImageName(image);
  }

  onClickSettings(){
    this.router.navigate(['/private', 'clusters', this.clusterId, 'falco', 'settings']);
  }
}
