import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AddConstraintCriteriaComponent} from '../add-constraint-criteria/add-constraint-criteria.component';
import {Validators,  FormGroup, FormBuilder} from '@angular/forms';
import {GateKeeperService} from '../../../../../core/services/gate-keeper.service';
import {AlertService} from 'src/app/core/services/alert.service';
import {TemplateConstraintManifestComponent} from '../template-constraint-manifest/template-constraint-manifest.component';
import {take} from 'rxjs/operators';
import {NamespaceService} from '../../../../../core/services/namespace.service';
import {GatekeeperService} from '../../../../../core/services/gatekeeper.service';
import {IConstraintSpecMatchKinds, IGatekeeperConstraint} from '../../../../../core/entities/gatekeeper';


@Component({
  selector: 'app-add-template-constraint',
  templateUrl: './add-template-constraint.component.html',
  styleUrls: ['./add-template-constraint.component.scss', '../../../../../../styles.scss']
})
export class AddTemplateConstraintComponent implements OnInit, AfterViewInit {
  templateName: string;
  addTemplateConstraintForm: FormGroup;
  // templateConstraintCriteria: IConstraintCriteria[] = [{kinds: ['Pod'], apiGroups: []}];
  initialTemplateConstraintCriteria: IConstraintSpecMatchKinds[] = [];
  templateConstraintCriteria: IConstraintSpecMatchKinds[] = [];
  k8sNamespaces: string[];
  dynamicProperties = {};
  formSchema = {
    schema: {
      type: 'object',
      properties: {}
    }
  };
  isEdit = false;
  generateFormFromJsonData = {};
  generateFormFromSchema = true;

  @ViewChild('propertyFields') propertyFields: ElementRef;
  @ViewChild('propertyFieldsJsonData') propertyFieldsJsonData: ElementRef;

  constructor(
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private readonly gateKeeperService: GateKeeperService,
    private readonly gatekeeperService: GatekeeperService,
    private alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data,
    private elementRef: ElementRef,
    private dialogRef: MatDialogRef<AddTemplateConstraintComponent>,
    private readonly namespaceService: NamespaceService,
  ) {

    this.templateName = this.data.templateName;
    this.prepareTemplateConstraintCriteria();

    if (this.data.isEdit) {
      this.isEdit = true;
      this.generateFormFromSchema = false;
      this.generateFormFromJsonData = this.data.constraint.spec.parameters;
    } else {
      this.formSchema.schema.properties = this.data.openApiSchema;
    }

    this.addTemplateConstraintForm = this.formBuilder.group({
      name: [
        {value: '', disabled: this.isEdit},
        [Validators.required, Validators.pattern(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/)],
      ],
      kind: [this.data.templateSpecKind, [Validators.required]],
      description: ['', [Validators.required]],
      mode: ['dryrun', [Validators.required]],
      excludedNamespaces: [[], Validators.nullValidator],
      // labels: ['', Validators.nullValidator]
    });
  }

  ngOnInit(): void {
    this.namespaceService.getAllK8sNamespaces(this.data.clusterId)
      .pipe(take(1))
      .subscribe(
        response => {
          this.k8sNamespaces = response.data.map(namespaceObject => namespaceObject.name);
        },
        error => {
          console.log(error);
          this.alertService.warning('Unable to load namespaces');
        },
      );
    this.setConstraintForm();
  }

  ngAfterViewInit() {
    this.removeSubmitButtonAndSchemaText();
  }

  setConstraintForm() {
    if (this.data.isEdit && this.data.constraint) {
      this.addTemplateConstraintForm.controls.name.setValue(this.data.constraint.metadata.name);
      this.addTemplateConstraintForm.controls.description.setValue(this.data.constraint.metadata.annotations.description);
      this.addTemplateConstraintForm.controls.excludedNamespaces.setValue(this.data.constraint.spec.match.excludedNamespaces);
      this.addTemplateConstraintForm.controls.mode.setValue(this.data.constraint.spec.enforcementAction);
      this.initialTemplateConstraintCriteria = this.data.constraint.spec.match.kinds;
      // object reference needs to be different so that it resets when the form is closed and reopened
      this.templateConstraintCriteria = structuredClone(this.initialTemplateConstraintCriteria);
    }
  }

  AddConstraintCriteriaDialog() {
    const openConstraintCriteriaDialog = this.dialog.open(AddConstraintCriteriaComponent, {
      width: '600px',
      height: '400px',
      closeOnNavigation: true,
      disableClose: false,
      data: {clusterId: this.data.clusterId}
    });

    openConstraintCriteriaDialog.afterClosed().pipe(take(1)).subscribe(response => {
      if (response && response.constraintCriteria) {
        this.templateConstraintCriteria.push(response.constraintCriteria);
      }
    });
  }

  onSubmit() {
    if (!this.templateConstraintCriteria.length) {
      this.alertService.danger('Please add at least one match criteria');
    } else {
      this.addTemplateConstraintForm.value.properties = this.dynamicProperties;
      this.addTemplateConstraintForm.value.criterias = this.templateConstraintCriteria;
      if (this.data && this.data.isEdit) {
        // need to add the name to it (since it's disabled when it's an edit)
        this.gateKeeperService.patchGateKeeperTemplateConstraint({
          name: this.data.constraint.metadata.name,
          ...this.addTemplateConstraintForm.value
        }, this.templateName, this.data.clusterId)
          .subscribe(response => {
            if (response.data.statusCode === 200 ) {
              this.alertService.success(response.data.message);
              this.dialogRef.close({reload: true});
            } else {
              this.alertService.danger(response.data.message);
            }
          }, error => {
            console.log(error);
            this.alertService.danger(error.statusText);
          });
      } else {
        const jsonTemplate = this.formToTemplate();
        // const stringifiedTemplate = JSON.stringify((jsonTemplate), null, '  ');
        this.gatekeeperService.createConstraint(this.data.clusterId, this.templateName, jsonTemplate)
          .subscribe(response => {
            this.alertService.success('Deployed the new constraint');
            this.dialogRef.close({reload: true});
          }, error => {
            this.alertService.dangerAlertForHTTPError(error, 'AddTemplateConstraintComponent.onSubmit');
          });
      }
    }
  }

  onNoClick() {
    this.setConstraintForm();
    this.dialogRef.close({cancel: true});
  }

  removeCriteria(index: number) {
    this.templateConstraintCriteria.splice(index, 1);
  }

  editRawKubernetesManifest() {
    const formValues = this.formToTemplate();
    // formValues.labels = this.addTemplateConstraintForm.controls.labels.value.split(',').map(label => label.trim());
    const openTemplateConstraintDialog = this.dialog.open(TemplateConstraintManifestComponent, {
      width: '650px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: {
        clusterId: this.data.clusterId,
        templateData: formValues,
      }
    });

    // @TODO: manifest --> form
    // @TODO: pass manifest to the backend, not the form value
    openTemplateConstraintDialog.afterClosed().pipe(take(1)).subscribe(response => {
      if (response && response.manifestData) {
        this.templateToForm(response.manifestData);
      }
    });
  }

  templateToForm(template: IGatekeeperConstraint) {
    console.log({template});
    this.addTemplateConstraintForm.controls.name.setValue(template.metadata.name);
    this.addTemplateConstraintForm.controls.description.setValue(template.metadata.annotations.description);
    this.addTemplateConstraintForm.controls.excludedNamespaces.setValue(template.spec.match.excludedNamespaces);
    this.addTemplateConstraintForm.controls.mode.setValue(template.spec.enforcementAction);
    // this.addTemplateConstraintForm.controls.labels.setValue(template.spec.parameters.labels);
    this.templateConstraintCriteria = template.spec.match.kinds;

    this.generateFormFromSchema = false;
    this.generateFormFromJsonData = template.spec.parameters;
    this.dynamicProperties = template.spec.parameters;
    this.removeSubmitButtonAndSchemaText();
    const propertiesForm = this.elementRef.nativeElement.querySelector('#schema_form_edit');
  }

  formToTemplate() {
    const rawValues = this.addTemplateConstraintForm.value;
    const template: Partial<IGatekeeperConstraint> = {};

    template.apiVersion = 'constraints.gatekeeper.sh/v1beta1';
    template.kind = rawValues.kind;
    template.metadata = {};
    template.metadata.name = rawValues.name;
    template.metadata.annotations = {};
    template.metadata.annotations.description = rawValues.description;
    template.spec = {};
    template.spec.enforcementAction = rawValues.mode;
    template.spec.parameters = {};
    template.spec.parameters = this.dynamicProperties;
    template.spec.match = {};
    template.spec.match.kinds = this.templateConstraintCriteria;
    template.spec.match.excludedNamespaces = rawValues.excludedNamespaces;

    return template;
  }

  saveSchemaFormValue($event: any) {
    this.dynamicProperties = $event.schema;
  }

  saveSchemaFormJsonValue($event: any) {
    this.dynamicProperties = $event;
  }

  removeSubmitButtonAndSchemaText(){
    // Remove Submit button of the form generated from json schema
    const button = this.elementRef.nativeElement.querySelector('.button-row');
    if (button) {
      button.remove();
    }
    // schema text
    const schemaText = this.elementRef.nativeElement.querySelector('legend');
    if (schemaText) {
      schemaText.remove();
    }
  }

  modelChange($event: any) {
  }

  prepareTemplateConstraintCriteria() {
    const m9sApiGroup = this.data.annotations['minesweeper.io/apiGroup'] === '' ? [] : this.data.annotations['minesweeper.io/apiGroup'].split(',').map(e => e.trim());
    const m9sKinds = this.data.annotations['minesweeper.io/kinds'].split(',').map(e => e.trim());
    if (m9sKinds.length > m9sApiGroup.length) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < m9sKinds.length; i++) {
        const apiGroup = m9sApiGroup[i] === undefined ? m9sApiGroup[0] === undefined ? [] : [m9sApiGroup[0]] : [m9sApiGroup[i]];
        const criteria: IConstraintSpecMatchKinds = {kinds: [m9sKinds[i]], apiGroups: apiGroup};
        this.templateConstraintCriteria.push(criteria);
      }
    } else {
      for (let i = 0; i < m9sApiGroup.length; i++) {
        const kind = m9sKinds[i] === undefined ? m9sKinds[0] === undefined ? [] : [m9sKinds[0]] : [m9sKinds[i]];
        const criteria: IConstraintSpecMatchKinds = {kinds: kind, apiGroups: [m9sApiGroup[i]]};
        this.templateConstraintCriteria.push(criteria);
      }
    }
  }
}
