import { Component, OnInit } from '@angular/core';
import { GateKeeperService } from '../../../../../core/services/gate-keeper.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatTableDataSource} from '@angular/material/table';
import {IGateKeeperConstraintDetails} from '../../../../../core/entities/IGateKeeperConstraint';
import {AlertDialogComponent} from '../../../../shared/alert-dialog/alert-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {AlertService} from '../../../../../core/services/alert.service';
import {AddCustomConstraintTemplateComponent} from '../add-custom-constraint-template/add-custom-constraint-template.component';
import {AddTemplateConstraintComponent} from '../add-template-constraint/add-template-constraint.component';
import {GatekeeperViolationDialogComponent} from '../gatekeeper-violation-dialog/gatekeeper-violation-dialog.component';
import {take} from 'rxjs/operators';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';
import {GatekeeperService} from '../../../../../core/services/gatekeeper.service';
import {IGatekeeperConstraint, IGatekeeperConstraintTemplate} from '../../../../../core/entities/gatekeeper';

@Component({
  selector: 'app-gate-keeper-details',
  templateUrl: './gate-keeper-details.component.html',
  styleUrls: ['./gate-keeper-details.component.scss']
})
export class GateKeeperDetailsComponent implements OnInit {
  gatekeeperTemplate: IGatekeeperConstraintTemplate;
  constraintCount: number;
  isMobileDevice = false;
  clusterId: number;
  templateName: string;
  constraintsList: MatTableDataSource<IGatekeeperConstraint>;
  displayedColumns: string[];
  rawTemplate: any;
  openapiProperties = [];
  openApiSchema: any;

  constructor(
    private readonly gateKeeperService: GateKeeperService,
    private readonly gatekeeperService: GatekeeperService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private alertService: AlertService,
    private router: Router,
    private jwtAuthService: JwtAuthService,
  ) {
    this.clusterId = +this.route.parent.snapshot.paramMap.get('id');
    this.templateName = this.route.snapshot.paramMap.get('templateName');
  }

  ngOnInit(): void {
    this.getConstraintTemplateDetails();
    if (this.jwtAuthService.isAdmin()) {
      this.displayedColumns = ['name', 'description', 'mode', 'action', 'violations'];
    } else {
      this.displayedColumns = ['name', 'description', 'mode', 'violations'];
    }
  }

  getConstraintTemplateDetails(excludeConstraints = false) {
    this.gatekeeperService.getConstraintTemplateByName(this.clusterId, this.templateName, excludeConstraints).subscribe(data => {
      this.gatekeeperTemplate = data.template;

      this.constraintCount = data.associatedConstraints.length ?? 0;
      this.constraintsList = new MatTableDataSource<IGatekeeperConstraint>(data.associatedConstraints);

      this.rawTemplate = data.rawConstraintTemplate;
      this.updateRawConstraintTemplateProperties();
    });
  }

  updateRawConstraintTemplateProperties() {
    const tempData = JSON.parse(this.rawTemplate);
    const tempProperties = tempData.spec.crd.spec.validation.openAPIV3Schema ? tempData.spec.crd.spec.validation.openAPIV3Schema.properties : {};
    this.openApiSchema = tempProperties;
    const propertyKeys = Object.keys(tempProperties);
    for (const key of propertyKeys) {
      this.openapiProperties.push([key, tempProperties[key].type]);
    }
  }

  destroyConstraintTemplate() {
    const openDestroyTemplateDialog = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      closeOnNavigation: true,
      disableClose: true,
      data: {
        functionToRun: this.gateKeeperService.destroyConstraintTemplate(this.clusterId, this.templateName),
        afterRoute: [],
        returnResult: true
      }
    });

    openDestroyTemplateDialog.afterClosed()
      .pipe(take(1))
      .subscribe(response => {
        if (response === true) {
          this.router.navigate([`private/clusters/${this.clusterId}/gatekeeper`]);
        }
    });
  }

  editRawTemplate() {
    const rawTemplate = this.dialog.open(AddCustomConstraintTemplateComponent, {
      width: '1000px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: {clusterId: this.clusterId, subDir: this.templateName, templateContent: this.rawTemplate, referer: 'gate-keeper-details'}
    });

    rawTemplate.afterClosed()
      .pipe(take(1))
      .subscribe(response => {
        this.getConstraintTemplateDetails(true);
    });
  }

  openAddConstraintTemplate() {
    const openAddConstraintTemplate = this.dialog.open(AddTemplateConstraintComponent, {
      width: '1000px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: { clusterId: this.clusterId, templateName: this.templateName, templateSpecKind: this.gatekeeperTemplate.spec.crd.spec.names.kind,
              openapiProperties: this.openapiProperties, openApiSchema: this.openApiSchema, annotations: this.gatekeeperTemplate.metadata.annotations }
    });

    openAddConstraintTemplate.afterClosed()
      .pipe(take(1))
      .subscribe(response => {
        if (response && !response.cancel) {
          this.getConstraintTemplateDetails();
        }
    });
  }

  destroyTemplateConstraint(constraint: IGateKeeperConstraintDetails) {
    const openDestroyConstraintTemplate = this.dialog.open(AlertDialogComponent, {
      width: '850px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: {
        functionToRun: this.gateKeeperService.destroyGateKeeperTemplateConstraint(this.clusterId, this.templateName, constraint.metadata.name),
        afterRoute: [],
      }
    });

    openDestroyConstraintTemplate.afterClosed()
      .pipe(take(1))
      .subscribe(() => {
        this.getConstraintTemplateDetails();
    });
  }

  editTemplateConstraint(constraint) {
    const openAddConstraintTemplate = this.dialog.open(AddTemplateConstraintComponent, {
      width: '1000px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: {
        isEdit: true, constraint,
        clusterId: this.clusterId, templateName: this.templateName,
        templateSpecKind: this.gatekeeperTemplate.spec.crd.spec.names.kind,
        openapiProperties: this.openapiProperties, annotations: this.gatekeeperTemplate.metadata.annotations,
      },
    });

    openAddConstraintTemplate.afterClosed()
      .pipe(take(1))
      .subscribe(response => {
        if (response && !response.cancel) {
          this.getConstraintTemplateDetails();
        }
    });
  }


  // @TODO: if needed we will replace ImageIssueMoreDataDialogComponent with a new gatekeeper specific component. For now it works.
  showViolations(constraint: IGateKeeperConstraintDetails) {
    this.dialog.open(GatekeeperViolationDialogComponent, {
      width: 'auto',
      data: {violations: constraint.status.violations}
    });
  }
}
