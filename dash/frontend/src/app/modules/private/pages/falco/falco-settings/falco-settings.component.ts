import {Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FalcoService} from '../../../../../core/services/falco.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {take} from 'rxjs/operators';
import {IFalcoSettingPayload} from '../../../../../core/entities/IFalcoSettingPayload';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {IUser} from '../../../../../core/entities/IUser';
import {AlertService} from '@full-fledged/alerts';

@Component({
  selector: 'app-falco-settings',
  templateUrl: './falco-settings.component.html',
  styleUrls: ['./falco-settings.component.scss']
})
export class FalcoSettingsComponent implements OnInit {

  clusterId: number;
  priorityLevels: string [] = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Informational', 'Debug'];
  settingForm: FormGroup;
  isChecked = false;
  weekDays: string [] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(
    private route: ActivatedRoute,
    private falcoService: FalcoService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,

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
      emailList: [[]]
    });

    this.route.parent.parent.params
      .pipe(take(1))
      .subscribe(param => {
        this.clusterId = param.id;
      });

  }

  onClickSave() {

    const falcoCreatePayload: IFalcoSettingPayload = {
      clusterId: this.clusterId,
      sendNotificationAnomaly: this.settingForm.get('sendNotificationAnomaly').value,
      anomalyFrequency: this.settingForm.get('anomalyFrequency').value,
      severityLevel: this.settingForm.get('selectedPriorityLevels').value,
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

      this.alertService.warning('No setting is chosen');

    } else {
      this.falcoService.addFalcoSetting(this.clusterId, falcoCreatePayload).subscribe((response: IServerResponse<IFalcoSettingPayload>) => {
        this.alertService.success('Setting saved successfully.');
        // window.location.reload();
      }, (event) => {
        this.alertService.danger(event.error.message);
      });
    }
  }

  onClickEdit(){

  }
  onClickDelete(){

  }
  onClickAddRule(){

  }


}
