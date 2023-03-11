import {Component, Inject, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CommonService} from '../../../../../core/services/common.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {FalcoService} from '../../../../../core/services/falco.service';

@Component({
  selector: 'app-gate-keeper-install-wizard-dialog',
  templateUrl: './gate-keeper-install-wizard-dialog.component.html',
  styleUrls: ['./gate-keeper-install-wizard-dialog.component.scss']
})
export class GateKeeperInstallWizardDialogComponent implements OnInit {

  ngOnInit(): void {

  }
}
