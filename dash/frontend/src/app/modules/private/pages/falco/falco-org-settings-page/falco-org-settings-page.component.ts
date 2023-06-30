import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {KubesecService} from '../../../../../core/services/kubesec.service';
import {FalcoService} from '../../../../../core/services/falco.service';
import {AlertService} from '@full-fledged/alerts';
import {take} from 'rxjs/operators';
import {
  FalcoRuleAddEditDialogComponent
} from '../falco-settings/falco-rule-add-edit-dialog/falco-rule-add-edit-dialog.component';
import {IFalcoRule} from '../../../../../core/entities/IFalcoRule';

@Component({
  selector: 'app-falco-org-settings-page',
  templateUrl: './falco-org-settings-page.component.html',
  styleUrls: ['./falco-org-settings-page.component.scss']
})
export class FalcoOrgSettingsPageComponent implements OnInit {
  rules = [];

  constructor(
    protected dialog: MatDialog,
    protected kubesecService: KubesecService,
    protected falcoService: FalcoService,
    protected alert: AlertService
  ) { }

  ngOnInit(): void {
    this.falcoService.listRules()
      .pipe(take(1))
      .subscribe({
        next: (resp) => this.rules = resp.data || []
      });
  }

  openAddEditModal(rule?: IFalcoRule, existingRuleIndex?: number) {
    console.log('opening modal');
    const ref = this.dialog.open(FalcoRuleAddEditDialogComponent, {
      data: {
        rule
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

  removeRule(ruleId: number, idx: number) {
    this.falcoService.deleteRule(ruleId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.alert.success('Rule deleted');
          // Splice will remove the element and move other elements up.
          // It is slow for large arrays, but these arrays will likely not be large enough for that to be a concern
          this.rules.splice(idx, 1);
        },
        error: (err) => {
          this.alert.danger(err?.error?.metadata || 'Something went wrong.');
        }
      });
  }

  /**
   * Joins the array elements together in a comma separated list
   * If a value for key is provided, will instead use only the value of the provided key
   */
  beautifyArray(array: string[] | any[], options?: { key?: string, elements?: number}) {
    if (options?.elements > 0) {
      array = array.slice(0, options.elements);
    }
    return array
      .map((el) => options?.key ? el[options.key] : el)
      .join(', ');
  }
}