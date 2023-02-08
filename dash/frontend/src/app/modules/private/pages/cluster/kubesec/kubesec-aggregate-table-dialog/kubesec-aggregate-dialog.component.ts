import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {KubesecDialogComponent} from '../kubesec-dialog/kubesec-dialog.component';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';

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
