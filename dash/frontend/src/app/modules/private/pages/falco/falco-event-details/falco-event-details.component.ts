import {AfterViewInit, Component, HostListener, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FalcoService} from '../../../../../core/services/falco.service';
import { MatTableDataSource } from '@angular/material/table';
import {IFalcoLog} from '../../../../../core/entities/IFalcoLog';
import {take, timeout} from 'rxjs/operators';
import {AlertService} from '@full-fledged/alerts';
import {IFalcoCount} from '../../../../../core/entities/IFalcoCount';
import {ShareLinkComponent} from '../../../../../core/dialogues/share-link/share-link.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ChartSizeService} from '../../../../../core/services/chart-size.service';
import {UtilService} from '../../../../../core/services/util.service';

@Component({
  selector: 'app-falco-event-details',
  templateUrl: './falco-event-details.component.html',
  styleUrls: ['./falco-event-details.component.scss']
})
export class FalcoEventDetailsComponent implements OnInit, AfterViewInit {
  header: string;

  constructor(
    private route: ActivatedRoute,
    private falcoService: FalcoService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private chartSizeService: ChartSizeService,
  ) {}

  signature: string;
  clusterId: number;
  eventId: number;

  message: string;
  raw: object;
  format = 'table';  // options: yaml, json, table
  rawInFormat: string;
  extractProperty: {key: string, value: string}[] = [];

  falcoCountData: IFalcoCount[];
  eventData: IFalcoLog;
  eventDetails: MatTableDataSource<{title: string, value: any}>;
  resizeTimeout;
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


  falcoEventLogsStylingOptions = {
    tableBorder: false,
  };

  ngOnInit(): void {
    this.clusterId = this.route.parent.parent.snapshot.params.id;
    this.eventId = this.route.snapshot.params.eventId;
    this.signature = this.route.snapshot.params.signature;
    this.getEventById();
    this.buildBarChartData();
    this.setChartHeightWidthWithoutTimeout();  // starts at a reasonable size
  }

  ngAfterViewInit() {
    this.setChartHeightWidth();
  }

  @HostListener('window:resize', ['$event'])
  calculateScreenSize($event?: any) {
    this.setChartHeightWidth();
  }

  getEventById(){
      this.falcoService.getFalcoLogByEventId( this.eventId )
      .pipe(take(1))
      .subscribe(response => {
        this.message = response.data.message;
        this.raw = response.data.raw;
        this.extractProperty = this.extractProperties(this.raw);
        this.eventData = response.data;
        this.eventDetails = new MatTableDataSource( [
          {
            title: 'Namespace',
            value: this.eventData.namespace,
          },
          {
            title: 'Date',
            value: new Date(+(this.eventData.timestamp)),
          },
          {
            title: 'Pod',
            value: this.eventData.container,
          },
          {
            title: 'Image',
            value: this.eventData.image,
          },
          {
            title: 'Priority',
            value: this.eventData.raw.priority,
          },
          {
            title: 'Signature',
            value: this.eventData.anomalySignature,
          },
        ]);
      }, (err) => {
        this.alertService.danger(err.error.message);
      });
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
      }
    },
    error => {
      this.alertService.danger(error.error.message);
    });
  }

  onClickShare(){
    this.dialog.open(ShareLinkComponent, {
      height: 'fit-content',
      data: {
        title: 'Share Event',
        description: 'Send this link to share this event\'s details with someone else.',
        textToCopy: window.location.href,
      },
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
  }

  setChartHeightWidth(){
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.setChartHeightWidthWithoutTimeout();
    }, 1000);
  }

  setChartHeightWidthWithoutTimeout() {
    const innerWindow = document.getElementsByTagName('app-falco-event-details').item(0) as HTMLElement;

    const [calculatedWidth, calculatedHeight] = this.chartSizeService.getChartSize(
      innerWindow.offsetWidth,
      { xs: 1, s: 1, m: 2, l: 2},
      { left: 20, right: 20 },
      { left: 16, right: 16 },
      { left: 0, right: 0 },
      { left: 16, right: 16 },
      500,
    );
    /** the height is set because the card height is set */
    this.barChartAttributes.view = [calculatedWidth, 306];
  }
}
