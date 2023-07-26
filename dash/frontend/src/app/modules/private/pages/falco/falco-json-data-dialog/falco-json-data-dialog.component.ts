import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {FalcoService} from '../../../../../core/services/falco.service';
import { MatTableDataSource } from '@angular/material/table';
import {IFalcoLog} from '../../../../../core/entities/IFalcoLog';
import {take} from 'rxjs/operators';
import {AlertService} from '@full-fledged/alerts';
import {UtilService} from '../../../../../core/services/util.service';
import {MatTab} from '@angular/material/tabs';


@Component({
  selector: 'app-falco-json-data-dialog',
  templateUrl: './falco-json-data-dialog.component.html',
  styleUrls: ['./falco-json-data-dialog.component.scss']
})
export class FalcoJsonDataDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<FalcoJsonDataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      namespace: string,
      timestamp: string,
      container: string,
      image: string,
      message: string,
      anomalySignature: string,
      clusterId: number,
      id: number,
      raw: any,
    },
    private route: ActivatedRoute,
    private router: Router,
    private falcoService: FalcoService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private utilService: UtilService,
  ) {}

  dataSource: MatTableDataSource<IFalcoLog>;
  displayedColumns = ['is-current', 'calendar-date', 'namespace', 'pod', 'image', 'message'];

  eventDetails = new MatTableDataSource( [
    {
      title: 'Namespace',
      value: this.data.namespace,
    },
    {
      title: 'Date',
      value: new Date(+(this.data.timestamp)),
    },
    {
      title: 'Pod',
      value: this.data.container,
    },
    {
      title: 'Image',
      value: this.data.image,
    },
    {
      title: 'Priority',
      value: this.data.raw.priority,
    },
    {
      title: 'Message',
      value: this.data.message,
    },
    {
      title: 'Signature',
      value: this.data.anomalySignature,
    },
  ]);

  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 10;
  logCount: number;
  page: number;

  ngOnInit(): void {
    console.log(this.data);
    this.getRelatedEvents();
  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getRelatedEvents();
  }

  getRelatedEvents(){
    this.falcoService.getFalcoLogs(this.data.clusterId,  { limit: this.limit, page: this.page, signature: this.data.anomalySignature})
      .pipe(take(1))
      .subscribe(response => {
        console.log(response);
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
          modifiedEvent.isCurrent = eventLog.id === this.data.id;
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
      data: {content: event}
    });
  }

}
