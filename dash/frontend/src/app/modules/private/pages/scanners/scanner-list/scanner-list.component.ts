import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ScannerService } from '../../../../../core/services/scanner.service';
import { JwtAuthService } from '../../../../../core/services/jwt-auth.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { IScanner, ScannerData } from '../../../../../core/entities/IScanner';
import { IServerResponse } from '../../../../../core/entities/IServerResponse';
import { MatSort } from '@angular/material/sort';
import { ScannerCreateComponent } from '../scanner-create/scanner-create.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-scanner-list',
  templateUrl: './scanner-list.component.html',
  styleUrls: ['./scanner-list.component.scss']
})
export class ScannerListComponent implements OnInit {
  subMenuTitle = 'Scanner List';
  dataSource: MatTableDataSource<IScanner>;
  displayedColumns: string[] = ['tactive', 'trequired',  'id', 'name', 'type'];
  userId: number;
  scannerData: ScannerData[] = new Array();
  checkboxDefault = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() scannerIds: any;

  constructor(private scannerService: ScannerService,
              private jwtAuthService: JwtAuthService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    console.log('Scanner Ids', this.scannerIds);
    const loggedInUser = this.jwtAuthService.getCurrentUserData();
    this.userId = loggedInUser.id;
    // this.scannerService.getAllScannersByUserId(this.userId).subscribe((response: IServerResponse<IScanner[]>) => {
    //   if (response.data) {
    //     this.dataSource = new MatTableDataSource(response.data);
    //     this.dataSource.sort = this.sort;
    //   }
    // });
  }

  openAddScannerDialog() {
    const confirmDialog = this.dialog.open(ScannerCreateComponent, {
      width: '520px',
      closeOnNavigation: true,
      disableClose: true,
      data: {userId: this.userId}
    });
    confirmDialog.afterClosed().subscribe(result => {
      // this.getAllClusterByGroupId();
      // this.scannerService.getAllScannersByUserId(this.userId).subscribe(response => {
      //   this.dataSource = new MatTableDataSource(response.data);
      // });
    });
  }

  addScannerDataForActive(event, row) {
    const getScannerIds = this.scannerData.map(data => data.scannerId);
    if (getScannerIds.includes(row.id)) {
      const getObject = this.scannerData.filter(data => data.scannerId === row.id);
      const getIndex = this.scannerData.indexOf(getObject[0]);
      getObject[0].enabled = event.checked;
      if (getObject[0].required === false && getObject[0].enabled === false) {
        this.scannerData.splice(getIndex, 1);
      }
    }
    else {
      this.scannerData.push({scannerId: row.id, enabled: event.checked, required: false});
    }
    console.log(this.scannerData);
  }

  addScannerDataForRequired(event, row) {
    // for required
    const getScannerIds = this.scannerData.map(data => data.scannerId);
    if (getScannerIds.includes(row.id)) {
      const getObject = this.scannerData.filter(data => data.scannerId === row.id);
      const getIndex = this.scannerData.indexOf(getObject[0]);
      getObject[0].required = event.checked;
      if (getObject[0].required === false && getObject[0].enabled === false) {
        this.scannerData.splice(getIndex, 1);
      }
    }
    else {
      this.scannerData.push({scannerId: row.id, enabled: false, required: event.checked});
    }
    console.log(this.scannerData);
  }

}
