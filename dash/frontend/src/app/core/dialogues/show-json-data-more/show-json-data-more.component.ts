import {Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FalcoService} from '../../services/falco.service';
import { MatTableDataSource } from '@angular/material/table';
import {IFalcoLog} from '../../entities/IFalcoLog';
import {take} from 'rxjs/operators';

// display: basic details, Incidence Rate, Related Events with pagination
// Add functions: Share,Raw Data ( yaml, Json, Table)

@Component({
  selector: 'app-show-json-data-more',
  templateUrl: './show-json-data-more.component.html',
  styleUrls: ['./show-json-data-more.component.scss']
})
export class ShowJsonDataMoreComponent implements OnInit {
  header: string;

  constructor(
              private route: ActivatedRoute,
              private falcoService: FalcoService
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

  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 20;
  logCount: number;
  page: number;

  ngOnInit(): void {

    this.clusterId = this.route.parent.parent.snapshot.params.id;
    this.eventId = this.route.snapshot.params.eventId;
    this.signature = this.route.snapshot.params.signature;

    this.getEventById();
    this.getRelatedEvents();
  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getEventById();
    this.getRelatedEvents();

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

      }, (err) => {
        alert(err);
      });
  }

  getRelatedEvents(){
    this.falcoService.getFalcoLogs(this.clusterId,  { limit: this.limit, page: this.page, signature: this.signature})
      .pipe(take(1))
      .subscribe(response => {
        this.dataSource = new MatTableDataSource(response.data.list);
        this.logCount = response.data.logCount;
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

  onClickShare(){

  }

  onClickYaml(){

  }
  onClickJson(){

  }
  onClickTable(){

  }
}
