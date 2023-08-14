import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {GateKeeperService} from '../../../../../core/services/gate-keeper.service';
import {AlertService} from 'src/app/core/services/alert.service';
import {IGatekeeperTemplate} from '../../../../../core/entities/IGatekeeperTemplate';

@Component({
  selector: 'app-add-custom-constraint-template',
  templateUrl: './add-custom-constraint-template.component.html',
  styleUrls: ['./add-custom-constraint-template.component.scss']
})
export class AddCustomConstraintTemplateComponent implements OnInit {
  codeMirrorOptions: any = {
    theme: 'material',
    mode: {name: 'javascript', json: true},
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    autoCloseBrackets: true,
    matchBrackets: true,
    // lint: true,
    viewportMargin: 100,
  };
  initialHeight = 300; // this is the initial height of codemirror
  rawTemplate: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      templateContent?: IGatekeeperTemplate;
      rawTemplateContent?: string;
      clusterId?: number;
      dir?: string;
      subDir?: string;
    },
    private gatekeeperService: GateKeeperService,
    private dialogRef: MatDialogRef<AddCustomConstraintTemplateComponent>,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    if (this.data?.rawTemplateContent) {
      const parsedTemplate = JSON.parse(this.data.rawTemplateContent);
      delete parsedTemplate.metadata.resourceVersion;
      this.rawTemplate = JSON.stringify(parsedTemplate, null, ' ');
    } else if (this.data?.templateContent) {
      this.rawTemplate = JSON.stringify(this.data.templateContent, null, ' ');
    } else {
      this.gatekeeperService.loadRawGateKeeperTemplate(this.data.clusterId, this.data.dir, this.data.subDir).subscribe(response => {
        this.rawTemplate = JSON.stringify(response, null, ' ');
      });
    }
  }

  deployCustomTemplate() {
    this.dialogRef.close({
      editedTemplate: this.rawTemplate,
    });
    // this.patchTemplate();
  }

  patchTemplate() {
    this.gatekeeperService.patchRawGateKeeperTemplate(this.data.clusterId, this.rawTemplate).subscribe(response => {
      if (response.data.statusCode === 200) {
        this.alertService.success(`${response.data.message}`);
      } else if (response.data.statusCode === 409) {
        this.alertService.info(`${response.data.message}`);
      } else {
        this.alertService.danger(`${response.data.message}`);
      }
    });
    setTimeout(() => {
      this.dialogRef.close({closeParentDialog: true});
    }, 1000);
  }
}

