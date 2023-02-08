import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { IImageScanResultIssue } from '../../../../../core/entities/IImageScanResultIssue';

@Component({
  selector: 'app-image-issue-more-data-dialog',
  templateUrl: './image-issue-more-data-dialog.component.html',
  styleUrls: ['./image-issue-more-data-dialog.component.scss']
})
export class ImageIssueMoreDataDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ImageIssueMoreDataDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {issue: IImageScanResultIssue}) { }

  ngOnInit(): void {
  }

  onClose() {
    this.dialogRef.close();
  }

}
