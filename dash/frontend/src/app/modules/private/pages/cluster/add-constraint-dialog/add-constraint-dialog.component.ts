import {Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {GateKeeperService} from '../../../../../core/services/gate-keeper.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AlertService} from 'src/app/core/services/alert.service';
import {AddEditConstraintTemplateManifestComponent} from '../add-edit-constraint-template-manifest/add-edit-constraint-template-manifest.component';
import {MatCheckbox, MatCheckboxChange} from '@angular/material/checkbox';
import {map, take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {GatekeeperService} from '../../../../../core/services/gatekeeper.service';
import {IGatekeeperConstraintTemplate, IGatekeeperConstraintTemplateBlueprint} from '../../../../../core/entities/gatekeeper';


interface IGSelectedTemplate {
  selectedTemplate: IGatekeeperConstraintTemplate | string;
  selectedTemplateName: string;
  selectedTopDir?: string;
  displayTemplateContent?: boolean;
  error?: string;
}

@Component({
  selector: 'app-add-constraint-dialog',
  templateUrl: './add-constraint-dialog.component.html',
  styleUrls: ['./add-constraint-dialog.component.scss']
})
export class AddConstraintDialogComponent implements OnInit, OnDestroy {
  @ViewChildren(MatCheckbox) checkboxes: QueryList<MatCheckbox>;

  clusterId: number;
  topDirs: string[] = [];
  dirStructure: { [dirName: string]: string[] };
  constraintTemplateBlueprints: {
    category: string;
    templates: IGatekeeperConstraintTemplateBlueprint[]
  }[];
  currentlySelectedTemplates: IGSelectedTemplate[] = [];
  saveAttemptResults = {
    successfullyDeployed: [],
    unsuccessfullyDeployed: [],
  };
  isHandsetOrXS: boolean;
  sidenavExpanded = true;
  unsubscribe$ = new Subject<void>();

  constructor(
    private gateKeeperService: GateKeeperService,
    private gatekeeperService: GatekeeperService,
    private dialogRef: MatDialogRef<AddConstraintDialogComponent>,
    private alertService: AlertService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit(): void {
    this.clusterId = this.data.clusterId;
    this.gatekeeperService.getGatekeeperConstraintTemplateBlueprints(this.clusterId)
      .pipe(take(1))
      .subscribe({
        next: (constraintTemplateTemplates) => {
          this.constraintTemplateBlueprints = constraintTemplateTemplates;
          const dirStructure: { [dirName: string]: string []} = {};
          const topDirs = [];
          constraintTemplateTemplates.forEach((item) => {
            topDirs.push(item.category);
            const templatesForCategory = [];
            item.templates.forEach((template) => {
              templatesForCategory.push(template.name);
            });
            dirStructure[item.category] = templatesForCategory;
          });
          this.dirStructure = dirStructure;
          this.topDirs = topDirs;
        }
      });
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.XSmall])
      .pipe(
        map(result => result.matches),
        takeUntil(this.unsubscribe$)
      ).subscribe({
      next: (newIsHandsetOrXS) => {
        this.isHandsetOrXS = newIsHandsetOrXS;
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  toggleSidenav() {
    this.sidenavExpanded = !this.sidenavExpanded;
  }

  loadTemplate(dir: string, subDir: string, $event) {
    if ($event.checked) {
      const templatesInCategory = this.constraintTemplateBlueprints.find(item => item.category === dir).templates;
      const templateInQuestion = templatesInCategory.find(item => item.name === subDir).template;
      this.currentlySelectedTemplates.push({
        selectedTemplate: templateInQuestion,
        selectedTemplateName: subDir,
        selectedTopDir: dir,
        displayTemplateContent: true,
      });
    } else {
      this.currentlySelectedTemplates = this.currentlySelectedTemplates.filter(t => t.selectedTemplateName !== subDir);
    }
  }

  deployMultipleGateKeeperTemplates() {
    const templates = this.currentlySelectedTemplates.map(t => {
      return {
        name: `${t.selectedTopDir}/${t.selectedTemplateName}`,
        template: JSON.stringify(t.selectedTemplate),
      };
    });
    this.saveAttemptResults.successfullyDeployed = this.saveAttemptResults.unsuccessfullyDeployed = [];
    this.gatekeeperService.deployGatekeeperConstraintTemplates(this.clusterId, templates)
      .pipe(take(1))
      .subscribe({
        next: response => {
          console.log(response);
          this.alertService.success('Templates successfully deployed');
          this.dialogRef.close({reloadData: true});
        },
        error: response => {
          if (!response?.error) {
            response = 'There was an error saving your constraint templates';
          }
          this.alertService.dangerAlertForHTTPError(response, 'AddConstraintDialogComponent.deployMultipleGateKeeperTemplates');

          if (response?.error?.data && Array.isArray(response.error.data)) {
            this.currentlySelectedTemplates.forEach((currentTemplate, i) => {
              const templateError = response.error.data.find(error => error.templateName === `${currentTemplate.selectedTopDir}/${currentTemplate.selectedTemplateName}`);
              if (templateError?.reason) {
                this.currentlySelectedTemplates[i].error = templateError.reason;
              } else {
                delete this.currentlySelectedTemplates[i].error;
              }
            });
          } else if (response?.error?.data?.successfullyDeployed || response?.error?.data?.unsuccessfullyDeployed ) {
            this.saveAttemptResults.successfullyDeployed = response?.error?.data?.successfullyDeployed ? response?.error?.data?.successfullyDeployed : [];
            this.saveAttemptResults.unsuccessfullyDeployed = response?.error?.data?.unsuccessfullyDeployed ? response?.error?.data?.unsuccessfullyDeployed : [];
          }
        }
      });
  }

  openK8sManifest(index: number) {
    const currentTemplate = this.currentlySelectedTemplates[index];
    const openAddConstraint = this.dialog.open(AddEditConstraintTemplateManifestComponent, {
      width: '1000px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: {
        clusterId: this.clusterId,
        dir: currentTemplate.selectedTopDir,
        subDir: currentTemplate.selectedTemplateName,
        templateContent: currentTemplate.selectedTemplate,
      },
    });
    openAddConstraint.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response && response.editedTemplate) {
            this.currentlySelectedTemplates[index].selectedTemplate = JSON.parse(response.editedTemplate);
          }
        }
      });
  }

  unselectTemplate(template: IGSelectedTemplate, $event: MatCheckboxChange) {
    this.currentlySelectedTemplates = this.currentlySelectedTemplates.filter(t => !(t.selectedTopDir === t.selectedTopDir && t.selectedTemplateName === template.selectedTemplateName));
    // t.selectedTopDir !== t.selectedTopDir && t.selectedTemplateName !== template.selectedTemplateName
    const desiredCheckboxId = `checkbox-${template.selectedTopDir}-${template.selectedTemplateName}`;
    this.checkboxes.forEach(checkbox => {
      if (checkbox.id === desiredCheckboxId) {
        checkbox.checked = false;
      }
    });
  }
}
