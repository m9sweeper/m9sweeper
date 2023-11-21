import {Component, OnInit} from '@angular/core';
import {ReportsService} from '../../../../../core/services/reports.service';
import {take} from 'rxjs/operators';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ICluster} from '../../../../../core/entities/ICluster';
import {ClusterService} from '../../../../../core/services/cluster.service';
import {ActivatedRoute} from '@angular/router';
import {NamespaceService} from '../../../../../core/services/namespace.service';
import {SelectOptionDisplaySetting} from '../../../../../core/types/select-option-display-setting';
import {SecurityAuditReportTools} from '../../../../../core/enum/SecurityAuditReportTools';
import {AlertService} from '../../../../../core/services/alert.service';

@Component({
  selector: 'app-security-audit-report',
  templateUrl: './security-audit-report.component.html',
  styleUrls: ['./security-audit-report.component.scss']
})
export class SecurityAuditReportComponent implements OnInit {
  settingsForm: FormGroup;
  clusters: ICluster[] = [];
  visibleNamespaces: string[] = [];
  /** A map of all namespaces and the clusterIds they are in */
  namespaceMap: Record<string, number[]> = {};

  clustersLoaded = false;
  namespacesLoaded = false;
  submitting = false;

  toolOptions: SelectOptionDisplaySetting<SecurityAuditReportTools>[] = [
    {
      displayName: 'Trivy',
      value: SecurityAuditReportTools.TRIVY
    },
    {
      displayName: 'Kubesec',
      value: SecurityAuditReportTools.KUBESEC
    },
    {
      displayName: 'kube-hunter',
      value: SecurityAuditReportTools.KUBEHUNTER
    }
  ];

  constructor(
    protected readonly reportsService: ReportsService,
    protected readonly fb: FormBuilder,
    protected readonly clusterService: ClusterService,
    protected readonly activeRoute: ActivatedRoute,
    protected readonly namespaceService: NamespaceService,
    protected readonly alertService: AlertService,
  ) {}

  ngOnInit() {
    const defaultClusterId = +this.activeRoute.parent.parent.snapshot.params.id;
    this.settingsForm = this.fb.group({
      clusterIds: [[defaultClusterId], []],
      namespaces: [[], []],
      tools: [[], []]
    });

    this.clusterService.getAllClusters()
      .pipe(take(1))
      .subscribe({
        next: (resp) => {
          this.clusters = resp?.data;
          this.clustersLoaded = true;
        }
      });

    this.namespaceService.getCurrentK8sNamespaces()
      .pipe(take(1))
      .subscribe({
        next: val => {
          val.data.push({ name: 'test', clusterId: 4} as any);
          for (const ns of val?.data) {
            if (this.namespaceMap[ns.name]) {
              this.namespaceMap[ns.name].push(ns.clusterId);
            } else {
              this.namespaceMap[ns.name] = [ns.clusterId];
            }
          }
          this.updateVisibleNamespaces();
          this.namespacesLoaded = true;
        }
      });
  }

  updateVisibleNamespaces() {
    const namespaces = Object.keys(this.namespaceMap);
    const selectedClusterIds = this.settingsForm.controls.clusterIds.value as number[];
    if (selectedClusterIds?.length === 0) {
      this.visibleNamespaces = namespaces;
    } else {
      this.visibleNamespaces = namespaces.filter(ns => selectedClusterIds.some(id => this.namespaceMap[ns].includes(id)));
    }
  }

  generatePDF() {
    this.submitting = true;
    this.reportsService.generateSimpleSecurityAuditReport(this.settingsForm.getRawValue()).pipe(take(1))
      .subscribe({
        next: res => {
          // Creates a temporary anchor tag, and uses it to download the pdf
          const blob = new Blob([res], { type: 'application/pdf' });
          const pdfUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = `${Date.now()}-security-audit-report.pdf`;
          link.click();
        },
        error: () => {
          this.submitting = false;
          this.alertService.danger('Report could not be generated.');
        },
        complete: () => {
          this.submitting = false;
        }
      });
  }

}
