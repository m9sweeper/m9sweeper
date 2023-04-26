import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { take, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import {UntypedFormBuilder, UntypedFormGroup,} from '@angular/forms';
import { NamespaceService } from '../../../../../core/services/namespace.service';
import { ImageService } from '../../../../../core/services/image.service';
import { differenceInCalendarDays, format, isAfter, sub, startOfToday } from 'date-fns';
import {AlertService} from '@full-fledged/alerts';
import { Subject } from 'rxjs';
import { SharedSubscriptionService } from '../../../../../core/services/shared.subscription.service';
import { VulnerabilitySeverity } from '../../../../../core/enum/VulnerabilitySeverity';
import { ReportsService } from '../../../../../core/services/reports.service';
import {ChartSizeService} from '../../../../../core/services/chart-size.service';
import {CustomValidatorService} from '../../../../../core/services/custom-validator.service';

@Component({
  selector: 'app-worst-images',
  templateUrl: './worst-images.component.html',
  styleUrls: ['./worst-images.component.scss']
})
export class WorstImagesComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  clusterId: number;
  filterForm: UntypedFormGroup;
  clusterNamespaces: Array<string>;
  barChartAttributes = {
    view: [],
    colorScheme: {
      domain: ['#59e059', '#888888', '#596fe0',
        '#ffd600', '#f3865f', '#ec3c3c']
    },
    results: [],
    gradient: false,
    showXAxis: true,
    showYAxis: true,
    barPadding: 2,
    showLegend: false,
    legendPosition: 'below',
    showXAxisLabel: true,
    showYAxisLabel: true,
    yAxisLabel: 'Images',
    xAxisLabel: 'Day of Month',
  };
  startDate: string;
  endDate: string;
  namespaces: Array<string>;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private namespaceService: NamespaceService,
    private imageService: ImageService,
    private alertService: AlertService,
    private sharedSubscriptionService: SharedSubscriptionService,
    private reportService: ReportsService,
    private chartSizeService: ChartSizeService,
    private customValidatorService: CustomValidatorService,
  )
  {}

  ngOnInit() {
    this.route.parent.parent.params
      .pipe(take(1))
      .subscribe(param => this.clusterId = param.id);

    this.namespaceService.getAllK8sNamespaces(this.clusterId)
      .pipe(take(1))
      .subscribe((response) => {
        this.clusterNamespaces = new Array<string>();
        for (const namespace of response.data) {
          this.clusterNamespaces.push(namespace.name);
        }
        this.clusterNamespaces.sort();
      });

    this.filterForm = this.formBuilder.group({
      namespaces: [[]],
      startDate: [sub(startOfToday(), {days: 28}), [this.customValidatorService.dateInPastOrToday]],
      endDate: [startOfToday()]
    });

    this.endDate = format(startOfToday(), 'yyyy-MM-dd');
    this.startDate = format(sub(startOfToday(), {days: 28}), 'yyyy-MM-dd');
    this.namespaces = new Array<string>();

    this.buildBarChartData();

    this.sharedSubscriptionService.getCurrentExpandStatus()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.setChartSize();
      });

    this.setChartSize();
  }

  buildBarChartData() {
    this.reportService.getWorstImages(this.clusterId, this.namespaces, this.startDate, this.endDate)
      .pipe(take(1))
      .subscribe(response => {
        this.barChartAttributes.results = response.data && response.data.length > 0 ? response.data.map(data => {
          return {
            name: data.savedDate,
            series: [
              {
                name: 'None',
                value: +data.safeImages
              },
              {
                name: VulnerabilitySeverity.NEGLIGIBLE,
                value: +data.negligibleImages
              },
              {
                name: VulnerabilitySeverity.LOW,
                value: +data.lowImages
              },
              {
                name: VulnerabilitySeverity.MEDIUM,
                value: +data.mediumImages
              },
              {
                name: VulnerabilitySeverity.MAJOR,
                value: +data.majorImages
              },
              {
                name: VulnerabilitySeverity.CRITICAL,
                value: +data.criticalImages
              },
            ]
          };
        }) : [];
        },
        error => {
          this.alertService.danger(error.error.message);
        });
  }

  rebuildWithFilters() {
    if (differenceInCalendarDays(this.filterForm.get('endDate')?.value, this.filterForm.get('startDate')?.value) > 365) {
      this.alertService.danger('Please select a date range under 365 days');
    } else {
      this.startDate = format(this.filterForm.get('startDate').value, 'yyyy-MM-dd');
      this.endDate = format(this.filterForm.get('endDate').value, 'yyyy-MM-dd');
      this.namespaces = this.filterForm.get('namespaces')?.value;

      this.buildBarChartData();
    }
  }


  get filtersValid(): boolean {
    return this.filterForm.valid &&
      !isAfter(this.filterForm.get('startDate')?.value, this.filterForm.get('endDate')?.value);
  }

  scanXTickFormatting = (e: string) => {
    return e.split('-')[2];
  }

  @HostListener('window:resize', ['$event'])
  setScreenSize($event?: any) {
    this.setChartSize();
  }

  setChartSize() {
    this.barChartAttributes.view = this.chartSizeService.getReportChartSize();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
