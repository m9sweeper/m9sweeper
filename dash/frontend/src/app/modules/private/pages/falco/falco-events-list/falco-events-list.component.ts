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
import {AlertService} from '@full-fledged/alerts';
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
    if (this.filterForm.get('startDate').value) {
      this.falcoLogFilters.startDate = format(new Date(this.filterForm.get('startDate').value), 'yyyy-MM-dd');
    }
    if (this.filterForm.get('endDate').value) {
      this.falcoLogFilters.endDate = format(new Date(this.filterForm.get('endDate').value), 'yyyy-MM-dd');
    }
    this.falcoLogFilters.selectedPriorityLevels = this.filterForm.get('selectedPriorityLevels').value;
    this.falcoLogFilters.selectedOrderBy = this.filterForm.get('selectedOrderBy').value;
    this.falcoLogFilters.namespace = this.filterForm.get('namespaceInput').value;
    this.falcoLogFilters.pod = this.filterForm.get('podInput').value;
    this.falcoLogFilters.image = this.filterForm.get('imageInput').value;

    // https://stackoverflow.com/questions/34796901/angular2-change-detection-ngonchanges-not-firing-for-nested-object
    // ngOnChanges uses dirty checking (aka it compares the object reference and not the values)
    // --> need the object to be different so it triggers the onChange event
    this.falcoLogFilters = structuredClone(this.falcoLogFilters);
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

  truncateString(rawString) {
    if (!rawString) {
      return rawString;
    }
    if (rawString.length <= 17) {
      return rawString;
    }
    return `${rawString.substring(0, 17)}...`;
  }

  stripDomainName(image: string): string {
    if (!image) { return image; }
    return this.utilService.getImageName(image);
    // if we want to return the repository name with the domain stripped out, use this instead:
    // return this.utilService.getImageNameWithRepository(image);
  }
}
