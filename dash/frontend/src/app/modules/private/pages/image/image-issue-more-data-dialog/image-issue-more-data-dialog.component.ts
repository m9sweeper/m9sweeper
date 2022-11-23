import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { jsonToTableHtmlString } from 'json-table-converter';
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

  get tableHtml(): string {
    return jsonToTableHtmlString(this.data.issue.extraData);
  }

  onClose() {
    this.dialogRef.close();
  }

}
