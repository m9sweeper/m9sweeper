import {Component, Inject, OnInit} from '@angular/core';
import {take} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {CommonService} from '../../../../../core/services/common.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {KubeHunterService} from '../../../../../core/services/kube-hunter.service';
import {AlertService} from '@full-fledged/alerts';
import {Router} from '@angular/router';
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
