import { Component } from '@angular/core';

export interface GatekeeperVersionRow {
  k8sVersion: string;
  gatekeeperVersion: string;
}

const VERSION_DATA: GatekeeperVersionRow[] = [
  { k8sVersion: 'v1.24.x - v1.27.x', gatekeeperVersion: 'v3.12.0' },
  { k8sVersion: 'v1.22.x - v1.23.x', gatekeeperVersion: 'v3.11.0' },
  { k8sVersion: 'v1.21.x', gatekeeperVersion: 'v3.10.0' },
  { k8sVersion: 'v1.19.x - v1.20.x', gatekeeperVersion: 'v3.9.2' },
  { k8sVersion: 'v1.16.x - v1.18.x', gatekeeperVersion: 'v3.7.2' }
];

@Component({
  selector: 'app-gate-keeper-install-wizard-dialog',
  templateUrl: './gate-keeper-install-wizard-dialog.component.html',
  styleUrls: ['./gate-keeper-install-wizard-dialog.component.scss'],
})
export class GateKeeperInstallWizardDialogComponent {
  displayedColumns: string[] = ['k8sVersion', 'gatekeeperVersion'];
  dataSource = VERSION_DATA;
}
