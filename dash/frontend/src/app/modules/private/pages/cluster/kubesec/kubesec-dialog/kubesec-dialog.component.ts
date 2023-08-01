import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-kubesec-dialog',
  templateUrl: './kubesec-dialog.component.html',
  styleUrls: ['./kubesec-dialog.component.scss']
})
export class KubesecDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public kubesecReport,
    private loaderService: NgxUiLoaderService,
  ) {}

  ngOnInit(): void {
    this.loaderService.start();
  }
}
