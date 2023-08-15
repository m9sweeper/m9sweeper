import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GateKeeperService } from '../../../../../core/services/gate-keeper.service';
import {IGateKeeperConstraintDetails} from '../../../../../core/entities/IGateKeeperConstraint';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {IGatekeeperTemplate} from '../../../../../core/entities/IGatekeeperTemplate';
import {MatDialog} from '@angular/material/dialog';
import {AddConstraintDialogComponent} from '../add-constraint-dialog/add-constraint-dialog.component';
import {MatPaginator} from '@angular/material/paginator';
import {GateKeeperInstallWizardDialogComponent} from '../gate-keeper-install-wizard-dialog/gate-keeper-install-wizard-dialog.component';
import {take} from 'rxjs/operators';
import {IKubernetesObject} from '../../../../../core/entities/IKubernetesObjects';

@Component({
  selector: 'app-gate-keeper',
  templateUrl: './gate-keeper.component.html',
  styleUrls: ['./gate-keeper.component.scss']
})
export class GateKeeperComponent implements OnInit {
  clusterId: number;
  gatekeeperConstraintTemplates: IGateKeeperConstraintDetails[];
  gatekeeperTemplates: MatTableDataSource<IGateKeeperConstraintDetails>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns: string[] = ['name', 'description', 'constraints', 'enforced'];
  gatekeeperInstallationStatus: {status: boolean, message: string};
  gatekeeperStatusLoaded = false;
  gatekeeperInstallation: Partial<IKubernetesObject>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private gatekeeperService: GateKeeperService) {
    this.clusterId = +this.route.parent.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.loadGatekeeperInformation();
    this.loadGateKeeperConstraintTemplates();
  }

  loadGatekeeperInformation() {
    this.gatekeeperService.getGatekeeperInstallation(this.clusterId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          console.log('loadGatekeeperInformation', response);
          this.gatekeeperStatusLoaded = true;
          this.gatekeeperInstallationStatus = {
            message: response.message, status: response.status,
          };
          this.gatekeeperInstallation = response.data?.gatekeeperResource;
          this.setConstraintTemplates(response.data?.constraints);
        },
        error: err => {
          if (this.gatekeeperStatusLoaded) {
            this.setConstraintTemplates();
          }
        },
      });
  }

  setConstraintTemplates(constraintTemplates?: IGateKeeperConstraintDetails[]) {
    if (constraintTemplates) {
      this.gatekeeperTemplates = new MatTableDataSource<IGateKeeperConstraintDetails>(constraintTemplates);
      this.gatekeeperTemplates.paginator = this.paginator;
    } else {
      this.loadGateKeeperConstraintTemplates();
    }
  }

  loadGateKeeperConstraintTemplates() {
    this.gatekeeperService.getGateKeeperConstraintTemplatesByCluster(this.clusterId)
      .pipe(take(1))
      .subscribe({
        next: data => {
          this.gatekeeperConstraintTemplates = data;
          this.gatekeeperTemplates = new MatTableDataSource<IGateKeeperConstraintDetails>(data);
          this.gatekeeperTemplates.paginator = this.paginator;
        },
        error: err => {
          console.error(err);
          this.gatekeeperConstraintTemplates = null;
          this.gatekeeperTemplates = new MatTableDataSource<IGateKeeperConstraintDetails>([]);
          this.gatekeeperTemplates.paginator = this.paginator;
        }
      });
  }

  openInstallWizard() {
   this.dialog.open(GateKeeperInstallWizardDialogComponent, {
      maxWidth: '800px',
      maxHeight: '80vh',
      closeOnNavigation: true,
      disableClose: false,
      data: {
        clusterId: this.clusterId,
      }
    });
  }

  openAddConstraintDialog() {
    const openAddConstraint = this.dialog.open(AddConstraintDialogComponent, {
      width: '1000px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: {clusterId: this.clusterId}
    });

    openAddConstraint.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response && !response.cancel) {
            this.loadGatekeeperInformation();
          }
        }
      });
  }

}
