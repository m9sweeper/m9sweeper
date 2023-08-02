import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AddConstraintCriteriaComponent} from '../add-constraint-criteria/add-constraint-criteria.component';
import {Validators,  FormGroup, FormBuilder} from '@angular/forms';
import {GateKeeperService} from '../../../../../core/services/gate-keeper.service';
import {AlertService} from 'src/app/core/services/alert.service';
import {IConstraintCriteria} from '../../../../../core/entities/IGateKeeperConstraint';
import {TemplateConstraintManifestComponent} from '../template-constraint-manifest/template-constraint-manifest.component';
import {take} from 'rxjs/operators';


@Component({
  selector: 'app-add-template-constraint',
  templateUrl: './add-template-constraint.component.html',
  styleUrls: ['./add-template-constraint.component.scss', '../../../../../../styles.scss']
})
export class AddTemplateConstraintComponent implements OnInit, AfterViewInit {
  templateName: string;
  addTemplateConstraintForm: FormGroup;
  // templateConstraintCriteria: IConstraintCriteria[] = [{kinds: ['Pod'], apiGroups: []}];
  initialTemplateConstraintCriteria: IConstraintCriteria[] = [];
  templateConstraintCriteria: IConstraintCriteria[] = [];
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

  constructor(private dialog: MatDialog,
              private formBuilder: FormBuilder,
              private readonly gatekeeperService: GateKeeperService,
              private alertService: AlertService,
              @Inject(MAT_DIALOG_DATA) public data,
              private elementRef: ElementRef,
              private dialogRef: MatDialogRef<AddTemplateConstraintComponent>) {

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
    this.gatekeeperService.getNamespacesByCluster(this.data.clusterId)
      .subscribe(response => {
        this.k8sNamespaces = response.data;
      }, error => {
        console.log(error);
        this.alertService.warning('Unable to load namespaces');
      });
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
        this.gatekeeperService.patchGateKeeperTemplateConstraint({
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
        this.gatekeeperService.createGateKeeperTemplateConstraint(this.addTemplateConstraintForm.value, this.templateName, this.data.clusterId).subscribe(response => {
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
    this.setConstraintForm();
    this.dialogRef.close({cancel: true});
  }

  removeCriteria(index: number) {
    this.templateConstraintCriteria.splice(index, 1);
  }

  editRawKubernetesManifest() {
    const formValues = this.addTemplateConstraintForm.value;
    formValues.criterias = this.templateConstraintCriteria;
    // formValues.labels = this.addTemplateConstraintForm.controls.labels.value.split(',').map(label => label.trim());
    const openTemplateConstraintDialog = this.dialog.open(TemplateConstraintManifestComponent, {
      width: '650px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: {clusterId: this.data.clusterId, templateData: formValues, dynamicProperties: this.dynamicProperties}
    });

    openTemplateConstraintDialog.afterClosed().pipe(take(1)).subscribe(response => {
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
        const criteria: IConstraintCriteria = {kinds: [m9sKinds[i]], apiGroups: apiGroup};
        this.templateConstraintCriteria.push(criteria);
      }
    } else {
      for (let i = 0; i < m9sApiGroup.length; i++) {
        const kind = m9sKinds[i] === undefined ? m9sKinds[0] === undefined ? [] : [m9sKinds[0]] : [m9sKinds[i]];
        const criteria: IConstraintCriteria = {kinds: kind, apiGroups: [m9sApiGroup[i]]};
        this.templateConstraintCriteria.push(criteria);
      }
    }
  }
}
