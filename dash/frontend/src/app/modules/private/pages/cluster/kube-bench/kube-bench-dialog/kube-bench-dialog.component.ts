import {Component, Inject, OnInit} from '@angular/core';
import {IKubeBenchReport} from '../../../../../../core/entities/IKubeBenchReport';
import {FormBuilder} from '@angular/forms';
import {KubeBenchService} from '../../../../../../core/services/kube-bench.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {CommonService} from '../../../../../../core/services/common.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-kube-bench-dialog',
  templateUrl: './kube-bench-dialog.component.html',
  styleUrls: ['./kube-bench-dialog.component.scss']
})

export class KubeBenchDialogComponent implements OnInit{
  selectedProvider = '';
  backendUrl: string;
  clusterId: number;
  report: IKubeBenchReport;
  environments: {name: string, value: string}[];
  cronjobOpt = true;
  cronjobTime = 'daily';
  cronjobScheduleOpts = {
    weekly: '0 0 * * 0',
    daily: '0 0 * * *',
    monthly: '0 0 1 * *'
  };
  nextButtonDisabled = true;
  apiKey: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { clusterId: number },
    private formBuilder: FormBuilder,
    private kubeBenchService: KubeBenchService,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.getConfigFileList();
    this.commonService.getBaseUrl().pipe(take(1)).subscribe(url => {
      this.backendUrl = url.data.baseUrl;
    });
    this.clusterId = this.data.clusterId;

    this.kubeBenchService.getKubeBenchApiKey().pipe(take(1)).subscribe({
      next: response => {
      this.apiKey = response[0]?.api;
    }
    });

  }

  getConfigFileList() {
    this.kubeBenchService.getConfigFileList()
      .pipe(take(1))
      .subscribe(rtrn => {
        this.environments = rtrn.data;
      });
  }

  // getConfigFileContents() {
  //   this.kubeBenchService.getConfigFileContents(this.selected)
  //     .pipe(take(1))
  //     .subscribe(rtrn => {
  //       const tempCLi = rtrn.data;
  //       this.cliCommand = tempCLi.replace('{SITE URL HERE}', this.backendUrl).replace('{CLUSTER ID ETC HERE}', String(this.clusterId));
  //     });
  // }

  /** Trims the '.yaml' off the end of filenames */
  trimYamlExtension(input: string) {
    return input.substring(0, input.length - 5);
  }

  proceedToNext($event) {
    console.log(this.selectedProvider);
    this.nextButtonDisabled = false;
  }
}
