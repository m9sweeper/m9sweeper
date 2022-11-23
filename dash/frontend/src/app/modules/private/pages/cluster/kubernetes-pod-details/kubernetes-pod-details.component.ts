import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService} from '@full-fledged/alerts';
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
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {KubesecDialogComponent} from '../kubesec/kubesec-dialog/kubesec-dialog.component';
import {ImageIssueMoreDataDialogComponent} from '../../image/image-issue-more-data-dialog/image-issue-more-data-dialog.component';
import {GatekeeperViolationDialogComponent} from "../gatekeeper-violation-dialog/gatekeeper-violation-dialog.component";


@Component({
  selector: 'app-kubernetes-pod-details',
  templateUrl: './kubernetes-pod-details.component.html',
  styleUrls: [
    './kubernetes-pod-details.component.scss',
    '../../../../../app.component.scss',
  ]
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
  initialDate = new Date();
  totalNumImages: number;
  limit = 10;
  page = 0;
  kubesecReport: string;
  dialogRef: MatDialogRef<GatekeeperViolationDialogComponent>;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private dialog: MatDialog,
    private podService: PodService,
    private imageService: ImageService,
    private kubesecService: KubesecService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.parent.parent.parent.parent.params.subscribe(param => {
      this.clusterId = param.id;
      if (this.namespace && this.podName) {
        this.setPodAndImages();
      }
    });
    this.route.params.subscribe(routeParams => {
      this.namespace = routeParams.namespace;
      this.podName = routeParams.pod;
      if (this.clusterId) {
        this.setPodAndImages();
      }
    });
  }

  dateChanged(dateData: { isToday: boolean, desiredDate: Date, startTime: number, endTime: number }) {
    console.log({'date changed': dateData});
    this.page = 0;
    if (dateData.isToday) {
      this.loadCurrentImages();
    } else {
      this.loadHistoricalImages(dateData.startTime, dateData.endTime);
    }
  }

  setPodAndImages() {
    const today = new Date();
    const desiredDateAsString = parseInt(localStorage.getItem('dateSearchTerm'), 10);
    const desiredDate = new Date(desiredDateAsString);
    const isToday = (
      today.getFullYear() === desiredDate.getFullYear() &&
      today.getMonth() === desiredDate.getMonth() &&
      today.getDate() === desiredDate.getDate()
    );
    if (isToday) {
      this.getPodInfo();
      this.loadCurrentImages();
    } else {
      const mutableDate = new Date(desiredDate.getTime());
      const startTime = mutableDate.setHours(0, 0, 0, 0).valueOf();
      const endTime = mutableDate.setHours(23, 59, 59, 999).valueOf();
      this.getHistoricalPodInfo(startTime, endTime);
      this.loadHistoricalImages(startTime, endTime);
    }
  }

  getPodInfo() {
    this.podService.getPodByName(this.clusterId, this.namespace, this.podName).subscribe(
      (response: IServerResponse<IPod>) => {
        this.podInfo = response?.data;
      },
      (error) => {
        this.podInfo = error?.data ? error.data : null;
      }
    );
  }

  getHistoricalPodInfo(startTime: number, endTime: number) {
    this.podService.getPodByNameAndDate(this.clusterId, this.namespace, this.podName, startTime, endTime).subscribe(
      (response: IServerResponse<IPod>) => {
        this.podInfo = response?.data;
      },
      (error) => {
        this.podInfo = error?.data ? error.data : null;
      }
    );
  }

  getImageDetails(row: IImage) {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'images', 'image-scan', row?.id]);
  }

  loadCurrentImages() {
    this.imageService.getAllCurrentImagesByPodName(this.podName, this.clusterId, this.namespace, this.limit, this.page)
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
    ).subscribe(
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
    this.dialogRef = this.dialog.open(GatekeeperViolationDialogComponent, {
      width: 'auto',
      data: {violations: this.podInfo.violations}
    });

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}
