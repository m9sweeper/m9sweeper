import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {KubeBenchService} from '../../../../../../core/services/kube-bench.service';
import {take} from 'rxjs/operators';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {IKubeBenchLog} from '../../../../../../core/entities/IKubeBenchReport';

@Component({
  selector: 'app-kube-bench-report-details',
  templateUrl: './kube-bench-report-details.component.html',
  styleUrls: ['./kube-bench-report-details.component.scss'],
})
export class KubeBenchReportDetailsComponent implements OnInit {
  id: number;
  report: IKubeBenchLog;

  constructor(
    private route: ActivatedRoute,
    private kubeBenchService: KubeBenchService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = +params.get('id');
    });
    this.kubeBenchService.getKubeBenchReportById(this.id)
      .pipe(take(1))
      .subscribe(rtrn => {
        console.log({rtrn});
        this.report = rtrn.resultsJson;
    });
  }
}
