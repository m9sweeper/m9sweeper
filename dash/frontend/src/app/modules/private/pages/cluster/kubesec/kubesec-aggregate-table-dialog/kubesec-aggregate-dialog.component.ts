import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {KubesecDialogComponent} from '../kubesec-dialog/kubesec-dialog.component';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-kubesec-aggregate-dialog',
  templateUrl: './kubesec-aggregate-dialog.component.html',
  styleUrls: ['./kubesec-aggregate-dialog.component.scss']
})
export class KubesecAggregateDialogComponent implements OnInit {

  displayedColumns: string[] = ['podNames', 'score'];
  dataSource: MatTableDataSource<any>;

  constructor(@Inject(MAT_DIALOG_DATA) public kubesecReport,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.populateTable();
  }

  populateTable() {
    const dataAsArray = [];
    dataAsArray.push(this.kubesecReport);
    this.dataSource = new MatTableDataSource<any>(dataAsArray);
  }

  clickEvent() {
    this.dialog.open(KubesecDialogComponent, {
      width: '1000px',
      height: '80%',
      closeOnNavigation: true,
      disableClose: false,
      data: this.kubesecReport,
    });
  }
}
