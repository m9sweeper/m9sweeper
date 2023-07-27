import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {MatTableDataSource} from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {DeploymentService} from '../../../../../core/services/deployment.service';
import {IDeployment} from '../../../../../core/entities/IDeployment';
import {FormatDate} from '../../../../shared/format-date/format-date';
import {filter, pairwise} from 'rxjs/operators';
import {merge} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-kubernetes-deployments',
  templateUrl: './kubernetes-deployments.component.html',
  styleUrls: ['./kubernetes-deployments.component.scss']
})
export class KubernetesDeploymentsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'namespace', 'generation', 'creationTime', 'compliant'];
  dataSource: MatTableDataSource<IDeployment>;
  clusterId: number;
  namespace: string;
  isDatePicker = true;
  dateEvent: any;
  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 10;
  page = 0;
  totalData: number;
  startTime: number;
  endTime: number;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  formatData = FormatDate.formatLastScannedDate;

  constructor(
    private titleService: Title,
    private deploymentService: DeploymentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
  }

  date = new Date();

  ngOnInit(): void {
    this.route.parent.params.subscribe(param => this.clusterId = param.id);
    this.route.params.subscribe(routeParams => {
      this.namespace = routeParams.namespace;
      this.titleService.setTitle(this.namespace + ' ' + 'deployments');
    });
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        pairwise()
      )
      .subscribe((event: any[]) => {
        const previousUrl = event[0].url.split('/').includes('kubernetes-namespaces');
        if (previousUrl) {
          localStorage.setItem('k8sPreviousRoute', JSON.stringify(true));
        } else {
          localStorage.setItem('k8sPreviousRoute', JSON.stringify(false));
        }
      });
  }

  ngAfterViewInit() {
    merge(this.route.queryParams, this.sort.sortChange).subscribe(() => this.loadDeployments());
  }

  loadDeployments() {
    const previousRoute = JSON.parse(localStorage.getItem('k8sPreviousRoute'));
    if (previousRoute) {
      if (localStorage.getItem('dateSearchTerm')) {
        this.dateEvent = new Date(Number(localStorage.getItem('dateSearchTerm')));
        this.date = this.dateEvent;
        this.getDeploymentsInfo(this.dateEvent);
      } else {
        this.getDeploymentsInfo(new Date());
      }
    } else {
      localStorage.removeItem('dateSearchTerm');
      this.getDeploymentsInfo(new Date());
    }
  }

  searchDeploymentsByDate(dateEvent) {
    this.getDeploymentsInfo(dateEvent);
  }

  getDeploymentsInfo(event) {
    // this.limit = 10;
    this.page = 0;
    const time = event ? event.value ? new Date(event.value) : event : new Date();
    localStorage.setItem('dateSearchTerm', time.getTime());
    this.startTime = time.setHours(0, 0, 0, 0).valueOf();
    this.endTime = time.setHours(23, 59, 59, 999).valueOf();
    const startOfToday = new Date().setHours(0, 0, 0, 0).valueOf();
    const endOfToday = new Date().setHours(23, 59, 59, 999).valueOf();
    if (this.startTime === startOfToday && this.endTime === endOfToday) {
      this.date = null;
      this.isDatePicker = true;
      this.deploymentService.getCountOfCurrentDeployments(this.clusterId, this.namespace).subscribe((response: IServerResponse<number>) => {
          if (response.data) {
            this.totalData = response.data;
          }
        },
        error => {
          this.snackBar.open(error.error.message, 'Close', { duration: 2000 });
        });
    } else {
      this.isDatePicker = false;
      this.deploymentService.getCountOfDeployments(this.clusterId, this.namespace, this.formatData(this.startTime).split(' ')[0], this.formatData(this.endTime).split(' ')[0]).subscribe((response: IServerResponse<number>) => {
          if (response.data) {
            this.totalData = response.data;
          }
        },
        error => {
          this.snackBar.open(error.error.message, 'Close', { duration: 2000 });
        });
    }
    this.getDeployments();
  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getDeployments();
  }

  getDeployments() {
    const startOfToday = new Date().setHours(0, 0, 0, 0).valueOf();
    const endOfToday = new Date().setHours(23, 59, 59, 999).valueOf();
    if (this.startTime === startOfToday && this.endTime === endOfToday) {
      this.date = null;
      this.isDatePicker = true;
      this.deploymentService.getAllDeployments(this.clusterId, this.namespace, this.limit, this.page, this.sort).subscribe((response: IServerResponse<IDeployment[]>) => {
          this.dataSource = new MatTableDataSource(response.data);
          this.dataSource.sort = this.sort;
        },
        error => {
          this.dataSource = new MatTableDataSource(error.data);
          this.dataSource.sort = this.sort;
          this.snackBar.open(error.error.message, 'Close', { duration: 2000 });
        });
    } else {
      this.isDatePicker = false;
      this.deploymentService.getAllDeploymentsBySelectedDate(this.clusterId, this.namespace,
        this.formatData(this.startTime).split(' ')[0], this.formatData(this.endTime).split(' ')[0], this.limit, this.page, this.sort).subscribe((response: IServerResponse<IDeployment[]>) => {
          this.dataSource = new MatTableDataSource(response.data);
          this.dataSource.sort = this.sort;
        },
        error => {
          this.dataSource = new MatTableDataSource(error.data);
          this.dataSource.sort = this.sort;
          this.snackBar.open(error.error.message, 'Close', { duration: 2000 });
        });
    }
  }

  clearDate(event) {
    event.stopPropagation();
    this.date = null;
    localStorage.removeItem('dateSearchTerm');
    this.getDeploymentsInfo(new Date());
    this.isDatePicker = true;
  }

  getK8sImages(row: IDeployment) {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'kubernetes-namespaces', this.namespace, 'deployments', row?.name, 'k8s-images']);
  }

  routePages(url: any) {
    this.router.navigate(url);
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('kubernetes_deployment_table_limit', String(limit));
  }
  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('kubernetes_deployment_table_limit');
  }
}
