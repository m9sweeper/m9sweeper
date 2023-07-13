import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { IPolicy } from '../../../../../core/entities/IPolicy';
import { PolicyService } from '../../../../../core/services/policy.service';
import { AlertService } from '@full-fledged/alerts';
import { IServerResponse } from '../../../../../core/entities/IServerResponse';
import { PolicyCreateComponent } from '../policy-create/policy-create.component';
import {merge} from 'rxjs';
import {AlertDialogComponent} from '../../../../shared/alert-dialog/alert-dialog.component';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-policy-list',
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.scss']
})
export class PolicyListComponent implements OnInit, AfterViewInit{
  subMenuTitle = 'All Policies';
  displayedColumns: string[] = ['name', 'description', 'new_scan_grace_period', 'rescan_grace_period', 'actions'];
  dataSource: MatTableDataSource<IPolicy>;
  clusterId: number;
  subNavigationData: any;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  subNavigationTitle: string;
  subNavigationButtonTitle: string;
  subNavigationButtonUrl: any;

  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 10;
  page = 0;
  totalCount = 0;
  data: IPolicy[] = [];

  constructor(
    private policyService: PolicyService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.subNavigationTitle = 'Policies';
    this.subNavigationButtonTitle = 'New Policy';
    this.subNavigationButtonUrl = ['/private', 'policies', 'create'];
  }
  ngAfterViewInit() {
    merge(this.route.queryParams, this.sort.sortChange).subscribe(() => this.getPolicyList());
  }

  pageEvent(pageEvent: any){
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getPolicyList();
  }

  getPolicyList(): void {
    this.dataSource = null;
    this.policyService.getAllPolicies(this.page, this.limit, this.sort)
      .subscribe((response: IServerResponse<{totalCount: number, list: IPolicy[]}>) => {
        this.totalCount = response.data.totalCount;
        this.dataSource = new MatTableDataSource(response.data.list);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }, error => {
      this.alertService.danger(error.error.message);
    });
  }

  alertDeletePolicy(id: number) {
    const openRemoveDialog = this.dialog.open(AlertDialogComponent , {
      width: '400px',
      closeOnNavigation: true,
      disableClose: true
    });

    openRemoveDialog.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: result => {
          if (result === true) {
            this.deletePolicyById(id);
          }
        }
      });
  }

  deletePolicyById(id: number){
    this.policyService.deletePolicyById(id).subscribe(() => {
        this.alertService.success('Policy deleted successfully');
    }, error => {
      this.alertService.danger(error.error.message);
    }, () => {
      this.getPolicyList();
    });
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('policy_table_limit', String(limit));
  }
  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('policy_table_limit');
  }
}
