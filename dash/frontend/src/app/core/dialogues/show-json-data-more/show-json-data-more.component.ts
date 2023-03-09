import {Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FalcoService} from '../../services/falco.service';
import { MatTableDataSource } from '@angular/material/table';
import {IFalcoLog} from '../../entities/IFalcoLog';
import {take} from 'rxjs/operators';
import {AlertService} from '@full-fledged/alerts';
import {IFalcoCount} from '../../entities/IFalcoCount';
import {ShareEventComponent} from './share-event.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-show-json-data-more',
  templateUrl: './show-json-data-more.component.html',
  styleUrls: ['./show-json-data-more.component.scss']
})
export class ShowJsonDataMoreComponent implements OnInit {
  header: string;

  constructor(
              private route: ActivatedRoute,
              private falcoService: FalcoService,
              private alertService: AlertService,
              private dialog: MatDialog,
  ) { }

  dataSource: MatTableDataSource<IFalcoLog>;
  displayedColumns = ['calendarDate', 'namespace', 'pod', 'image', 'message'];

  signature: string;
  clusterId: number;
  eventId: number;

  namespace: string;
  date: string;
  pod: string;
  image: string;
  message: string;
  raw: object;
  format = 'table';
  rawInFormat: string;
  extractProperty: {key: string, value: string}[] = [];

  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 20;
  logCount: number;
  page: number;

  falcoCountData: IFalcoCount[];
  newDataList: IFalcoLog[] = [];
  eventData: IFalcoLog;


  barChartAttributes = {
    view: [] = [550, 300],
    colorScheme: {
      domain: ['#f3865f']
    },
    results: [],
    gradient: false,
    showXAxis: true,
    showYAxis: true,
    barPadding: 10,
    showLegend: false,
    legendPosition: 'below',
    showXAxisLabel: true,
    showYAxisLabel: true,
    yAxisLabel: 'Number of Occurrence',
    xAxisLabel: 'Day of Month',
  };

  ngOnInit(): void {

    this.clusterId = this.route.parent.parent.snapshot.params.id;
    this.eventId = this.route.snapshot.params.eventId;
    this.signature = this.route.snapshot.params.signature;

    this.getEventById();
    this.getRelatedEvents();

    this.buildBarChartData();
  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getEventById();
    this.getRelatedEvents();
    this.buildBarChartData();

  }

  getEventById(){
      this.falcoService.getFalcoLogByEventId( this.eventId )
      .pipe(take(1))
      .subscribe(response => {
        this.namespace = response.data.namespace;
        this.date = response.data.calendarDate;
        this.pod = response.data.container;
        this.image = response.data.image;
        this.message = response.data.message;
        this.raw = response.data.raw;
        this.extractProperty = this.extractProperties(this.raw);
        this.eventData = response.data;
      }, (err) => {
        alert(err);
      });
  }

  getRelatedEvents(){
    this.falcoService.getFalcoLogs(this.clusterId,  { limit: this.limit, page: this.page, signature: this.signature})
      .pipe(take(1))
      .subscribe(response => {
        const dataList = response.data.list;
        this.logCount = response.data.logCount;

        // create a new data list without the current event log
        for (let count = 0; count < this.logCount; count++) {
          if (dataList[count] !== undefined) {
            if (dataList[count].id !== this.eventData.id) {
              this.newDataList.push(dataList[count]);
            }
          }
        }
        // one less log count - without the current event log
        this.logCount = this.logCount - 1;
        this.dataSource = new MatTableDataSource(this.newDataList);
        this.newDataList = [];
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

  buildBarChartData() {
      this.falcoService.getCountOfFalcoLogsBySignature(this.clusterId, this.signature)
      .pipe(take(1))
      .subscribe(response => {

          this.falcoCountData = response.data;
          if (this.falcoCountData && this.falcoCountData.length > 0) {
            this.barChartAttributes.results =  this.falcoCountData.map(elem => {
              return {
                name: (elem.date.toString().split('T')[0]).split('-')[2],
                value: Number(elem.count)
              };
            });
          } else{
            return false;
          }

        },
        error => {
          this.alertService.danger(error.error.message);
        });
  }

  onClickShare(){
      this.dialog.open(ShareEventComponent, {
      width: '100%'
    });
  }

  onClickYaml(){
    this.format = 'yaml';
    const jsYaml = require('js-yaml');
    this.rawInFormat = jsYaml.dump(this.raw, {
      indent: 4,
      lineWidth: -1,
      skipInvalid: true
    });
  }

  extractProperties(obj): {key: string; value: string }[]{
    const arr = [];
    for (const ele of Object.keys(obj)){
      arr.push({
        key: ele,
        value: obj[ele]
      });
    }
    return arr;
  }

  onClickJson(){
    this.format = 'json';
    this.rawInFormat = JSON.stringify(this.raw, undefined, 4);
  }


  onClickTable(){
    this.format = 'table';
  }

  displayEventDetails(event: IFalcoLog) {
    this.eventId = event.id;
    this.getEventById();
    this.getRelatedEvents();
  }
}
