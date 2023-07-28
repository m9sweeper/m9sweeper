import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {FalcoService} from '../../../../../core/services/falco.service';
import { MatTableDataSource } from '@angular/material/table';
import {IFalcoLog} from '../../../../../core/entities/IFalcoLog';
import {take} from 'rxjs/operators';
import {UtilService} from '../../../../../core/services/util.service';
import {MatTab} from '@angular/material/tabs';


@Component({
  selector: 'app-falco-json-data-dialog',
  templateUrl: './falco-json-data-dialog.component.html',
  styleUrls: ['./falco-json-data-dialog.component.scss']
})
export class FalcoJsonDataDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<FalcoJsonDataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IFalcoLog,
    private route: ActivatedRoute,
    private router: Router,
    private falcoService: FalcoService,
    private dialog: MatDialog,
  ) {}

  eventDetails = new MatTableDataSource( [
    {
      title: 'Namespace',
      value: this.data.namespace,
    },
    {
      title: 'Date',
      value: new Date(+(this.data.timestamp)),
    },
    {
      title: 'Pod',
      value: this.data.container,
    },
    {
      title: 'Image',
      value: this.data.image,
    },
    {
      title: 'Priority',
      value: this.data.raw.priority,
    },
    {
      title: 'Message',
      value: this.data.message,
    },
    {
      title: 'Signature',
      value: this.data.anomalySignature,
    },
  ]);

  displayEventDetails(event: IFalcoLog){
    this.dialogRef.close();
    this.dialogRef = this.dialog.open(FalcoJsonDataDialogComponent, {
      width: 'auto',
      height: '100%',
      autoFocus: false,
      data: event
    });
  }

}
