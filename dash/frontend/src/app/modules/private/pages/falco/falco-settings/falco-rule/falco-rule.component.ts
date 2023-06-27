import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {FalcoRuleAddEditDialogComponent} from '../falco-rule-add-edit-dialog/falco-rule-add-edit-dialog.component';
import {IFalcoRule} from '../../../../../../core/entities/IFalcoRule';
import {take} from 'rxjs/operators';
import {KubesecService} from '../../../../../../core/services/kubesec.service';
import {FalcoService} from '../../../../../../core/services/falco.service';
import {AlertService} from '@full-fledged/alerts';

@Component({
  selector: 'app-falco-rule',
  templateUrl: './falco-rule.component.html',
  styleUrls: ['./falco-rule.component.scss']
})
export class FalcoRuleComponent implements OnInit {
  @Input() clusterId: number;

  rules: IFalcoRule[] = [];
  namespaces: string[] = [];

  constructor(
    protected dialog: MatDialog,
    protected kubesecService: KubesecService,
    protected falcoService: FalcoService,
    protected alert: AlertService
  ) { }


  ngOnInit(): void {
    this.kubesecService.listNamespaces(this.clusterId)
      .pipe(take(1))
      .subscribe({
        next: (namespaces) => {
          this.namespaces = namespaces?.items?.map(itm => itm.metadata.name) || [];
        }
      });

    this.falcoService.listRules(this.clusterId)
      .pipe(take(1))
      .subscribe({
        next: (resp) => this.rules = resp.data
      });
  }

  openAddEditModal(existingRuleIndex?: number) {
    const ref = this.dialog.open(FalcoRuleAddEditDialogComponent, {
      data: {
        namespaces: this.namespaces,
        clusterId: this.clusterId,
        rule: !isNaN(existingRuleIndex) ? this.rules[existingRuleIndex] : undefined
      }
    });
    ref.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: (data: { rule: IFalcoRule }) => {
          if (data?.rule) {
            if (!isNaN(existingRuleIndex)) {
              this.rules[existingRuleIndex] = data.rule;
            } else {
              this.rules.push(data.rule);
            }
          }
        }
      });
  }

  removeRule(idx: number, ruleId: number) {
    this.falcoService.deleteRule(this.clusterId, ruleId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.alert.success('Rule deleted');
          // Splice will remove the element and move other elements up.
          // It is slow for large arrays, but these arrays will likely not be large enough for that to be a concern
          this.rules.splice(idx, 1);
        }
      });
  }
}
