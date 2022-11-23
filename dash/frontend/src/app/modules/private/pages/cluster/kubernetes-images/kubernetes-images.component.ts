import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {MatTableDataSource} from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import {AlertService} from '@full-fledged/alerts';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {K8sImageService} from '../../../../../core/services/k8s-image.service';
import {IK8sImage} from '../../../../../core/entities/IK8sImage';
import {filter, pairwise} from 'rxjs/operators';
import {merge} from 'rxjs';
import {FormatDate} from '../../../../shared/format-date/format-date';

@Component({
  selector: 'app-kubernetes-images',
  templateUrl: './kubernetes-images.component.html',
  styleUrls: ['./kubernetes-images.component.scss']
})
export class KubernetesImagesComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['name', 'deploymentName', 'namespace', 'compliant'];
  dataSource: MatTableDataSource<IK8sImage>;
  clusterId: number;
  deploymentName: string;
  namespaceName: string;
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
              private k8sImageService: K8sImageService,
              private route: ActivatedRoute,
              private router: Router,
              private alertService: AlertService
  ) {
  }

  date = new Date();

  ngOnInit(): void {
    this.route.parent.params.subscribe(param => {
      this.clusterId = param.id;
    });
    this.route.params.subscribe(routeParams => {
      this.namespaceName = routeParams.namespace;
      this.deploymentName = routeParams.deployment;
      this.titleService.setTitle(this.deploymentName + ' ' + 'images');
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
    merge(this.route.queryParams, this.sort.sortChange).subscribe(() => this.loadK8sImages());
  }

  loadK8sImages() {
    const previousRoute = JSON.parse(localStorage.getItem('k8sPreviousRoute'));
    if (previousRoute) {
      if (localStorage.getItem('dateSearchTerm')) {
        this.dateEvent = new Date(Number(localStorage.getItem('dateSearchTerm')));
        this.date = this.dateEvent;
        this.getK8sImagesInfo(this.dateEvent);
      } else {
        this.getK8sImagesInfo(new Date());
      }
    } else {
      localStorage.removeItem('dateSearchTerm');
      this.getK8sImagesInfo(new Date());
    }
  }

  searchK8sImagesByDate(dateEvent) {
    this.getK8sImagesInfo(dateEvent);
  }

  getK8sImagesInfo(event) {
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
      this.k8sImageService.getCountOfCurrentImages(this.clusterId, this.namespaceName, this.deploymentName).subscribe((response: IServerResponse<number>) => {
          if (response.data) {
            this.totalData = response.data;
          }
        },
        error => {
          this.alertService.danger(error.error.message);
        });
    } else {
      this.isDatePicker = false;
      this.k8sImageService.getCountOfImages(this.clusterId, this.namespaceName, this.deploymentName, this.formatData(this.startTime).split(' ')[0], this.formatData(this.endTime).split(' ')[0]).subscribe((response: IServerResponse<number>) => {
          if (response.data) {
            this.totalData = response.data;
          }
        },
        error => {
          this.alertService.danger(error.error.message);
        });
    }
    this.getK8sImages();
  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getK8sImages();
  }

  getK8sImages() {
    const startOfToday = new Date().setHours(0, 0, 0, 0).valueOf();
    const endOfToday = new Date().setHours(23, 59, 59, 999).valueOf();
    if (this.startTime === startOfToday && this.endTime === endOfToday) {
      this.date = null;
      this.isDatePicker = true;
      this.k8sImageService.getAllImages(this.clusterId, this.namespaceName, this.deploymentName, this.limit, this.page, this.sort)
        .subscribe((response: IServerResponse<IK8sImage[]>) => {
            this.dataSource = new MatTableDataSource(response.data);
            this.dataSource.sort = this.sort;
          },
          error => {
            this.dataSource = new MatTableDataSource(error.data);
            this.alertService.danger(error.error.message);
          });
    } else {
      this.isDatePicker = false;
      this.k8sImageService.getAllK8sImagesBySelectedDate(this.clusterId, this.namespaceName, this.deploymentName, this.formatData(this.startTime).split(' ')[0], this.formatData(this.endTime).split(' ')[0], this.limit, this.page, this.sort)
        .subscribe((response: IServerResponse<IK8sImage[]>) => {
            this.dataSource = new MatTableDataSource(response.data);
            this.dataSource.sort = this.sort;
          },
          error => {
            this.dataSource = new MatTableDataSource(error.data);
            this.alertService.danger(error.error.message);
          });
    }
  }

  clearDate(event) {
    event.stopPropagation();
    this.date = null;
    localStorage.removeItem('dateSearchTerm');
    this.isDatePicker = true;
    this.getK8sImagesInfo(new Date());
  }

  routePages(url: any) {
    this.router.navigate(url);
  }

  getImageScannerDetails(row: IK8sImage) {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'images', 'image-scan', row.imageId]);
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('kubernetes_image_table_limit', String(limit));
  }
  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('kubernetes_image_table_limit');
  }
}
