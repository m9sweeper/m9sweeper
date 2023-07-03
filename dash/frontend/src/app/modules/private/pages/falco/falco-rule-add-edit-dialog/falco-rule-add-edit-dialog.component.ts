import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FalcoRuleAction} from '../../../../../core/enum/FalcoRuleAction';
import {CustomValidatorService} from '../../../../../core/services/custom-validator.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {IFalcoRule} from '../../../../../core/entities/IFalcoRule';
import {FalcoService} from '../../../../../core/services/falco.service';
import {AlertService} from '@full-fledged/alerts';
import {switchMap, take} from 'rxjs/operators';
import {ClusterService} from '../../../../../core/services/cluster.service';
import {NamespaceService} from '../../../../../core/services/namespace.service';
import {ICluster} from '../../../../../core/entities/ICluster';
import {forkJoin, of} from 'rxjs';

@Component({
  selector: 'app-falco-rule-add-edit-dialog',
  templateUrl: './falco-rule-add-edit-dialog.component.html',
  styleUrls: ['./falco-rule-add-edit-dialog.component.scss']
})
export class FalcoRuleAddEditDialogComponent implements OnInit {

  ruleForm: FormGroup;
  namespaces: string[] = [];
  clusters: ICluster[];
  namespaceClusterMap = new Map<number, string[]>();
  actionOptions = [
    {
      displayName: 'Ignore',
      value: FalcoRuleAction.Ignore
    },
    {
      displayName: 'Silence',
      value: FalcoRuleAction.Silence
    },
  ];

  editMode = false;
  constructor(
    protected fb: FormBuilder,
    protected customValidators: CustomValidatorService,
    protected dialogRef: MatDialogRef<FalcoRuleAddEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected data: { rule: IFalcoRule },
    protected falcoService: FalcoService,
    protected alert: AlertService,
    protected clusterService: ClusterService,
    protected namespaceService: NamespaceService
  ) { }

  ngOnInit(): void {
    this.editMode = !!this.data?.rule?.id;

    const selectedClusters = this.data?.rule?.clusters
      ? this.data.rule.clusters.map(c => c.clusterId) : [];

    const selectedNamespaces = this.data?.rule?.clusters
      ? this.data.rule.namespaces.map(ns => ns.namespace) : [];

    this.ruleForm = this.fb.group({
      id: [this.data?.rule?.id || ''],
      clusters: [selectedClusters],
      action: [this.data?.rule?.action || FalcoRuleAction.Ignore, [Validators.required]],
      namespaces: [selectedNamespaces],
      falcoRule: [this.data?.rule?.falcoRule || '', [this.customValidators.regex]],
      image: [this.data?.rule?.image || '', [this.customValidators.regex]],
    }, {
      validators: [this.customValidators.atLeastOne([
        { key: 'namespaces', condition: (ns: string[]) => !!ns?.length},
        { key: 'clusters', condition: (clusters: string[]) => !!clusters?.length},
        { key: 'falcoRule', condition: (rule: string) => !!rule},
        { key: 'image', condition: (image: string) => !!image}
        ]),
      ]});

    const clusterInit$ = this.clusterService.getAllClusters()
      .pipe(
        take(1),
        switchMap(resp => this.clusters = resp.data)
      );

    const namespaceInit$ = this.namespaceService.getCurrentK8sNamespaces()
      .pipe(
        take(1),
        switchMap(resp => {
          resp.data.forEach((ns) => {
            const namespacesInCluster = this.namespaceClusterMap.get(ns.clusterId);
            if (namespacesInCluster) {
              namespacesInCluster.push(ns.name);
            } else {
              this.namespaceClusterMap.set(ns.clusterId, [ns.name]);
            }
          });
          console.log(this.namespaceClusterMap);
          return of(this.namespaceClusterMap);
        })
      );

    forkJoin([namespaceInit$, clusterInit$])
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.setVisibleNamespaces();
        }
      });
  }

  setVisibleNamespaces() {
    // Get the list of all applicable cluster ids
    let keys;
    if (this.ruleForm.controls.clusters.value?.length) {
      // If we have any cluster(s) selected, get their keys
      keys = this.ruleForm.controls.clusters.value.map(id => +id);
    } else {
      // No cluster selected, get every namespace
      keys = this.namespaceClusterMap.keys();
    }

    // Put all namespaces associated with an appropriate cluster into the set
    const set = new Set<string>();
    for (const key of keys) {
      const namespaces = this.namespaceClusterMap.get(key);
      namespaces.forEach(ns => set.add(ns));
    }
    // Add any already selected namespaces to the list
    if (this.ruleForm.controls.namespaces.value) {
      this.ruleForm.controls.namespaces.value.forEach(ns => set.add(ns));
    }
    this.namespaces = Array.from(set).sort();
  }

  save() {
    const rule = this.ruleForm.getRawValue();
    const request = this.editMode
    ? this.falcoService.updateRule(rule)
      : this.falcoService.createRule(rule);

    request
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.alert.success(`Rule successfully ${this.editMode ? 'updated' : 'created'}!`);
          this.dialogRef.close({ rule: res?.data });
        },
        error: err => {
          this.alert.danger(err?.error?.message || 'Something went wrong');
        }
      });

  }

}
