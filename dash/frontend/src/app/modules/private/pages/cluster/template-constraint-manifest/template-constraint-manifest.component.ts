import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {IGatekeeperConstraint} from '../../../../../core/entities/gatekeeper';
import {AlertService} from '../../../../../core/services/alert.service';

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
  rawTemplateObject: Partial<IGatekeeperConstraint> = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      clusterId: number,
      templateData: Partial<IGatekeeperConstraint>,
    },
    private alertService: AlertService,
    private dialogRef: MatDialogRef<TemplateConstraintManifestComponent>
  ) {
    this.rawTemplateObject = this.data.templateData;

    console.log(this.rawTemplateObject);
    this.rawTemplate = JSON.stringify((this.rawTemplateObject), null, '  ');
  }

  ngOnInit(): void {}

  setEditorContent($event: any) {}

  saveManifest() {
    try {
      const manifestData = JSON.parse(this.rawTemplate);
      this.dialogRef.close({manifestData});
    } catch (e) {
      console.error(e);
      this.alertService.warning('Invalid JSON');
    }
  }

  onNoClick() {
    this.dialogRef.close({cancel: true});
  }
}
