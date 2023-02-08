import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { FormatDate } from '../../../../shared/format-date/format-date';
import { IClusterEvent } from '../../../../../core/entities/IClusterEvent';

@Component({
  selector: 'app-cluster-event',
  templateUrl: './cluster-event.component.html',
  styleUrls: ['./cluster-event.component.scss']
})
export class ClusterEventComponent implements OnInit {

  formatDate = FormatDate.formatClusterEventDetailsDate;

  constructor(private dialogRef: MatDialogRef<ClusterEventComponent>,
              @Inject(MAT_DIALOG_DATA) public data: IClusterEvent) {
  }

  ngOnInit(): void {
  }

  onClose() {
    this.dialogRef.close();
  }

}
