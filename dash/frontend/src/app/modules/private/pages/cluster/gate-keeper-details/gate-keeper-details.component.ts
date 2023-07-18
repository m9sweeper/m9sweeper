import { Component, OnInit } from '@angular/core';
import { GateKeeperService } from '../../../../../core/services/gate-keeper.service';
import {ActivatedRoute, Router} from '@angular/router';
import {IGatekeeperTemplate} from '../../../../../core/entities/IGatekeeperTemplate';
import {MatTableDataSource} from '@angular/material/table';
import {IGateKeeperConstraintDetails} from '../../../../../core/entities/IGateKeeperConstraint';
import {AlertDialogComponent} from '../../../../shared/alert-dialog/alert-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {AlertService} from '@full-fledged/alerts';
import {AddCustomConstraintTemplateComponent} from '../add-custom-constraint-template/add-custom-constraint-template.component';
import {AddTemplateConstraintComponent} from '../add-template-constraint/add-template-constraint.component';
import {GatekeeperViolationDialogComponent} from '../gatekeeper-violation-dialog/gatekeeper-violation-dialog.component';

@Component({
  selector: 'app-gate-keeper-details',
  templateUrl: './gate-keeper-details.component.html',
  styleUrls: ['./gate-keeper-details.component.scss']
})
export class GateKeeperDetailsComponent implements OnInit {

  gatekeeperTemplate: IGatekeeperTemplate;
  constraintCount = 0;
  isMobileDevice = false;
  clusterId: number;
  templateName: string;
  constraintsList: MatTableDataSource<IGateKeeperConstraintDetails>;
  displayedColumns: string[] = ['name', 'description', 'mode', 'action', 'violations'];
  rawTemplate: any;
  openapiProperties = [];
  openApiSchema: any;

  constructor(private readonly gatekeeperService: GateKeeperService,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private alertService: AlertService,
              private router: Router) {
    this.clusterId = +this.route.parent.snapshot.paramMap.get('id');
    this.templateName = this.route.snapshot.paramMap.get('templateName');
  }

  ngOnInit(): void {
    this.gatekeeperService.gateKeeperTemplateByName(this.clusterId, this.templateName).subscribe(data => {
      this.gatekeeperTemplate = data;
    });
    this.gatekeeperConstraintsByTemplate(this.templateName);
    this.gateKeeperTemplateByNameRaw();
  }

  gateKeeperTemplateByNameRaw() {
    this.gatekeeperService.gateKeeperTemplateByNameRaw(this.clusterId, this.templateName).subscribe(data => {
      this.rawTemplate = data;
      const tempData = JSON.parse(data);
      const tempProperties = tempData.spec.crd.spec.validation.openAPIV3Schema ? tempData.spec.crd.spec.validation.openAPIV3Schema.properties : {};
      this.openApiSchema = tempProperties;
      const propertyKeys = Object.keys(tempProperties);
      for (const key of propertyKeys) {
        this.openapiProperties.push([key, tempProperties[key].type]);
      }
    });
  }

  gatekeeperConstraintsByTemplate(templateName: string) {
    this.gatekeeperService.gateKeeperConstraintsByTemplate(this.clusterId, templateName).subscribe(data => {
      this.constraintCount = data.length ?? 0;
      this.constraintsList = new MatTableDataSource<IGateKeeperConstraintDetails>(data);
    });
  }

  screenSizeCollapse(width: number) {
    this.isMobileDevice = width < 500;
  }

  destroyConstraintTemplate() {
    const openDestroyTemplateDialog = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      closeOnNavigation: true,
      disableClose: true,
      data: {
        functionToRun: this.gatekeeperService.destroyConstraintTemplate(this.clusterId, this.templateName),
        afterRoute: [],
        returnResult: true
      }
    });

    openDestroyTemplateDialog.afterClosed().subscribe(response => {
      this.router.navigate([`private/clusters/${this.clusterId}/gatekeeper`]);
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

    rawTemplate.afterClosed().subscribe(response => {
      this.gateKeeperTemplateByNameRaw();
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

    openAddConstraintTemplate.afterClosed().subscribe(response => {
      if (response && !response.cancel) {
        this.gatekeeperConstraintsByTemplate(this.templateName);
      }
    });
  }

  destroyTemplateConstraint(constraint: IGateKeeperConstraintDetails) {
    const openDestroyConstraintTemplate = this.dialog.open(AlertDialogComponent, {
      width: '850px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: {functionToRun: this.gatekeeperService.destroyGateKeeperTemplateConstraint(this.clusterId, this.templateName, constraint.metadata.name),
              afterRoute: []
      }
    });

    openDestroyConstraintTemplate.afterClosed().subscribe(() => {
      this.gatekeeperConstraintsByTemplate(this.templateName);
    });
  }

  editTemplateConstraint(constraint) {
    const openAddConstraintTemplate = this.dialog.open(AddTemplateConstraintComponent, {
      width: '1000px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: {isEdit: true, constraint, clusterId: this.clusterId, templateName: this.templateName,
              templateSpecKind: this.gatekeeperTemplate.spec.crd.spec.names.kind,
              openapiProperties: this.openapiProperties, annotations: this.gatekeeperTemplate.metadata.annotations
            }
    });

    openAddConstraintTemplate.afterClosed().subscribe(response => {
      if (response && !response.cancel) {
        this.gatekeeperConstraintsByTemplate(this.templateName);
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
