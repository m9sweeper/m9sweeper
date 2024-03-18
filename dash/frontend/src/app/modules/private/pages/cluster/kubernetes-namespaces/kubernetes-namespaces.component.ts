import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {MatTableDataSource} from '@angular/material/table';
import {AlertService} from 'src/app/core/services/alert.service';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {NamespaceService} from '../../../../../core/services/namespace.service';
import {INamespace} from '../../../../../core/entities/INamespace';
import {FormatDate} from '../../../../shared/format-date/format-date';
import {filter, pairwise} from 'rxjs/operators';
import {merge} from 'rxjs';
import { ClusterService } from '../../../../../core/services/cluster.service';

@Component({
  selector: 'app-kubernetes-namespaces',
  templateUrl: './kubernetes-namespaces.component.html',
  styleUrls: [
    './kubernetes-namespaces.component.scss',
    '../../../../../app.component.scss',
  ]
})
export class KubernetesNamespacesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'pod', 'compliant'];
  dataSource: MatTableDataSource<INamespace>;
  clusterId: number;
  dateEvent: any;
  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 10;
  page = 0;
  totalData: number;
  startTime: number;
  endTime: number;
  browserTitle: string;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  formatData = FormatDate.formatLastScannedDate;
  formatDate = FormatDate;

  constructor(
    private titleService: Title,
    private clusterService: ClusterService,
    private namespaceService: NamespaceService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.route.parent.parent.params.subscribe(param => this.clusterId = param.id);
    this.getClusterById();
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        pairwise()
      )
      .subscribe((e: any[]) => {
        const previousUrl = e[0].url.split('/').includes('kubernetes-namespaces');
        if (previousUrl) {
          localStorage.setItem('k8sPreviousRoute', JSON.stringify(true));
        } else {
          localStorage.setItem('k8sPreviousRoute', JSON.stringify(false));
        }
      });
  }

  ngAfterViewInit() {
    merge(this.route.queryParams, this.sort.sortChange).subscribe(() => this.loadNamespaces());
  }

  getClusterById() {
    this.clusterService.getClusterById(this.clusterId).subscribe(response => {
      this.browserTitle = response.data.name;
      this.titleService.setTitle(this.browserTitle + ' ' + 'Namespaces');
    });
  }

  loadNamespaces() {
    const previousRoute = JSON.parse(localStorage.getItem('k8sPreviousRoute'));
    if (previousRoute) {
      if (localStorage.getItem('dateSearchTerm')) {
        this.dateEvent = new Date(Number(localStorage.getItem('dateSearchTerm')));
        this.getNamespacesInfo(this.dateEvent);
      } else {
        this.getNamespacesInfo(new Date());
      }
    } else {
      this.getNamespacesInfo(new Date());
    }
  }

  getNamespacesInfo(event) {
    // this.limit = 10;
    this.page = 0;
    let time = event ? (event.value ? new Date(event.value) : event) : new Date();
    if (time.desiredDate) { // from our time selector component
      time = time.desiredDate;
    }
    this.startTime = time.setHours(0, 0, 0, 0).valueOf();
    this.endTime = time.setHours(23, 59, 59, 999).valueOf();
    const startOfToday = new Date().setHours(0, 0, 0, 0).valueOf();
    const endOfToday = new Date().setHours(23, 59, 59, 999).valueOf();
    if (this.startTime === startOfToday && this.endTime === endOfToday) {
      localStorage.removeItem('dateSearchTerm');
      this.namespaceService.getCountOfCurrentNamespaces(this.clusterId).subscribe((response: IServerResponse<number>) => {
          if (response.data) {
            this.totalData = response.data;
          }
        },
        error => {
          this.alertService.danger(error.error.message);
        });
    } else {
      localStorage.setItem('dateSearchTerm', time.getTime());
      this.namespaceService.getCountOfNamespaces(this.clusterId, this.formatData(this.startTime).split(' ')[0], this.formatData(this.endTime).split(' ')[0]).subscribe((response: IServerResponse<number>) => {
          if (response.data) {
            this.totalData = response.data;
          }
        },
        error => {
          this.alertService.danger(error.error.message);
        });
    }
    this.getNamespaces();
  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getNamespaces();
  }

  getNamespaces() {
    const startOfToday = new Date().setHours(0, 0, 0, 0).valueOf();
    const endOfToday = new Date().setHours(23, 59, 59, 999).valueOf();
    if (this.startTime === startOfToday && this.endTime === endOfToday) {
      this.namespaceService.getAllK8sNamespaces(this.clusterId, this.limit, this.page, this.sort).subscribe((response: IServerResponse<INamespace[]>) => {
            this.dataSource = new MatTableDataSource(response.data);
            this.dataSource.sort = this.sort;
        },
        error => {
          this.dataSource = new MatTableDataSource(error.data);
          this.dataSource.sort = this.sort;
          this.alertService.danger(error.error.message);
        });
    } else {
      this.namespaceService.getAllNamespacesBySelectedDate(this.clusterId,
        this.formatData(this.startTime).split(' ')[0], this.formatData(this.endTime).split(' ')[0], this.limit, this.page, this.sort).subscribe((response: IServerResponse<INamespace[]>) => {
          this.dataSource = new MatTableDataSource(response.data || []);
          this.dataSource.sort = this.sort;
        },
        error => {
          this.dataSource = new MatTableDataSource(error.data);
          this.dataSource.sort = this.sort;
          this.alertService.danger(error.error.message);
        });
    }
  }

  getK8sDeployments(row: INamespace) {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'kubernetes-namespaces', row?.name, 'deployments']);
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('namespace_table_limit', String(limit));
  }
  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('namespace_table_limit');
  }

}
