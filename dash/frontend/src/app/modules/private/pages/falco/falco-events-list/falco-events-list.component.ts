import {Component, OnInit} from '@angular/core';
import {FalcoLogOptions, FalcoService} from '../../../../../core/services/falco.service';
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
import {AlertService} from 'src/app/core/services/alert.service';
import {UtilService} from '../../../../../core/services/util.service';
import {FalcoJsonDataDialogComponent} from '../falco-json-data-dialog/falco-json-data-dialog.component';


@Component({
  selector: 'app-falco-events-list',
  templateUrl: './falco-events-list.component.html',
  styleUrls: ['./falco-events-list.component.scss']
})
export class FalcoEventsListComponent implements OnInit {
  displayedColumns = ['calendarDate', 'namespace', 'pod', 'image', 'priority', 'message'];
  clusterId: number;
  dialogRef: MatDialogRef<FalcoJsonDataDialogComponent>;

  filterForm: FormGroup;
  priorityLevels: string [] = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Informational', 'Debug'];
  orderByOptions: string [] = ['Priority Desc', 'Priority Asc', 'Date Desc', 'Date Asc'];

  isAllowed: boolean;
  allowedRoles: string [] = ['ADMIN', 'SUPER_ADMIN'];

  falcoLogFilters: Partial<FalcoLogOptions> = {};
  falcoEventLogsColumns = ['calendar-date', 'namespace', 'pod', 'image', 'message'];
  falcoEventLogsStylingOptions = {
    tableBorder: false,
  };

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
    private alertService: AlertService,
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

  getEvents() {
    const updatedFilters: Partial<FalcoLogOptions> = {};
    if (this.filterForm.get('startDate').value) {
      updatedFilters.startDate = format(new Date(this.filterForm.get('startDate').value), 'yyyy-MM-dd');
    }
    if (this.filterForm.get('endDate').value) {
      updatedFilters.endDate = format(new Date(this.filterForm.get('endDate').value), 'yyyy-MM-dd');
    }
    updatedFilters.selectedPriorityLevels = this.filterForm.get('selectedPriorityLevels').value;
    updatedFilters.selectedOrderBy = this.filterForm.get('selectedOrderBy').value;
    updatedFilters.namespace = this.filterForm.get('namespaceInput').value;
    updatedFilters.pod = this.filterForm.get('podInput').value;
    updatedFilters.image = this.filterForm.get('imageInput').value;

    this.falcoLogFilters = updatedFilters;
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
      data: event,
    });
  }

  downloadReport() {
    this.loaderService.start('csv-download');
    // should only download filtered logs
    this.falcoService.downloadFalcoExport(this.clusterId, this.falcoLogFilters)
      .pipe(take(1))
      .subscribe(
        (response) => {
          this.csvService.downloadCsvFile(response.data.csv, response.data.filename);
        }, (error) => {
          this.loaderService.stop('csv-download');
          this.alertService.danger(`Error downloading report: ${error.error.message}`);
        }, () => {
          this.loaderService.stop('csv-download');
        }
      );
    }

  rebuildWithFilters(){
    if (!this.filtersValid) {
      this.alertService.danger('Invalid filter settings; please recheck filter values');
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
}
