import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {KubesecService} from '../../../../../core/services/kubesec.service';
import {FalcoService} from '../../../../../core/services/falco.service';
import {AlertService} from '@full-fledged/alerts';
import {take} from 'rxjs/operators';
import {
  FalcoRuleAddEditDialogComponent
} from '../falco-rule-add-edit-dialog/falco-rule-add-edit-dialog.component';
import {IFalcoRule} from '../../../../../core/entities/IFalcoRule';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';

@Component({
  selector: 'app-falco-org-settings-page',
  templateUrl: './falco-org-settings-page.component.html',
  styleUrls: ['./falco-org-settings-page.component.scss']
})
export class FalcoOrgSettingsPageComponent implements OnInit {
  rules = [];
  isAdmin = false;

  constructor(
    protected dialog: MatDialog,
    protected kubesecService: KubesecService,
    protected falcoService: FalcoService,
    protected alert: AlertService,
    private jwtAuthService: JwtAuthService,
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.jwtAuthService.isAdmin();
    this.falcoService.listRules()
      .pipe(take(1))
      .subscribe({
        next: (resp) => this.rules = resp.data || []
      });
  }

  openAddEditModal(rule?: IFalcoRule, existingRuleIndex?: number) {
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
}
