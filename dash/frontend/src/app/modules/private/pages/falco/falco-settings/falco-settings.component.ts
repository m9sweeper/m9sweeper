import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, } from '@angular/router';
import {FalcoService} from '../../../../../core/services/falco.service';
import {take} from 'rxjs/operators';
import {IFalcoSettingPayload} from '../../../../../core/entities/IFalcoSettingPayload';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {MatRadioChange} from '@angular/material/radio';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-falco-settings',
  templateUrl: './falco-settings.component.html',
  styleUrls: ['./falco-settings.component.scss']
})
export class FalcoSettingsComponent implements OnInit {

  clusterId: number;
  priorityLevels: string [] = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Informational', 'Debug'];
  settingForm: FormGroup;

  isNotifyAnomalyDisabled = true;
  isSpecificEmailHidden = true;

  isSummaryDisabled = true;
  isWeeklyDisabled = true;

  falcoSettingData: IFalcoSettingPayload;

  weekDays: string [] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(
    private route: ActivatedRoute,
    private falcoService: FalcoService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,

  ) { }

  ngOnInit(): void {
    this.settingForm = this.formBuilder.group({
      sendNotificationAnomaly: [],
      anomalyFrequency: [],
      selectedPriorityLevels: [[]],
      sendNotificationSummary: [],
      selectedSummaryFrequency: [],
      selectedWeekDay: [],
      whoToNotify: [],
      emailList: [[]],
      savedSeverityLevelArray: new FormArray([]),
    });

    this.route.parent.parent.params
      .pipe(take(1))
      .subscribe(param => {
        this.clusterId = +param.id;
      });

    this.displaySetting();
  }

  onClickSave() {

    const falcoCreatePayload: IFalcoSettingPayload = {
      clusterId: this.clusterId,
      sendNotificationAnomaly: this.settingForm.get('sendNotificationAnomaly').value,
      anomalyFrequency: this.settingForm.get('anomalyFrequency').value,
      severityLevel: JSON.stringify(this.settingForm.get('selectedPriorityLevels').value),
      sendNotificationSummary: this.settingForm.get('sendNotificationSummary').value,
      summaryNotificationFrequency: this.settingForm.get('selectedSummaryFrequency').value,
      weekday: this.settingForm.get('selectedWeekDay').value,
      whoToNotify: this.settingForm.get('whoToNotify').value,
      emailList: this.settingForm.get('emailList').value
    };

    if (
      falcoCreatePayload.sendNotificationAnomaly === null &&
      falcoCreatePayload.anomalyFrequency === null &&
      falcoCreatePayload.severityLevel.length === 0 &&
      falcoCreatePayload.sendNotificationSummary === null &&
      falcoCreatePayload.summaryNotificationFrequency === null &&
      falcoCreatePayload.weekday === null &&
      falcoCreatePayload.whoToNotify === null &&
      falcoCreatePayload.emailList.length === 0) {


      this.snackBar.open('No setting is chosen', 'Close', { duration: 2000 });

    } else if (falcoCreatePayload.sendNotificationAnomaly === true &&
      (falcoCreatePayload.anomalyFrequency === null ||
      falcoCreatePayload.severityLevel.length === 0)) {


      this.snackBar.open('To notify about anomalies, must fill out both anomaly frequency and severity level!', 'Close', { duration: 2000 });

    } else if (falcoCreatePayload.sendNotificationSummary === true &&
      (falcoCreatePayload.summaryNotificationFrequency !== 'daily' &&
        falcoCreatePayload.summaryNotificationFrequency !== 'weekly')) {


      this.snackBar.open('To send summary emails, must chose one of the frequency options! If choose weekly, pick a weekday.', 'Close', { duration: 2000 });

    } else if ( falcoCreatePayload.sendNotificationAnomaly === true &&
      falcoCreatePayload.anomalyFrequency >= 0 &&
      falcoCreatePayload.severityLevel.length !== 0 &&
      (falcoCreatePayload.whoToNotify === null &&
      falcoCreatePayload.emailList.length === 0)) {

      this.snackBar.open('To notify about anomalies, must choose recipient!', 'Close', { duration: 2000 });

    } else if ( falcoCreatePayload.sendNotificationSummary === true &&
      (falcoCreatePayload.whoToNotify === null &&
      falcoCreatePayload.emailList.length === 0)) {


      this.snackBar.open('To send summary email, must choose recipient!', 'Close', { duration: 2000 });

    } else {
        this.falcoService.addFalcoSetting(this.clusterId, falcoCreatePayload).subscribe((response: IServerResponse<IFalcoSettingPayload>) => {
          this.snackBar.open('Setting saved successfully.', 'Close', { duration: 2000 });
      }, (event) => {
          this.snackBar.open(event.error.message, 'Close', { duration: 2000 });
      });
    }
  }

  enableAnomalySubLevelcheckbox(event: MatCheckboxChange): void{
    this.isNotifyAnomalyDisabled = !this.isNotifyAnomalyDisabled;
  }

  enableSummarySubLevelcheckbox(event: MatCheckboxChange): void{
    this.isSummaryDisabled = !this.isSummaryDisabled;
  }

  enableWeeklySubLevelcheckbox($event: MatRadioChange): void{
    this.isWeeklyDisabled = !this.isWeeklyDisabled;
  }

  notEnableSpecificEmailSubLevelcheckbox($event: MatRadioChange): void{
    this.isSpecificEmailHidden = true;
  }

  enableSpecificEmailSubLevelcheckbox($event: MatRadioChange): void{
    this.isSpecificEmailHidden = false;
  }

  displaySetting(){
    this.falcoService.findFalcoSetting(this.clusterId).subscribe( (response: IServerResponse <IFalcoSettingPayload>) => {
        this.falcoSettingData = response.data;
        this.settingForm.get('sendNotificationAnomaly').setValue(this.falcoSettingData.sendNotificationAnomaly);
        if (this.falcoSettingData.sendNotificationAnomaly) {
          this.isNotifyAnomalyDisabled = false;
        }
        this.settingForm.get('anomalyFrequency').setValue(this.falcoSettingData.anomalyFrequency);
        this.settingForm.get('selectedSummaryFrequency').setValue(this.falcoSettingData.summaryNotificationFrequency);
        this.settingForm.get('selectedWeekDay').setValue(this.falcoSettingData.weekday);
        this.settingForm.get('whoToNotify').setValue(this.falcoSettingData.whoToNotify);
        if (this.falcoSettingData.whoToNotify === 'specificEmail'){
          this.isSpecificEmailHidden = false;
        }
        this.settingForm.get('emailList').setValue(this.falcoSettingData.emailList);
        this.settingForm.get('selectedPriorityLevels').setValue(JSON.parse(this.falcoSettingData.severityLevel));
      }, (err) => {
      this.snackBar.open(err, 'Close', { duration: 2000 });
        // @TODO: If it is just not found, that is NOT actually an error so don't alert
        // @TODO: For all other errors, it should display using the standard error box thing

      });
  }

  onClickEdit() {

  }
  onClickDelete() {

  }
  onClickAddRule() {

  }

}
