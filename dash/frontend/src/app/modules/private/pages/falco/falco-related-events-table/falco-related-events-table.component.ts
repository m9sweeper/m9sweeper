import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {take} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {FalcoLogOptions, FalcoService} from '../../../../../core/services/falco.service';
import {IFalcoLog} from '../../../../../core/entities/IFalcoLog';
import {AlertService} from 'src/app/core/services/alert.service';
import {UtilService} from '../../../../../core/services/util.service';

@Component({
  selector: 'app-falco-related-events-table',
  templateUrl: './falco-related-events-table.component.html',
  styleUrls: ['./falco-related-events-table.component.scss']
})
export class FalcoRelatedEventsTableComponent implements OnInit, OnChanges {
  @Input() clusterId: number;
  @Input() currentEventLogId: number | null;
  @Input() filters: Partial<FalcoLogOptions>;
  @Input() displayedColumns = ['is-current', 'calendar-date', 'namespace', 'pod', 'image', 'message'];
  @Input() stylingOptions = {
    tableBorder: true,
  };
  @Output() recentEventClicked = new EventEmitter<IFalcoLog>();

  relatedEventsTableData: MatTableDataSource<IFalcoLog>;

  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 10;
  logCount: number;
  page: number;

  constructor(
    private alertService: AlertService,
    private falcoService: FalcoService,
    private utilService: UtilService,
  ) {}

  ngOnInit() {
    this.getRelatedEvents();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getRelatedEvents();
  }

  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('falco_table_limit');
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('falco_table_limit', String(limit));
  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getRelatedEvents();
  }

  getRelatedEvents() {
    if (!this.clusterId) {
      this.alertService.warning('cluster ID is not currently set - could not retrieve event logs');
    }
    const falcoLogFilterOptions = this.buildFalcoLogFilters();
    this.falcoService.getFalcoLogs(this.clusterId,  falcoLogFilterOptions)
      .pipe(take(1))
      .subscribe(response => {
        const dataList = response.data.list;
        // one less log count - without the current event log
        // current problem: we pop out the one that matches the id of the current event log
        // but if we say "-1", we remove the trigger that indicates there's another page
        this.logCount = response.data.logCount;

        const newDataList = [];
        dataList.forEach((eventLog) => {
          const modifiedEvent = eventLog as any;
          if (this.currentEventLogId) {
            modifiedEvent.isCurrent = eventLog.id === this.currentEventLogId;
          }
          modifiedEvent.image = eventLog.image ? this.utilService.getImageName(eventLog.image) : 'Unknown';
          newDataList.push(modifiedEvent);
        });
        // use the new data list to display related events
        this.relatedEventsTableData = new MatTableDataSource(newDataList);

      }, (err) => {
        if (err?.error?.message) {
          this.alertService.danger(err.error.message);
        } else if (err?.error) {
          this.alertService.danger(err.error);
        } else if (err?.message) {
          this.alertService.danger(err.message);
        } else {
          this.alertService.danger(err);
        }
      });
  }

  buildFalcoLogFilters(): FalcoLogOptions {
    const basicFilters = {
      limit: this.limit,
      page: this.page,
    };
    const omitEmpty = obj => {
      Object.keys(obj).filter(k => !obj[k]).forEach(k => delete(obj[k]));
      return obj;
    };
    return {
      ...omitEmpty(this.filters),
      ...omitEmpty(basicFilters),
    };
  }

  rowClicked(row) {
    this.recentEventClicked.emit(row);
  }
}
