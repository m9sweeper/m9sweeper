import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/core/services/alert.service';
import { IUser } from '../../../../../core/entities/IUser';
import { UserService } from '../../../../../core/services/user.service';
import { IServerResponse } from '../../../../../core/entities/IServerResponse';
import {merge} from 'rxjs';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})

export class UserListComponent implements OnInit, AfterViewInit {

  subMenuTitle = 'All Users';
  displayedColumns: string[] = ['id', 'first_name', 'last_name', 'email', 'phone', 'authorities', 'sourceSystem', 'actions'];
  dataSource: MatTableDataSource<IUser>;
  searchKey: string;
  subNavigationTitle: string;
  subNavigationButtonTitle: string;
  subNavigationButtonUrl: any;
  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 10;
  page = 0;
  totalCount = 0;
  data: IUser[] = [];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subNavigationTitle = 'All Users';
    this.subNavigationButtonTitle = 'Create User';
    this.subNavigationButtonUrl = ['/private', 'users', 'create'];
  }
  ngAfterViewInit() {
    merge(this.route.queryParams, this.sort.sortChange).subscribe(() => this.getUsersList());
  }

  getUsersList(): void {
    this.userService.getAllUsers(this.page, this.limit, this.sort)
      .subscribe((response: IServerResponse<{totalCount: number; list: IUser[]}>) => {
      this.data = response.data.list;
      this.dataSource = new MatTableDataSource(this.data);
      this.totalCount = response.data.totalCount;
      // this.dataSource.sort = this.sort;
      // this.dataSource.paginator = this.paginator;
    }, error => {
      this.alertService.danger('Failed to load user!');
    });
  }

  pageEvent(pageEvent: any){
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getUsersList();
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('user_table_limit', String(limit));
  }
  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('user_table_limit');
  }

}
