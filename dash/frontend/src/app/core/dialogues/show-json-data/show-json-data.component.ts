import {Component, Inject, OnInit} from '@angular/core';
import { jsonToTableHtmlString } from 'json-table-converter';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-show-json-data',
  templateUrl: './show-json-data.component.html',
  styleUrls: ['./show-json-data.component.scss']
})
export class ShowJsonDataComponent implements OnInit {
  header: string;

  constructor(public dialogRef: MatDialogRef<ShowJsonDataComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {content: any, header: string}) { }

  ngOnInit(): void {
    this.header = this.data.header ? this.data.header : 'Json Data';
  }

  get tableHtml(): string {
    return jsonToTableHtmlString(this.data.content);
  }

  onClose() {
    this.dialogRef.close();
  }

}
