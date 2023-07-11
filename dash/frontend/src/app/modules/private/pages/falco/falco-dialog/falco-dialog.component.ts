import {Component, Inject, OnInit} from '@angular/core';
import {take} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CommonService} from '../../../../../core/services/common.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {FalcoService} from '../../../../../core/services/falco.service';

@Component({
  selector: 'app-falco-dialog',
  templateUrl: './falco-dialog.component.html',
  styleUrls: ['./falco-dialog.component.scss']
})
export class FalcoDialogComponent implements OnInit {

  backendUrl: string;
  clusterId: number;
  private unsubscribe$ = new Subject<void>();
  apiKey: string;
  level = 'Error';
  priorityLevels: string [] = ['', 'Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Informational', 'Debug'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { clusterId: number },
    private matDialogRef: MatDialogRef<FalcoDialogComponent>,
    private commonService: CommonService,
    private loaderService: NgxUiLoaderService,
    private falcoService: FalcoService,

  ) { }

  ngOnInit(): void {
    this.loaderService.start();
    this.commonService.getBaseUrl().pipe(take(1)).subscribe(url => {
      this.backendUrl = url.data.baseUrl;
      this.loaderService.stop();
    });
    this.clusterId = this.data.clusterId;
    this.falcoService.getFalcoApiKey().pipe(take(1)).subscribe({
      next: response => {
        this.apiKey = response.data[0]?.api;
      }
    });
  }
}
