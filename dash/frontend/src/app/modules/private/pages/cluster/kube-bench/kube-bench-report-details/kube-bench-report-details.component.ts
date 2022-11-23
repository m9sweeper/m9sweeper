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
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
    transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
])
  ]
})
export class KubeBenchReportDetailsComponent implements OnInit {

  displayedColumns = ['test', 'description', 'pass/fail'];
  id: number;
  expandedElement: any | null;
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
        this.report = rtrn.resultsJson;
    });
  }
}
