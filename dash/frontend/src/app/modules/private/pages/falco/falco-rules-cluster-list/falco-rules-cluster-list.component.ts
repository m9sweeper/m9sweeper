import {Component, Input, OnInit} from '@angular/core';
import {FalcoService} from '../../../../../core/services/falco.service';
import {take} from 'rxjs/operators';
import {IFalcoRule} from '../../../../../core/entities/IFalcoRule';

@Component({
  selector: 'app-falco-rules-cluster-list',
  templateUrl: './falco-rules-cluster-list.component.html',
  styleUrls: ['./falco-rules-cluster-list.component.scss']
})
export class FalcoRulesClusterListComponent implements OnInit {
  @Input() clusterId: number;

  rules: IFalcoRule[] = [];

  constructor(
    protected falcoService: FalcoService,
  ) { }

  ngOnInit(): void {
    this.falcoService.listRules({ clusterId: this.clusterId })
      .pipe(take(1))
      .subscribe({
        next: (resp) => this.rules = resp.data
      });
  }
}
