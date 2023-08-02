import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService} from 'src/app/core/services/alert.service';
import {PodService} from '../../../../../core/services/pod.service';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {FormatDate} from '../../../../shared/format-date/format-date';
import {ImageService} from '../../../../../core/services/image.service';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {IImage, ImagesAndCount} from '../../../../../core/entities/IImage';
import {IPod} from '../../../../../core/entities/IPod';
import {KubesecService} from '../../../../../core/services/kubesec.service';
import {take} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {KubesecDialogComponent} from '../kubesec/kubesec-dialog/kubesec-dialog.component';
import {GatekeeperViolationDialogComponent} from '../gatekeeper-violation-dialog/gatekeeper-violation-dialog.component';
import {DatePipe} from '@angular/common';


@Component({
  selector: 'app-kubernetes-pod-details',
  templateUrl: './kubernetes-pod-details.component.html',
  styleUrls: ['./kubernetes-pod-details.component.scss']
})
export class KubernetesPodDetailsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'summary', 'lastScanned', 'compliant'];
  dataSource: MatTableDataSource<IImage>;
  clusterId: number;
  namespace: null;
  podName: null;
  podInfo: IPod;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  formatDate = FormatDate;
  totalNumImages: number;
  limit = 10;
  page = 0;
  kubesecReport: string;
  currentDateData: { isToday: boolean, desiredDate: Date, startTime: number, endTime: number };

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private dialog: MatDialog,
    private podService: PodService,
    private imageService: ImageService,
    private kubesecService: KubesecService,
    private router: Router,
    public datepipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.route.parent.parent.parent.parent.params.subscribe(param => {
      this.clusterId = param.id;
      if (this.namespace && this.podName) {
        this.loadImages();
      }
    });
    this.route.params.subscribe(routeParams => {
      this.namespace = routeParams.namespace;
      this.podName = routeParams.pod;
      if (this.clusterId) {
        this.loadImages();
      }
    });
  }

  dateChanged(dateData: { isToday: boolean, desiredDate: Date, startTime: number, endTime: number }) {
    this.currentDateData = dateData;
    this.loadImages();
  }

  loadImages() {
    this.page = 0;
    if (!this.currentDateData || !this.clusterId || !this.namespace || !this.podName) {
      return;
    }
    if (!this.currentDateData || this.currentDateData.isToday) {
      this.getPodInfo();
      this.loadCurrentImages();
    } else {
      this.getHistoricalPodInfo(this.currentDateData.startTime, this.currentDateData.endTime);
      this.loadHistoricalImages(this.currentDateData.startTime, this.currentDateData.endTime);
    }
  }

  getPodInfo() {
    this.podService.getPodByName(this.clusterId, this.namespace, this.podName).pipe(take(1)).subscribe(
      (response: IServerResponse<IPod>) => {
        this.podInfo = response?.data;
      },
      (error) => {
        console.log(error);
        this.alertService.danger('There was an error loading the pod details');
        this.podInfo = error?.data ? error.data : null;
      }
    );
  }

  getHistoricalPodInfo(startTime: number, endTime: number) {
    const transformedStartTime = this.datepipe.transform(startTime, 'yyyy-MM-dd');
    const transformedEndTime = this.datepipe.transform(endTime, 'yyyy-MM-dd');
    this.podService.getPodByNameAndDate(this.clusterId, this.namespace, this.podName, transformedStartTime, transformedEndTime)
      .pipe(take(1))
      .subscribe(
        (response: IServerResponse<IPod>) => {
          this.podInfo = response?.data;
        },
        (error) => {
          console.log(error);
          this.alertService.danger('There was an error loading the pod details');
          this.podInfo = error?.data ? error.data : null;
        }
      );
  }

  loadCurrentImages() {
    this.imageService.getAllCurrentImagesByPodName(this.podName, this.clusterId, this.namespace, this.limit, this.page)
      .pipe(take(1))
      .subscribe(
        (response: IServerResponse<ImagesAndCount>) => this.handleGetImagesSuccessResponse(response),
        error => this.handleGetImagesErrorResponse(error),
      );
  }

  loadHistoricalImages(startTime: number, endTime: number) {
    this.imageService.getImagesByPodNameAndSelectedDate(
      this.podName, this.clusterId, this.namespace,
      startTime, endTime, this.sort,
      this.limit, this.page,
    ).pipe(take(1)).subscribe(
      (response: IServerResponse<ImagesAndCount>) => this.handleGetImagesSuccessResponse(response),
      error => this.handleGetImagesErrorResponse(error),
    );
  }

  handleGetImagesSuccessResponse(response: IServerResponse<ImagesAndCount>) {
    if (response.data) {
      this.dataSource = new MatTableDataSource(response.data.listOfImages);
      this.totalNumImages = parseInt(response.data.total.toString(), 10);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource = new MatTableDataSource([]);
      this.totalNumImages = 0;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }
  handleGetImagesErrorResponse(error) {
    this.alertService.danger('There was an error loading the image details');
    try {
      this.dataSource = new MatTableDataSource(error.data.listOfImages);
      this.totalNumImages = parseInt(error.data.total.toString(), 10);
    } catch (e) {
      this.dataSource = new MatTableDataSource([]);
      this.totalNumImages = 0;
    }
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.alertService.danger(error.error.message);
  }

  runKubesec() {
    const info = {
      name: this.podName,
      namespace: this.namespace
    };
    this.kubesecService.getKubesecReport(info, this.clusterId).pipe(take(1))
      .subscribe(report => {
        this.kubesecReport = report;
        const openAddConstraint = this.dialog.open(KubesecDialogComponent, {
          width: '1000px',
          height: '80%',
          closeOnNavigation: true,
          disableClose: false,
          data: report,
        });
      }, (err) => {
      this.alertService.danger(err.error.text ? err.error.text : 'Could not get your kubesec report');
    });
  }

  getViolations() {
    if (this.podInfo.violations.length === 0) {
      this.alertService.warning('No violation yet.');
      return;
    }
    this.dialog.open(GatekeeperViolationDialogComponent, {
      width: 'auto',
      data: {violations: this.podInfo.violations}
    });
  }
}
