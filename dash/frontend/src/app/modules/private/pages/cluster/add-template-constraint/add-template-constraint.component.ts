import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AddConstraintCriteriaComponent} from '../add-constraint-criteria/add-constraint-criteria.component';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {GateKeeperService} from '../../../../../core/services/gate-keeper.service';
import {AlertService} from '@full-fledged/alerts';
import {IConstraintCriteria, IGateKeeperConstraint} from '../../../../../core/entities/IGateKeeperConstraint';
import {TemplateConstraintManifestComponent} from '../template-constraint-manifest/template-constraint-manifest.component';


@Component({
  selector: 'app-add-template-constraint',
  templateUrl: './add-template-constraint.component.html',
  styleUrls: ['./add-template-constraint.component.scss']
})
export class AddTemplateConstraintComponent implements OnInit, AfterViewInit {

  templateName: string;
  addTemplateConstraintForm: FormGroup;
  // templateConstraintCriteria: IConstraintCriteria[] = [{kinds: ['Pod'], apiGroups: []}];
  templateConstraintCriteria: IConstraintCriteria[] = [];
  k8sNamespaces: string[];
  dynamicProperties = {};
  formSchema = {
    schema: {
      type: 'object',
      properties: {}
    }
  };
  generateFormFromJsonData = {};
  generateFormFromSchema = true;

  @ViewChild('propertyFields') propertyFields: ElementRef;
  @ViewChild('propertyFieldsJsonData') propertyFieldsJsonData: ElementRef;

  constructor(private dialog: MatDialog,
              private formBuilder: FormBuilder,
              private readonly gatekeeperService: GateKeeperService,
              private alertService: AlertService,
              @Inject(MAT_DIALOG_DATA) public data,
              private elementRef: ElementRef,
              private dialogRef: MatDialogRef<AddTemplateConstraintComponent>) {

    this.templateName = this.data.templateName;
    this.prepareTemplateConstraintCriteria();
    this.addTemplateConstraintForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/)]],
      kind: [this.data.templateSpecKind, [Validators.required]],
      description: ['', [Validators.required]],
      mode: ['dryrun', [Validators.required]],
      excludedNamespaces: [[], Validators.nullValidator],
      // labels: ['', Validators.nullValidator]
    });

    if (this.data.isEdit) {
      this.generateFormFromSchema = false;
      this.generateFormFromJsonData = this.data.constraint.spec.parameters;
    } else {
      this.formSchema.schema.properties = this.data.openApiSchema;
    }
  }

  ngOnInit(): void {
    this.gatekeeperService.getNamespacesByCluster(this.data.clusterId).subscribe(response => {
      this.k8sNamespaces = response.data;
    });
    if (this.data.isEdit && this.data.constraint) {
      this.setConstraintForm();
    }
  }

  ngAfterViewInit() {
    this.removeSubmitButtonAndSchemaText();
  }

  setConstraintForm() {
    this.addTemplateConstraintForm.controls.name.setValue(this.data.constraint.metadata.name);
    this.addTemplateConstraintForm.controls.description.setValue(this.data.constraint.metadata.annotations.description);
    this.addTemplateConstraintForm.controls.excludedNamespaces.setValue(this.data.constraint.spec.match.excludedNamespaces);
    this.addTemplateConstraintForm.controls.mode.setValue(this.data.constraint.spec.enforcementAction);
    this.templateConstraintCriteria = this.data.constraint.spec.match.kinds;
  }

  AddConstraintCriteriaDialog() {
    const openConstraintCriteriaDialog = this.dialog.open(AddConstraintCriteriaComponent, {
      width: '550px',
      height: '300px',
      closeOnNavigation: true,
      disableClose: false,
      data: {clusterId: this.data.clusterId}
    });

    openConstraintCriteriaDialog.afterClosed().subscribe(response => {
      if (response && response.constraintCriteria) {
        this.templateConstraintCriteria.push(response.constraintCriteria);
        console.log(this.templateConstraintCriteria);
      }
    });
  }

  onSubmit() {
    if (!this.templateConstraintCriteria.length) {
      this.alertService.danger('Please add at least one match criteria');
    } else {
      console.log(this.dynamicProperties);
      this.addTemplateConstraintForm.value.properties = this.dynamicProperties;
      console.log(this.addTemplateConstraintForm.value);
      this.addTemplateConstraintForm.value.criterias = this.templateConstraintCriteria;
      if (this.data && this.data.isEdit) {
        console.log('Patching Constraint Template....');
        this.gatekeeperService.patchGateKeeperTemplateConstraint(this.addTemplateConstraintForm.value, this.templateName, this.data.clusterId).subscribe(response => {
          // console.log('CONSTRAINT: ', response);
          if (response.data.statusCode === 200 ) {
            this.alertService.success(response.data.message);
            this.dialogRef.close({reload: true});
          } else {
            this.alertService.danger(response.data.message);
          }
        });
      } else {
        this.gatekeeperService.createGateKeeperTemplateConstraint(this.addTemplateConstraintForm.value, this.templateName, this.data.clusterId).subscribe(response => {
          // console.log('CONSTRAINT: ', response);
          if (response.data.statusCode === 200 ) {
            this.alertService.success(response.data.message);
            this.dialogRef.close({reload: true});
          } else if (response.data.statusCode === 409) {
            this.alertService.warning(response.data.message);
          } else {
            this.alertService.danger(response.data.message);
          }
        });
      }
    }
  }

  onNoClick() {
    this.dialogRef.close({cancel: true});
  }

  removeCriteria(index: number) {
    this.templateConstraintCriteria.splice(index, 1);
  }

  editRawKubernetesManifest() {
    const formValues = this.addTemplateConstraintForm.value;
    formValues.criterias = this.templateConstraintCriteria;
    // formValues.labels = this.addTemplateConstraintForm.controls.labels.value.split(',').map(label => label.trim());
    console.log(this.dynamicProperties);
    console.log('form: ', formValues);
    const openTemplateConstraintDialog = this.dialog.open(TemplateConstraintManifestComponent, {
      width: '650px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: {clusterId: this.data.clusterId, templateData: formValues, dynamicProperties: this.dynamicProperties}
    });

    openTemplateConstraintDialog.afterClosed().subscribe(response => {
      console.log(response.manifestData);
      if (response && response.manifestData) {
        this.addTemplateConstraintForm.controls.name.setValue(response.manifestData.metadata.name);
        this.addTemplateConstraintForm.controls.description.setValue(response.manifestData.metadata.annotations.description);
        this.addTemplateConstraintForm.controls.excludedNamespaces.setValue(response.manifestData.spec.match.excludedNamespaces);
        this.addTemplateConstraintForm.controls.mode.setValue(response.manifestData.spec.enforcementAction);
        // this.addTemplateConstraintForm.controls.labels.setValue(response.manifestData.spec.parameters.labels);
        this.templateConstraintCriteria = response.manifestData.spec.match.kinds;

        this.generateFormFromSchema = false;
        this.generateFormFromJsonData = response.manifestData.spec.parameters;
        this.dynamicProperties = response.manifestData.spec.parameters;
        this.removeSubmitButtonAndSchemaText();
        const propertiesForm = this.elementRef.nativeElement.querySelector('#schema_form_edit');
        // const button = propertiesForm.nativeElement.querySelector('.button-row');
        // button.remove();
        propertiesForm.click();
      }
    });
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
    button.remove();
    // schema text
    const schemaText = this.elementRef.nativeElement.querySelector('legend');
    schemaText.remove();
  }

  modelChange($event: any) {
    console.log('Model Change', $event);
  }

  prepareTemplateConstraintCriteria() {
    const m9sApiGroup = this.data.annotations['minesweeper.io/apiGroup'] === '' ? [] : this.data.annotations['minesweeper.io/apiGroup'].split(',').map(e => e.trim());
    const m9sKinds = this.data.annotations['minesweeper.io/kinds'].split(',').map(e => e.trim());
    if (m9sKinds.length > m9sApiGroup.length) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < m9sKinds.length; i++) {
        const apiGroup = m9sApiGroup[i] === undefined ? m9sApiGroup[0] === undefined ? [] : [m9sApiGroup[0]] : [m9sApiGroup[i]];
        const criteria: IConstraintCriteria = {kinds: [m9sKinds[i]], apiGroups: apiGroup};
        this.templateConstraintCriteria.push(criteria);
      }
    } else {
      for (let i = 0; i < m9sApiGroup.length; i++) {
        console.log(m9sApiGroup[i].trim());
        const kind = m9sKinds[i] === undefined ? m9sKinds[0] === undefined ? [] : [m9sKinds[0]] : [m9sKinds[i]];
        const criteria: IConstraintCriteria = {kinds: kind, apiGroups: [m9sApiGroup[i]]};
        this.templateConstraintCriteria.push(criteria);
      }
    }
  }
}
