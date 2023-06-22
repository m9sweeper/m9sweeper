import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {FalcoRuleAddEditDialogComponent} from '../falco-rule-add-edit-dialog/falco-rule-add-edit-dialog.component';
import {IFalcoRule} from '../../../../../../core/entities/IFalcoRule';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-falco-rule',
  templateUrl: './falco-rule.component.html',
  styleUrls: ['./falco-rule.component.scss']
})
export class FalcoRuleComponent implements OnInit {

  rules: IFalcoRule[] = [];

  constructor(protected dialog: MatDialog) { }

  openAddEditModal(existingRuleIndex?: number) {
    const ref = this.dialog.open(FalcoRuleAddEditDialogComponent);
    ref.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: (data: { rule: IFalcoRule }) => {
          if (data?.rule) {
            if (existingRuleIndex) {
              this.rules[existingRuleIndex] = data.rule;
            } else {
              this.rules.push(data.rule);
            }
          }
        }
      });
  }

  removeRule(idx: number) {
    // Splice will remove the element and move other elements up.
    // It is slow for large arrays, but these arrays will likely not be large enough for that to be a concern
    this.rules.splice(idx, 1);
  }

  ngOnInit(): void {
  }

}
