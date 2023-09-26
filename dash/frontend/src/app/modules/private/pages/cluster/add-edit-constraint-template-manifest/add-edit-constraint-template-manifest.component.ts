import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AlertService} from 'src/app/core/services/alert.service';
import {IGatekeeperConstraintTemplate} from '../../../../../core/entities/gatekeeper';
import {GatekeeperService} from '../../../../../core/services/gatekeeper.service';
import {take} from 'rxjs/operators';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';

@Component({
  selector: 'app-add-edit-constraint-template-manifest',
  templateUrl: './add-edit-constraint-template-manifest.component.html',
  styleUrls: ['./add-edit-constraint-template-manifest.component.scss']
})
export class AddEditConstraintTemplateManifestComponent implements OnInit {
  codeMirrorOptions: any = {
    readOnly: false,
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
  readOnly: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      clusterId: number;
      templateContent: IGatekeeperConstraintTemplate;
      templateName: string;
      saveTemplate?: boolean;
      subDir?: string;
      readOnly: boolean;
    },
    private gatekeeperService: GatekeeperService,
    private dialogRef: MatDialogRef<AddEditConstraintTemplateManifestComponent>,
    private alertService: AlertService,
    protected readonly authService: JwtAuthService
  ) {}

  ngOnInit(): void {
    this.rawTemplate = JSON.stringify(this.data.templateContent, null, ' ');
    // Readonly if in read only mode or not an admin
    this.readOnly = this.data?.readOnly || !this.authService.isAdmin();
    this.codeMirrorOptions.readOnly = this.readOnly;
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
    this.gatekeeperService.updateConstraintTemplate(this.data.clusterId, this.data.templateName, this.rawTemplate)
      .pipe(take(1))
      .subscribe(response => {
        this.dialogRef.close({
          closeParentDialog: true,
          editedTemplate: this.rawTemplate,
        });
        this.alertService.success('Successfully updated the template');
      }, error => {
        this.alertService.dangerAlertForHTTPError(error, 'AddEditConstraintTemplateManifestComponent.patchTemplate');
      }
    );
  }
}

