import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator} from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { AlertService } from 'src/app/core/services/alert.service';
import { DockerRegistriesCreateComponent } from '../docker-registries-create/docker-registries-create.component';
import { IServerResponse } from '../../../../../core/entities/IServerResponse';
import { DockerRegistriesService } from '../../../../../core/services/docker-registries.service';
import { JwtAuthService } from '../../../../../core/services/jwt-auth.service';
import { AlertDialogComponent } from '../../../../shared/alert-dialog/alert-dialog.component';
import { IDockerRegistries } from '../../../../../core/entities/IDockerRegistries';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-docker-registries-list',
  templateUrl: './docker-registries-list.component.html',
  styleUrls: ['./docker-registries-list.component.scss']
})
export class DockerRegistriesListComponent implements OnInit, AfterViewInit, OnDestroy {
  unsubscribe$ = new Subject<void>();
  subMenuTitle = 'All Docker Registries';
  displayedColumns: string[] = ['name', 'hostname', 'authType', 'username', 'edit', 'delete'];
  displayedColumnsNonAdmin: string[] = ['name', 'hostname', 'authType', 'username'];
  dataSource: MatTableDataSource<IDockerRegistries>;
  userId: number;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  subNavigationTitle: string;
  subNavigationButtonTitle: string;
  subNavigationButtonUrl: any;
  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 10;
  page = 0;
  totalCount = 0;
  data: IDockerRegistries[] = [];
  isAdmin: boolean;

  constructor(
    private dockerRegistriesService: DockerRegistriesService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private jwtAuthService: JwtAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isAdmin = this.jwtAuthService.isAdmin();
    if (!this.isAdmin) {
      this.displayedColumns = this.displayedColumnsNonAdmin;
    }
  }

  ngOnInit(): void {
    this.subNavigationTitle = 'Docker Registries';
    this.subNavigationButtonTitle = 'New Docker Registry';
    this.subNavigationButtonUrl = ['/private', 'docker-registries', 'create'];
    const loggedInUser = this.jwtAuthService.getCurrentUserData();
    this.userId = loggedInUser.id;
  }

  ngAfterViewInit() {
    merge(this.route.queryParams, this.sort.sortChange)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.getDockerRegistryList());
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getDockerRegistryList(){
    this.dockerRegistriesService.getAllDockerRegistries(this.page, this.limit, this.sort)
      .pipe(take(1))
      .subscribe((response: IServerResponse<{totalCount: number; list: IDockerRegistries[]}>) => {
        if (response.data){
          this.totalCount = response.data.totalCount;
          this.data = response.data.list;
          this.dataSource = new MatTableDataSource(this.data);
        }
      }, error => {
        this.alertService.danger(error.error.message);
      });
  }

  openDockerRegistryDialog(isEdit = false, dockerRegistryData?: IDockerRegistries) {
    const confirmDialog = this.dialog.open( DockerRegistriesCreateComponent, {
      width: '600px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: true,
      data: {
        isEdit,
        dockerRegistry: isEdit ? dockerRegistryData : null
      }
    });
    confirmDialog.afterClosed()
      .pipe(take(1))
      .subscribe(result => {
      if (result === undefined) {
        this.getDockerRegistryList();
      }
    });
  }

  pageEvent(pageEvent: any){
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getDockerRegistryList();
  }

  alertDeleteDockerRegistry(id: number) {
    const openAddDockerRegistry = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      closeOnNavigation: true,
      disableClose: true,
      data: {
        functionToRun: this.dockerRegistriesService.deleteDockerRegistryId(id),
        afterRoute: [],
        reload: true
      }
    });

    openAddDockerRegistry.afterClosed()
      .pipe(take(1))
      .subscribe(result => {
      this.router.navigate(['/private/docker-registries/']);
    });
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('docker_registry_table_limit', String(limit));
  }
  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('docker_registry_table_limit');
  }
}
