import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {GateKeeperService} from '../../../../../core/services/gate-keeper.service';
import {AlertService} from 'src/app/core/services/alert.service';
import {IGatekeeperTemplate} from '../../../../../core/entities/IGatekeeperTemplate';
import {IGatekeeperConstraint, IGatekeeperConstraintTemplate} from '../../../../../core/entities/gatekeeper';
import {GatekeeperService} from '../../../../../core/services/gatekeeper.service';
import {MatTableDataSource} from '@angular/material/table';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-add-edit-constraint-template-manifest',
  templateUrl: './add-edit-constraint-template-manifest.component.html',
  styleUrls: ['./add-edit-constraint-template-manifest.component.scss']
})
export class AddEditConstraintTemplateManifestComponent implements OnInit {
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
      templateContent: IGatekeeperConstraintTemplate;
      saveTemplate?: boolean;
      clusterId?: number;
      subDir?: string;
    },
    private gateKeeperService: GateKeeperService,
    private gatekeeperService: GatekeeperService,
    private dialogRef: MatDialogRef<AddEditConstraintTemplateManifestComponent>,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.rawTemplate = JSON.stringify(this.data.templateContent, null, ' ');
  }

  deployCustomTemplate() {
    if (this.data.saveTemplate) {
      this.patchTemplate();
    } else {
      this.dialogRef.close({
        editedTemplate: this.rawTemplate,
      });
    }
  }

  patchTemplate() {
    this.gateKeeperService.patchRawGateKeeperTemplate(this.data.clusterId, this.rawTemplate).subscribe(response => {
      if (response.data.statusCode === 200) {
        this.dialogRef.close({
          closeParentDialog: true,
          editedTemplate: this.rawTemplate,
        });
        this.alertService.success(`${response.data.message}`);
      } else if (response.data.statusCode === 409) {
        this.alertService.info(`${response.data.message}`);
      } else {
        this.alertService.danger(`${response.data.message}`);
      }
    });
  }
}

