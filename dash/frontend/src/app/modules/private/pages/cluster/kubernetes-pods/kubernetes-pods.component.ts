import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {ActivatedRoute, Router} from '@angular/router';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {IPod} from '../../../../../core/entities/IPod';
import {MatTableDataSource} from '@angular/material/table';
import {AlertService} from '@full-fledged/alerts';
import {PodService} from '../../../../../core/services/pod.service';
import {ImageIssueMoreDataDialogComponent} from '../../image/image-issue-more-data-dialog/image-issue-more-data-dialog.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';


@Component({
  selector: 'app-kubernetes-pods',
  templateUrl: './kubernetes-pods.component.html',
  styleUrls: [
    './kubernetes-pods.component.scss',
    '../../../../../app.component.scss',
  ]
})
export class KubernetesPodsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'resourceVersion', 'generateName', 'compliant', 'violations'];
  dialogRef: MatDialogRef<ImageIssueMoreDataDialogComponent>;
  dataSource: MatTableDataSource<IPod>;
  clusterId: number;
  namespace: null;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  initialDate = new Date();
  totalNumPods: number;
  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 10;
  page = 0;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private  podService: PodService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.route.parent.parent.parent.params.subscribe(param => {
      this.clusterId = param.id;
    });
    this.route.params.subscribe(routeParams => {
      this.namespace = routeParams.namespace;
    });
    this.loadCurrentPods();
  }

  dateChanged(dateData: { isToday: boolean, desiredDate: Date, startTime: number, endTime: number }) {
    this.page = 0;
    if (dateData.isToday) {
      this.loadCurrentPods();
    } else {
      this.loadHistoricalPods(dateData.startTime, dateData.endTime);
    }
  }

  loadCurrentPods() {
    this.podService.getNumOfCurrentPods(this.clusterId, this.namespace)
      .subscribe(
        (response: IServerResponse<string>) => this.handleGetCountSuccessResponse(response),
        error => this.handleGetCountErrorResponse(error),
      );
    this.podService.getAllCurrentPods(this.clusterId, this.namespace, this.limit, this.page)
      .subscribe(
        (response: IServerResponse<IPod[]>) => this.handleGetPodsSuccessResponse(response),
        error => this.handleGetPodsErrorResponse(error),
      );
  }

  loadHistoricalPods(startTime: number, endTime: number) {
    this.podService.getNumOfPodsBySelectedDate(
      this.clusterId, this.namespace,
      startTime, endTime,
    ).subscribe(
      (response: IServerResponse<string>) => this.handleGetCountSuccessResponse(response),
      error => this.handleGetCountErrorResponse(error),
    );
    this.podService.getPodsBySelectedDate(
      this.clusterId, this.namespace,
      startTime, endTime, this.sort,
      this.limit, this.page,
    ).subscribe(
      (response: IServerResponse<IPod[]>) => this.handleGetPodsSuccessResponse(response),
      error => this.handleGetPodsErrorResponse(error),
    );
  }

  handleGetCountSuccessResponse(response: IServerResponse<string>) {
    if (response.data) {
      this.totalNumPods = parseInt(response.data, 10);
    } else {
      this.totalNumPods = 0;
    }
  }
  handleGetCountErrorResponse(error) {
    try {
      this.totalNumPods = parseInt(error.data, 10);
    } catch (e) {
      this.totalNumPods = 0;
    }
  }

  handleGetPodsSuccessResponse(response: IServerResponse<IPod[]>) {
    if (response.data) {
      this.dataSource = new MatTableDataSource(response.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource = new MatTableDataSource([]);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }
  handleGetPodsErrorResponse(error) {
    try {
      this.dataSource = new MatTableDataSource(error.data);
    } catch (e) {
      this.dataSource = new MatTableDataSource([]);
    }
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.alertService.danger(error.error.message);
  }

  // @TODO: server side pagination

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('kubernetes_pods_table_limit', String(limit));
  }
  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('kubernetes_pods_table_limit');
  }

  showViolations(element) {
    const issue = {
      extraData: [],
    };
    issue.extraData = element.violations;
    this.dialog.open(ImageIssueMoreDataDialogComponent, {
      width: 'auto',
      data: {issue}
    });
  }
}
