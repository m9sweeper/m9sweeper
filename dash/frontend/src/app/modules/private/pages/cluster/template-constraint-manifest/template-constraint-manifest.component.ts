import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {IGateKeeperConstraintDetails} from '../../../../../core/entities/IGateKeeperConstraint';

@Component({
  selector: 'app-template-constraint-manifest',
  templateUrl: './template-constraint-manifest.component.html',
  styleUrls: ['./template-constraint-manifest.component.scss']
})
export class TemplateConstraintManifestComponent implements OnInit {
  codeMirrorOptions: any = {
    theme: 'idea',
    mode: 'application/javascript',
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    // gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: true,
    viewportMargin: 100,
  };
  rawTemplate: any;
  rawTemplateObject: IGateKeeperConstraintDetails = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data,
              private dialogRef: MatDialogRef<TemplateConstraintManifestComponent>) {

    this.rawTemplateObject.apiVersion = 'constraints.gatekeeper.sh/v1beta1';
    this.rawTemplateObject.kind = this.data.templateData.kind;
    this.rawTemplateObject.metadata = {};
    this.rawTemplateObject.metadata.name = this.data.templateData.name;
    this.rawTemplateObject.metadata.annotations = {};
    this.rawTemplateObject.metadata.annotations.description = this.data.templateData.description;
    this.rawTemplateObject.spec = {};
    this.rawTemplateObject.spec.enforcementAction = this.data.templateData.mode;
    this.rawTemplateObject.spec.parameters = {};
    this.rawTemplateObject.spec.parameters = this.data.dynamicProperties;
    this.rawTemplateObject.spec.match = {};
    this.rawTemplateObject.spec.match.kinds = this.data.templateData.criterias;
    this.rawTemplateObject.spec.match.excludedNamespaces = this.data.templateData.excludedNamespaces;

    this.rawTemplate = JSON.stringify((this.rawTemplateObject), null, ' ');
  }

  ngOnInit(): void {}

  setEditorContent($event: any) {
  }

  saveManifest() {
    this.dialogRef.close({manifestData: JSON.parse(this.rawTemplate)});
  }

  onNoClick() {
    this.dialogRef.close({cancel: true});
  }
}
