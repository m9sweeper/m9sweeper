import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ClusterService } from '../../../../../core/services/cluster.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ClusterGroupService } from '../../../../../core/services/cluster-group.service';
import { MatDialog } from '@angular/material/dialog';
import { ClusterGroupCreateComponent } from '../../cluster-group/cluster-group-create/cluster-group-create.component';
import { DeploymentService } from '../../../../../core/services/deployment.service';
import { IServerResponse } from '../../../../../core/entities/IServerResponse';
import { IImageScanCount } from '../../../../../core/entities/IImage';
import { ImageService } from '../../../../../core/services/image.service';
import { AlertService } from '@full-fledged/alerts';
import {ConfirmationDialogComponent} from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import {GenericErrorDialogComponent} from '../../../../shared/generic-error-dialog/generic-error-dialog.component';
import { AddClusterWizardComponent } from '../add-cluster-wizard/add-cluster-wizard.component';
import { PodService } from 'src/app/core/services/pod.service';
import { format, sub } from 'date-fns';
import {map, shareReplay, take, takeUntil} from 'rxjs/operators';
import { ChartSizeService } from '../../../../../core/services/chart-size.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'app-cluster-list',
  templateUrl: './cluster-list.component.html',
  styleUrls: ['./cluster-list.component.scss', '../../../../../../styles.scss']
})
export class ClusterListComponent implements OnInit, OnDestroy, AfterViewInit {
  private unsubscribe$ = new Subject<void>();
  clustersList: any;
  backupClusterList: any;
  groupId: number;
  clusterGroupName = '';
  clusterGroupNameLoaded = false;
  disableOnSearch = false;
  readonly currentBreakpoint$ = this.breakpointObserver
    .observe([
      Breakpoints.XLarge, Breakpoints.Large,
      Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall
    ])
    .pipe(
      map(value => {
        console.log('cluster-list new breakpoint:', value);
        return value;
      }),
      shareReplay(),
    );

  areaChart: any[];
  view: any[];
  showXAxis = true;
  showYAxis = true;
  rotateXAxisTicks = false;
  barPadding = 25;
  width: number;
  height: number;
  subNavigationData: any;
  resizeTimeout;
  currentCardSize = 'col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-3';

  azureColorSchema = ['#004C1A', '#AA0000', '#2F6C71', '#B600A0', '#008272', '#001E51', '#004B51'];
  imageScanData: IImageScanCount[];
  totalVulnerabilities: number;
  countOfTotalImagesRunning: number;
  barChartAttributes = {
    view: [],
    colorScheme: {
      domain: ['#ec3c3c', '#f3865f', '#596fe0', '#59e059']
    },
    results: [],
    gradient: false,
    showXAxis: true,
    showYAxis: true,
    barPadding: 2,
    showLegend: false,
    legendTitle: '',
    legendPosition: 'left',
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
    yAxisLabel: 'Pod Compliance %',
    xAxisLabel: 'Day of Month',
    yScaleMin: 0,
    yScaleMax: 100,
    yAxisTicks: [0, 25, 50, 75, 100],
  };
  date = new Date();
  dateInMil = Date.now();

  scanXTickFormatting = (e: string) => {
    return e.split('-')[2];
  }
  constructor(
    private clusterService: ClusterService,
    private clusterGroupService: ClusterGroupService,
    private deploymentService: DeploymentService,
    private podService: PodService,
    private imageService: ImageService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private chartSizeService: ChartSizeService,
    private breakpointObserver: BreakpointObserver,  // @TODO: implement observations to set the breakpoints instead of using the set numbers in various components
  ) {
    this.subNavigationData = {
      tabItem: ['Recent', 'All', 'Runs'],
      title: 'Cluster List',
    };
    this.getSearchResult();
  }

  ngOnInit(): void {
    this.width = ((window.innerWidth - 20) * 10) / 12;
    this.height = window.innerHeight;
    // default column sizes before calculating them
    this.route.params.subscribe(routeParams => {
      this.groupId = +routeParams.groupId;
      this.clusterGroupService.getClusterGroupById(+routeParams.groupId)
        .pipe(take(1))
        .subscribe(result => {
        this.clusterGroupName = result.data.name;
        this.subNavigationData.title = this.clusterGroupName;
        this.clusterGroupNameLoaded = true;
      });
      this.clusterGroupService.setCurrentGroupId(this.groupId);
      this.getClustersByClusterGroupId(this.groupId);
    });
    this.clusterGroupService.getCurrentGroup()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(updatedClusterGroup => {
      this.clusterGroupName = updatedClusterGroup.name;
    });
  }

  ngAfterViewInit() {
    this.setChartHeightWidth();
  }

  @HostListener('window:resize', ['$event'])
  calculateScreenSize($event?: any) {
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
    this.setChartHeightWidth();
  }

  setChartHeightWidth(){
    // debounce chart resizing
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      const innerWindow = document.getElementsByTagName('app-cluster-list').item(0) as HTMLElement;

      const newDimensions = this.chartSizeService.getChartSize(
        innerWindow.offsetWidth,
        { xs: 1, s: 1, m: 2, l: 3 },
        { left: 20, right: 20 },
        { left: 30, right: 20 },
        { left: 10, right: 10 },
        { left: 8, right: 8 },
      );
      console.log('new chart dimensions: ', newDimensions);
      this.lineChartAttributes.view = newDimensions;
      this.barChartAttributes.view = this.lineChartAttributes.view;
      this.complianceSummaryLineChartAttributes.view = this.lineChartAttributes.view;
      console.log({lineChartDimensions: this.lineChartAttributes.view, barChartDimensions: this.barChartAttributes.view, complianceSummaryLineChartDimensions: this.complianceSummaryLineChartAttributes.view});
      // this.updateFormatting();
    } , 50);
  }

  /** Resize elements based on the space available outside of sidebar nav components instead of window size */
  // updateFormatting() {
  //   if (this.innerScreenWidth >= this.breakpointLarge) {
  //     // this.currentCardSize = 'col-xs-4';
  //   } else if (this.innerScreenWidth >= this.breakpointMedium) {
  //     // this.currentCardSize = 'col-xs-6';
  //   } else {
  //     // this.currentCardSize = 'col-xs-12';
  //   }
  // }

  set scrHeight(val: number) {
    if (val !== this.height) {
      this.height = val;
    }
  }

  set scrWidth(val: number) {
    if (val !== this.width) {
      this.width = ((val - 20) * 10) / 12;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getClustersByClusterGroupId(groupId: number) {
    this.clusterService.getClustersByClusterGroupId(groupId)
      .pipe(take(1))
      .subscribe(response => {
      this.clustersList = response.data;
      this.backupClusterList = response.data;
      for (const cluster of this.clustersList) {
        if (cluster.tags) {
          if (!cluster.tags.length) {
            cluster.tags = null;
          }
        }
      }
      const clusterIds = (this.clustersList && this.clustersList.length) ?
        this.clustersList.map(value => value.id) : [];
      this.getCountOfImageScan(clusterIds);
      this.getCountOfVulnerabilities(clusterIds);
      this.getPodComplianceSummaryForAllClusters();
    });
  }

  showCluster(cluster) {
    this.router.navigate(['/private/clusters', cluster.id, 'summary']);
  }

  deleteClusterGroup() {
    const confirmModal = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      closeOnNavigation: true,
      disableClose: true
    });

    confirmModal.afterClosed()
      .pipe(take(1))
      .subscribe(result => {
      if (result === undefined) {
        this.clusterGroupService.deleteClusterGroup(this.groupId).subscribe(resp => {
          // Forces the component to reload
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.navigate(['/private/dashboard']);
        }, err => {
          if (err.error && err.error.message === 'err_has_clusters') {
            this.displayErrorModal({
              title: 'Cluster group not deleted',
              message: `Delete all associated clusters before you can delete this cluster group.`
            });
          }
          else { this.displayErrorModal(); }
        });
      }
    });
  }

  displayErrorModal(data?: {title?: string, message?: string, btnText?: string}) {
    const confirmModal = this.dialog.open(GenericErrorDialogComponent, {
      width: '400px',
      closeOnNavigation: true,
      disableClose: true,
      data
    });
  }

  openClusterDialog() {
    this.groupId = +this.router.url.split('/').reverse()[0];
    const openAddCluster = this.dialog.open(AddClusterWizardComponent, {
      width: '900px',
      height: '75%',
      minHeight: '300px',
      closeOnNavigation: true,
      disableClose: true,
      data: { groupId: this.groupId }
    });
    openAddCluster.afterClosed()
      .pipe(take(1))
      .subscribe(response => {
      if (response && response?.result === true) {
        this.getClustersByClusterGroupId(this.groupId);
      }
    });
  }


  editClusterGroupNameDialog(){
    const confirmDialog = this.dialog.open(ClusterGroupCreateComponent, {
      width: '520px',
      closeOnNavigation: true,
      disableClose: true,
      data: {clusterGroupName: this.clusterGroupName, clusterGroupId: this.groupId, isEdit: true}
    });
  }

  getSearchResult() {
    this.clusterService.getData()
      .pipe(take(1))
      .subscribe(response => {
      if (response.result) {
        if (response.result.data.length) {
          this.clustersList = response.result.data;
          const clusterIds = (this.clustersList && this.clustersList.length) ?
            this.clustersList.map(value => value.id ) : [];
          this.getCountOfImageScan(clusterIds);
          this.getCountOfVulnerabilities(clusterIds);
        }
        else {
          this.clustersList = [];
          this.disableOnSearch = true;
        }
      }
    });
  }

  getCountOfImageScan(clusterId: Array<number>) {
    this.imageService.getCountOfImageScan(clusterId)
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
    }, error => {
      this.alertService.danger(error.error.message);
    });
  }

  getPodComplianceSummaryForAllClusters() {
    this.podService.getPodsComplianceSummary(undefined)
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
              value: imageScan.percentage
            };
          })
        }
      ];
    }, error => {
      console.log(`Error in Get Count Of Deployment By Compliant Status`, error);
    });
  }

  getCountOfVulnerabilities(clusterIds: Array<number>) {
    const startDate = format(sub(new Date(), {days: 28}), 'yyyy-MM-dd');
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const filters = {clusterIds, startDate, endDate};
    const defaultDataToDisplay = [
        {
          name: format(new Date(), 'yyyy-MM-dd'),
          series: [
            {
              name: 'Critical',
              value: 0
            }
          ]
        }
      ];
    this.imageService.getCountOfVulnerabilities(filters, 'savedAtDate')
      .pipe(take(1))
      .subscribe(response => {
      this.barChartAttributes.results = response.data && response.data.length > 0 ? response.data.map(data => {
        return {
          name: data.savedAtDate.split('T')[0],
          series: [
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
      }) : defaultDataToDisplay;
    },
      error => {
        this.alertService.danger(error.error.message);
      });
  }

  shortGroupName(name: string){
    const trimmedName = name.trim();
    if (trimmedName.length > 1 ) {
      const splitNameArray = trimmedName.split(' ').filter(value => value);
      return splitNameArray.length > 1 ? splitNameArray[0][0] + splitNameArray[1][0] : splitNameArray[0].substr(0, 2);
    }
    return trimmedName;
  }

  calculateMenuColor(rowIndex: number ) {
    if (rowIndex < 5) {
      return this.azureColorSchema[rowIndex];
    }
    return this.azureColorSchema[rowIndex % 7];
  }

  truncateTagName(tagName: any) {
    if (tagName.name.length > 7) {
      return tagName.name.substring(0, 7) + '...';
    }
    else {
      return tagName.name;
    }
  }

  limitTagList(tags: string) {
    if (tags.length && tags.length > 6) {
      return 'more...';
    }
  }
}
