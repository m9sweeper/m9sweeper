import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GateKeeperService } from '../../../../../core/services/gate-keeper.service';
import { Observable } from 'rxjs';
import {IGateKeeperConstraint, IGateKeeperConstraintDetails} from '../../../../../core/entities/IGateKeeperConstraint';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';
import {MatSort} from '@angular/material/sort';
import {IGatekeeperTemplate} from '../../../../../core/entities/IGatekeeperTemplate';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {AddConstraintDialogComponent} from '../add-constraint-dialog/add-constraint-dialog.component';
import {MatLegacyPaginator as MatPaginator} from '@angular/material/legacy-paginator';

@Component({
  selector: 'app-gate-keeper',
  templateUrl: './gate-keeper.component.html',
  styleUrls: ['./gate-keeper.component.scss']
})
export class GateKeeperComponent implements OnInit {
  clusterId: number;
  gatekeeperConstraintTemplates$: Observable<IGateKeeperConstraintDetails[]>;
  gatekeeperTemplates: MatTableDataSource<IGateKeeperConstraintDetails>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns: string[] = ['name', 'category', 'description', 'constraints', 'enforced'];
  gatekeeperInstallationStatus: {status: boolean, message: string};
  gatekeeperStatusLoaded = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private gateKeeperService: GateKeeperService) {
    this.clusterId = +this.route.parent.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.checkGatekeeperStatus();
    this.gatekeeperConstraintTemplates$ = this.gateKeeperService.getGateKeeperConstraintTemplatesByCluster(this.clusterId);
    this.loadGateKeeperConstraintTemplates();
  }

  loadGateKeeperConstraintTemplates() {
    this.gateKeeperService.getGateKeeperConstraintTemplatesByCluster(this.clusterId).subscribe(data => {
      this.gatekeeperTemplates = new MatTableDataSource<IGateKeeperConstraintDetails>(data);
      this.gatekeeperTemplates.paginator = this.paginator;
    });
  }

  // viewConstraintDetails(constraint: IGateKeeperConstraint){
  //   this.router.navigate(['/private', 'clusters', this.clusterId, 'gatekeeper', constraint.name]);
  // }

  openInstallWizard(status: string) {
    if (status === 'install') {
      window.open('https://open-policy-agent.github.io/gatekeeper/website/docs/install/#installation', '_blank');
    }
    return null;
  }

  viewTemplateDetails(template: IGatekeeperTemplate) {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'gatekeeper', template.metadata.name]);
  }

  openAddConstraintDialog() {
    const openAddConstraint = this.dialog.open(AddConstraintDialogComponent, {
      width: '1000px',
      height: '800px',
      closeOnNavigation: true,
      disableClose: false,
      panelClass: ['remove-dialog-padding', 'example-toolbar'],
      data: {clusterId: this.clusterId}
    });

    openAddConstraint.afterClosed().subscribe(response => {
      console.log(response);
      if (response && !response.cancel) {
        this.loadGateKeeperConstraintTemplates();
        this.checkGatekeeperStatus();
      }
    });
  }

  checkGatekeeperStatus(){
    this.gateKeeperService.checkGatekeeperInstallationStatus(this.clusterId).subscribe(data => {
      this.gatekeeperStatusLoaded = true;
      this.gatekeeperInstallationStatus = data;
    });
  }

}
