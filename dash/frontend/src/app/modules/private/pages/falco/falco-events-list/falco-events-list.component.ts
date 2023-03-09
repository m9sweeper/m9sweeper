import {Component, OnInit} from '@angular/core';
import {FalcoService} from '../../../../../core/services/falco.service';
import {MatTableDataSource} from '@angular/material/table';
import {take} from 'rxjs/operators';
import {IFalcoLog} from '../../../../../core/entities/IFalcoLog';
import {ActivatedRoute, Router} from '@angular/router';
import {ShowJsonDataComponent} from '../../../../../core/dialogues/show-json-data/show-json-data.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {EnumService} from '../../../../../core/services/enum.service';
import {format, startOfToday, sub} from 'date-fns';
import {CustomValidatorService} from '../../../../../core/services/custom-validator.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';

import {CsvService} from '../../../../../core/services/csv.service';

import {FalcoDialogComponent} from '../falco-dialog/falco-dialog.component';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';




@Component({
  selector: 'app-falco-events-list',
  templateUrl: './falco-events-list.component.html',
  styleUrls: ['./falco-events-list.component.scss']
})
export class FalcoEventsListComponent implements OnInit {

  dataSource: MatTableDataSource<IFalcoLog>;
  displayedColumns = ['calendarDate', 'namespace', 'pod', 'image', 'priority', 'message'];
  clusterId: number;
  dialogRef: MatDialogRef<ShowJsonDataComponent>;

  filterForm: FormGroup;
  priorityLevels: string [] = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Informational', 'Debug'];
  orderByOptions: string [] = ['Priority Desc', 'Priority Asc', 'Date Desc', 'Date Asc'];

  logCount: number;
  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 20;
  page: number;
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
        this.getEvents();
      });
    this.getUserAuthority();

  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getEvents();
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
          alert(err);
      });

  }
  getUserAuthority() {
    const currentUserRoles = this.jwtAuthService.currentUserAuthorities as string[];
    this.isAllowed = this.allowedRoles.filter(role => currentUserRoles.includes(role))?.length > 0;
    console.log('user role', currentUserRoles);
    console.log('is allow', this.isAllowed);
  }

  displayEventDetails(event: IFalcoLog) {
    this.dialog.open(ShowJsonDataComponent, {
      width: 'auto',
      height: '100%',
      autoFocus: false,
      data: {content: event, header: 'Event Log Details'}
    });
  }


  downloadReport() {
    this.loaderService.start('csv-download');

    this.falcoService.downloadFalcoExport(this.clusterId)
        .pipe(take(1))
        .subscribe((response) => {
          this.csvService.downloadCsvFile(response.data.csv, response.data.filename);
        }, (error) => {
          this.loaderService.stop('csv-download');
          alert(`Error downloading report: ${error?.error?.message}`);
        }, () => {
          this.loaderService.stop('csv-download');
        });
    }

  rebuildWithFilters(){
    if (!this.filtersValid) {
      alert('Invalid filter settings; please recheck filter values');
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
    const dialog = this.dialog.open(FalcoDialogComponent, {
      maxWidth: '800px',
      maxHeight: '80vh',
      closeOnNavigation: true,
      disableClose: false,
      data: {
        clusterId: this.clusterId,
      }
    });

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

    const regex = /^([a-zA-Z0-9]+\.[a-zA-Z0-9\.]+)?\/?([a-zA-Z0-9\/]+)?\:?([a-zA-Z0-9\.]+)?$/g;
    const group = image.split(regex);
    // strip domain, only image
    if (group[2] !== undefined && group[3] === undefined){
      return (group[2]);
    } else if (group[3] !== undefined){
      return (group[2] + group [3]);
    } else if (group[2] === undefined){
      return '';
    }
  }

  onClickSettings(){
    this.router.navigate(['/private', 'clusters', this.clusterId, 'falco', 'settings']);
  }
}
