import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {FalcoService} from '../../services/falco.service';
import { MatTableDataSource } from '@angular/material/table';
import {IFalcoLog} from '../../entities/IFalcoLog';
import {take} from 'rxjs/operators';
import {ShowJsonDataMoreComponent} from '../show-json-data-more/show-json-data-more.component';

@Component({
  selector: 'app-show-json-data',
  templateUrl: './show-json-data.component.html',
  styleUrls: ['./show-json-data.component.scss']
})
export class ShowJsonDataComponent implements OnInit {
  header: string;

  constructor(public dialogRef: MatDialogRef<ShowJsonDataComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {content: any, header: string},
              private route: ActivatedRoute,
              private router: Router,
              private falcoService: FalcoService,
              private dialog: MatDialog,
  ) { }

  dataSource: MatTableDataSource<IFalcoLog>;
  displayedColumns = ['calendarDate', 'namespace', 'pod', 'image', 'message'];
  namespace = this.data.content.namespace;
  date = this.data.content.calendarDate;
  pod = this.data.content.container;
  image = this.data.content.image;
  message = this.data.content.message;
  signature = this.data.content.anomalySignature;
  clusterId = this.data.content.clusterId;
  eventId = this.data.content.id;

  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 20;
  logCount: number;
  page: number;
  newDataList: IFalcoLog[] = [];

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
        this.logCount = response.data.logCount;

        // create a new data list without the current event log
        for (let count = 0; count < this.logCount; count++){
          if ( dataList[count] !== undefined) {
              if (dataList[count].id !== this.data.content.id) {
                this.newDataList.push(dataList[count]);
              }
          }
        }

        // one less log count - without the current event log
        this.logCount = this.logCount - 1;
        this.dataSource = new MatTableDataSource(this.newDataList);

      }, (err) => {
        alert(err);
      });
  }

  stripDomainName(image: string): string {
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

  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('falco_table_limit');
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('falco_table_limit', String(limit));
  }

  onClickMore(){
    this.dialogRef.close();
    this.router.navigate(['/private', 'clusters', this.clusterId, 'falco', 'more', this.eventId, 'signature', this.signature]);
  }

  onClose() {
    this.dialogRef.close();
  }
  displayEventDetails(event: IFalcoLog){
    this.dialogRef.close();
    this.dialogRef = this.dialog.open(ShowJsonDataComponent, {
      width: 'auto',
      height: '100%',
      autoFocus: false,
      data: {content: event, header: 'Event Log Details'}
    });
  }

}
