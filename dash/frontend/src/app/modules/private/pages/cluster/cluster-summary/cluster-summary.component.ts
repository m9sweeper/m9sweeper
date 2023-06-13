import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { IImageScanCount } from '../../../../../core/entities/IImage';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from '@full-fledged/alerts';
import { DeploymentService } from '../../../../../core/services/deployment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IServerResponse } from '../../../../../core/entities/IServerResponse';
import { ImageService } from '../../../../../core/services/image.service';
import { ClusterService } from '../../../../../core/services/cluster.service';
import { INamespaceTotalVulnerability } from '../../../../../core/entities/INamespaceTotalVulnerability';
import { IClusterEvent } from '../../../../../core/entities/IClusterEvent';
import { FormatDate } from '../../../../shared/format-date/format-date';
import { MatDialog } from '@angular/material/dialog';
import { ClusterEventComponent } from '../cluster-event/cluster-event.component';
import { SharedSubscriptionService } from '../../../../../core/services/shared.subscription.service';
import { merge, Subscription, Subject } from 'rxjs';
import { MatSort} from '@angular/material/sort';
import { PodService } from 'src/app/core/services/pod.service';
import { format, sub } from 'date-fns';
import { take, takeUntil } from 'rxjs/operators';
import { ChartSizeService } from '../../../../../core/services/chart-size.service';

@Component({
  selector: 'app-cluster-summary',
  templateUrl: './cluster-summary.component.html',
  styleUrls: ['./cluster-summary.component.scss', '../../../../../../styles.scss']
})

export class ClusterSummaryComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  subNavigationTitle: string;
  subNavigationButtonTitle: string;
  width: number;
  height: number;
  clusterId: number;
  imageScanData: IImageScanCount[];
  totalVulnerabilities = 0;
  countOfPolicyViolations: number;
  countOfTotalImagesRunning: number;
  displayedColumns: string[] = ['namespace', 'criticalIssues', 'majorIssues', 'mediumIssues', 'lowIssues', 'negligibleIssues'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  dataSource: MatTableDataSource<INamespaceTotalVulnerability>;
  barChartAttributes = {
    view: [480, 260],
    colorScheme: {
      domain: ['#ec3c3c', '#f3865f', '#596fe0', '#59e059']
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
    yAxisLabel: 'Vulnerabilities',
    xAxisLabel: 'Day of Month',
  };
  lineChartAttributes = {
    view: [],
    colorScheme: {
      domain: ['#59e059']
    },
    results: [],
    gradient: false,
    showXAxis: true,
    showYAxis: true,
    showLegend: false,
    legendPosition: 'below',
    showXAxisLabel: true,
    showYAxisLabel: true,
    autoScale: false,
    yAxisLabel: 'Total Scans',
    xAxisLabel: 'Day of Month',
    yScaleMin: 0,
    yAxisTicks: [],
  };
  complianceSummaryLineChartAttributes = {
    view: [480, 260],
    colorScheme: {
      domain: ['#59e059']
    },
    results: [],
    gradient: false,
    showXAxis: true,
    showYAxis: true,
    showLegend: false,
    legendPosition: 'below',
    showXAxisLabel: true,
    showYAxisLabel: true,
    autoScale: false,
    yAxisLabel: 'Pod Compliance %',
    xAxisLabel: 'Day of Month',
    yScaleMin: 0,
    yScaleMax: 100,
    yAxisTicks: [0, 25, 50, 75, 100],
  };
  page = 0;
  limit = 10;
  clusterEvents: IClusterEvent[];
  headElements = ['Description', 'Type', 'Level', 'Data', 'Entity Type', 'Creation Time'];
  formatData = FormatDate.formatLastScannedDate;
  expandStatus: boolean;
  expandSubscription: Subscription;
  currentCardSize: string;
  breakpointLarge = 1200;
  breakpointMedium = 800;
  resizeTimeout;
  scanXTickFormatting = (e: string) => {
    return e.split('-')[2];
  }
  constructor(private route: ActivatedRoute,
              private router: Router,
              private imageService: ImageService,
              private sharedSubscriptionService: SharedSubscriptionService,
              private clusterService: ClusterService,
              private podService: PodService,
              private deploymentService: DeploymentService,
              private alertService: AlertService,
              private dialog: MatDialog,
              private chartSizeService: ChartSizeService,
              ) {
  }

  ngOnInit(): void {
    this.subNavigationTitle = 'Summary';
    this.route.parent.params
      .pipe(take(1))
      .subscribe(param => {
      this.clusterId = param.id;
    });

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    // default card sizes, will be overridden in code
    this.currentCardSize = 'col-xs-12 col-md-6 col-lg-4';

    this.getCountOfImageScan(this.clusterId);
    this.getCountOfVulnerabilities(this.clusterId);
    this.getTotalVulnerabilities(this.clusterId);
    this.getPolicyViolationCount(this.clusterId);
    this.getCountOfFilteredImages({clusterId: this.clusterId, runningInCluster: true});
    this.getPodComplianceSummaryForAllClusters(this.clusterId);
    this.getClusterEvents(this.limit, this.page);
    this.expandSubscription = this.sharedSubscriptionService.getCurrentExpandStatus()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
      this.expandStatus = status;
      this.setChartHeightWidth();
    });
    this.expandStatus = localStorage.getItem('expand') ? JSON.parse(localStorage.getItem('expand')) : true;
  }

  ngAfterViewInit() {
    merge(this.route.queryParams, this.sort.sortChange)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.namespaceTotalVulnerabilityByClusterId());
    this.setChartHeightWidth();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setChartHeightWidth(){
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.updateFormatting();
      this.lineChartAttributes.view = this.chartSizeService.getDashboardChartSize(this.breakpointLarge,
        this.breakpointMedium, false);
      // this.barChartAttributes.view = this.lineChartAttributes.view;
      // this.complianceSummaryLineChartAttributes.view = this.lineChartAttributes.view;
    }, 50);
  }

  namespaceTotalVulnerabilityByClusterId(){
    this.clusterService.namespaceTotalVulnerabilityByClusterId(this.clusterId, this.sort)
      .pipe(take(1))
      .subscribe((response: IServerResponse<INamespaceTotalVulnerability[]>) => {
      this.dataSource = new MatTableDataSource(response.data);
    }, error => {
      this.alertService.danger(error.error.message);
    });
  }

  @HostListener('window:resize', ['$event'])
  calculateScreenSize($event?: any) {
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
    this.setChartHeightWidth();
  }

  getPodComplianceSummaryForAllClusters(clusterId: number) {
    this.podService.getPodsComplianceSummary(clusterId)
        .pipe(take(1))
        .subscribe(response => {
      const complianceSummaryData = response.data;
      if (complianceSummaryData && complianceSummaryData.length === 0) {
        return false;
      }
      this.complianceSummaryLineChartAttributes.results = [
        {
          name: '',
          series: complianceSummaryData.map(imageScan => {
            return {
              name: imageScan.dateString,
              value: +imageScan.percentage
            };
          })
        }
      ];
    }, error => {
      console.log(`Error in Get Count Of Deployment By Compliant Status`, error);
    });
  }

  getCountOfImageScan(clusterId: number) {
    this.imageService.getCountOfImageScan([clusterId])
      .pipe(take(1))
      .subscribe((response: IServerResponse<IImageScanCount[]>) => {
      this.imageScanData = response.data;
      if (this.imageScanData && this.imageScanData.length === 0) {
        return false;
      }
      const imageCounts = response.data.map(r => r.count);
      const lineChartRange = this.clusterService.calculateScanHistoryChartRange(imageCounts);
      this.lineChartAttributes.yAxisTicks = lineChartRange.yAxisTicks;
      this.lineChartAttributes.results = [
        {
          name: '',
          series: this.imageScanData.map(imageScan => {
            return {
              name: imageScan.date.split('T')[0],
              value: +imageScan.count
            };
          })
        }
      ];
      console.log('result: ', this.lineChartAttributes.results);
      console.log('result type: ', typeof(this.lineChartAttributes.results));
    }, error => {
      this.alertService.danger(error.error.message);
    });
  }

  getCountOfFilteredImages(filterBy: {clusterId: number, runningInCluster?: boolean}) {
    this.imageService.getCountOfFilteredImages(filterBy)
      .pipe(take(1))
      .subscribe(response => {
      this.countOfTotalImagesRunning = +response.data;
    }, error => {
      console.log(`Error in get image summary`, error);
    });
  }

  getCountOfVulnerabilities(clusterId: number) {
    const startDate = format(sub(new Date(), {days: 28}), 'yyyy-MM-dd');
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const filters = {clusterIds: [clusterId], startDate, endDate};
    this.imageService.getCountOfVulnerabilities(filters, 'savedAtDate')
      .pipe(take(1))
      .subscribe(response => {
        this.barChartAttributes.results = response.data && response.data.length > 0 ? response.data.map(data => {
          return {
            name: data.savedAtDate.split('T')[0],
            series : [
              {
                name: 'Critical',
                value: +data.criticalIssues
              },
              {
                name: 'Major',
                value: +data.majorIssues
              },
              {
                name: 'Medium',
                value: +data.mediumIssues
              },
              {
                name: 'Low',
                value: +data.lowIssues
              },
            ]
          };
        }) : [];
      },
      error => {
        this.alertService.danger(error.error.message);
      });
  }

  getTotalVulnerabilities(clusterId: number) {
    this.imageService.getTotalVulnerabilities(clusterId, {})
      .pipe(take(1))
      .subscribe((response: IServerResponse<number>) => {
      this.totalVulnerabilities = response.data;
    }, error => {
      this.alertService.danger(error.error.message);
    });
  }

  getClusterEvents(limit: number, page: number) {
    this.clusterService.getClusterEvents(this.clusterId, limit, page)
      .pipe(take(1))
      .subscribe((response: IServerResponse<IClusterEvent[]>) => {
      if (response.data) {
        if (this.page > 0){
          this.clusterEvents.push(...response.data);
        } else {
          this.clusterEvents = response.data;
        }
      }
    }, error => {
      this.alertService.danger(error.error.message);
    });
  }

  getPolicyViolationCount(clusterId: number) {
    this.imageService.getPolicyViolationCount(clusterId)
      .pipe(take(1))
      .subscribe((response: IServerResponse<number>) => {
      this.countOfPolicyViolations = response.data[0].count;
    }, error => {
      this.alertService.danger(error.error.message);
    });
  }

  openEventDetailsDialog(event: IClusterEvent) {
    this.dialog.open(ClusterEventComponent, {
      width: 'auto',
      height: 'auto',
      maxWidth: 550,
      maxHeight: 600,
      minWidth: 100,
      minHeight: 100,
      autoFocus: false,
      closeOnNavigation: true,
      disableClose: false,
      data: {
        eventId: event.id,
        createdDate: event.createdDate,
        type: event.type,
        level: event.level,
        data: event.data,
        description: event.description,
      }
    });
  }

  getK8sPods(row: INamespaceTotalVulnerability) {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'kubernetes-namespaces', row?.namespace, 'pods']);
  }

  onScroll() {
    this.page = this.page + 1;
    this.getClusterEvents(this.limit, this.page);
  }

  set scrHeight(val: number) {
    if (val !== this.height) {
      this.height = val;
    }
  }

  get scrHeight(): number {
    return this.height;
  }

  set scrWidth(val: number) {
    if (val !== this.width) {
      this.width = val;
    }
  }

  get scrWidth(): number {
    return this.width;
  }

  updateFormatting() {
    const screenWidth = +document.documentElement.style
      .getPropertyValue('--cluster-container-width')
      .replace('px', '');
    if (screenWidth >= this.breakpointLarge) {
      this.currentCardSize = 'col-xs-4';
    } else if (screenWidth >= this.breakpointMedium) {
      this.currentCardSize = 'col-xs-6';
    } else {
      this.currentCardSize = 'col-xs-12';
    }
  }
}
