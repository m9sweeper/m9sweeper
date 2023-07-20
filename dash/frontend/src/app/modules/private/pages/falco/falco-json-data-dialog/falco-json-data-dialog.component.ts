import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {FalcoService} from '../../../../../core/services/falco.service';
import { MatTableDataSource } from '@angular/material/table';
import {IFalcoLog} from '../../../../../core/entities/IFalcoLog';
import {take} from 'rxjs/operators';
import {AlertService} from '@full-fledged/alerts';
import {UtilService} from '../../../../../core/services/util.service';


@Component({
  selector: 'app-falco-json-data-dialog',
  templateUrl: './falco-json-data-dialog.component.html',
  styleUrls: ['./falco-json-data-dialog.component.scss']
})
export class FalcoJsonDataDialogComponent implements OnInit {
  header: string;

  constructor(
    public dialogRef: MatDialogRef<FalcoJsonDataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {content: any, header: string},
    private route: ActivatedRoute,
    private router: Router,
    private falcoService: FalcoService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private utilService: UtilService,
  ) {
    console.log('hello from the falco json data dialog component');
  }

  dataSource: MatTableDataSource<IFalcoLog>;
  displayedColumns = ['isCurrent', 'calendarDate', 'namespace', 'pod', 'image', 'message'];
  namespace = this.data.content.namespace;
  date = this.data.content.calendarDate;
  dateTime  = new Date(+(this.data.content.timestamp));
  pod = this.data.content.container;
  image = this.data.content.image;
  message = this.data.content.message;
  signature = this.data.content.anomalySignature;
  clusterId = this.data.content.clusterId;
  eventId = this.data.content.id;

  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 20;
  logCount: number;
  page: number;

  ngOnInit(): void {
    this.header = this.data.header ? this.data.header : 'Json Data';
    this.getFalcoEvents();
  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getFalcoEvents();
  }

  getFalcoEvents(){
    this.falcoService.getFalcoLogs(this.clusterId,  { limit: this.limit, page: this.page, signature: this.signature})
      .pipe(take(1))
      .subscribe(response => {
        const dataList = response.data.list;
        // one less log count - without the current event log
        // current problem: we pop out the one that matches the id of the current event log
        // but if we say "-1", we remove the trigger that indicates there's another page
        this.logCount = response.data.logCount;

        // create a new data list without the current event log
        // const newDataList = dataList.filter(i => i.id !== this.data.content.id);
        const newDataList = [];
        dataList.forEach((eventLog) => {
          const modifiedEvent = structuredClone(eventLog);
          modifiedEvent.isCurrent = eventLog.id === this.data.content.id;
          newDataList.push(modifiedEvent);
        });
        // use the new data list to display related events
        this.dataSource = new MatTableDataSource(newDataList);
      }, (err) => {
        if (err?.error?.message) {
          this.alertService.danger(err.error.message);
        } else if (err?.error) {
          this.alertService.danger(err.error);
        } else {
          this.alertService.danger(err);
        }
      });
  }

  stripDomainName(image: string): string {
    return this.utilService.getImageName(image);
  }

  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('falco_table_limit');
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('falco_table_limit', String(limit));
  }

  onClickMore(){
    this.dialogRef.close();
  }

  onClose() {
    this.dialogRef.close();
  }
  displayEventDetails(event: IFalcoLog){
    this.dialogRef.close();
    this.dialogRef = this.dialog.open(FalcoJsonDataDialogComponent, {
      width: 'auto',
      height: '100%',
      autoFocus: false,
      data: {content: event, header: 'Event Log Details'}
    });
  }

}
