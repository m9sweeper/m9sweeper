import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@full-fledged/alerts';
import {ExceptionsService} from '../../../../../core/services/exceptions.service';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';
import {AlertDialogComponent} from '../../../../shared/alert-dialog/alert-dialog.component';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-policy-list',
  templateUrl: './exception-list.component.html',
  styleUrls: ['./exception-list.component.scss']
})
export class ExceptionListComponent implements OnInit {
  displayedColumns: string[] = ['title', 'status', 'start_date', 'end_date', 'edit', 'delete'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  subNavigationTitle: string;
  subNavigationButtonTitle: string;
  subNavigationButtonUrl: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private exceptionsService: ExceptionsService,
    private jwtAuthService: JwtAuthService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getExceptionList();
    this.subNavigationTitle = 'Exceptions';
    this.subNavigationButtonTitle = this.jwtAuthService.isAdmin() ?  'New Exception' : 'Request Exception';
    this.subNavigationButtonUrl = ['/private', 'exceptions', 'create'];
  }

  getExceptionList() {
    this.exceptionsService.getAllExceptions().subscribe((response: IServerResponse<any[]>) => {
      this.dataSource = new MatTableDataSource(response.data.map(row => {
        row.start_date = row.start_date ??  null;
        row.end_date = row.end_date ?? null;
        row.status = { review: 'In Review', inactive: 'Inactive', active: 'Active'}[row.status.toLowerCase()] || row.status;
        return row;
      }));
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }, error => {
      this.alertService.danger(error.error.message);
    });
  }

  deleteException($event: Event, id) {
      // stopPropagation() will discard the row click event that routes to the exception details.
      $event.stopPropagation();
      const confirmModal = this.dialog.open(AlertDialogComponent, {
        width: '400px',
        closeOnNavigation: true,
        disableClose: true
      });

      confirmModal.afterClosed().pipe(take(1))
        .subscribe({
          next: result => {
            if (result === true) {
              this.exceptionsService.deleteExceptionById(id).subscribe(
                _ => {
                  this.getExceptionList();
                  this.alertService.success('Exception deleted');
                },
                _ => this.alertService.danger('Something went wrong. Please try again later')
              );
            }
          }
        });
  }

  viewExceptionDetails(id: number) {
    this.router.navigate(['private', 'exceptions', id]);
  }
  // @TODO: server side pagination

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('exception_table_limit', String(limit));
  }
  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('exception_table_limit');
  }
}
