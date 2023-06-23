import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AlertService} from '@full-fledged/alerts';
import {LicenseCheckComponent} from '../license-check/license-check.component';
import {AppSettingsService} from '../../../../../core/services/app-settings.service';
import {ISetting} from '../../../../../core/entities/ISetting';
import {LicenseFeatures} from '../../../../../core/enum/LicenseFeatures';


@Component({
  selector: 'app-licenses',
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.scss']
})
export class LicensesComponent implements OnInit {
  subNavigationTitle: string;
  subNavigationButtonTitle: string;
  subNavigationButtonUrl: any;
  isMobileDevice = false;
  licenseSettings: ISetting[];
  licenseKey: string | ISetting[];
  instanceKey: string | ISetting[];
  maxNode: string | ISetting[];
  maxCpu: string | ISetting[];
  maxRam: string | ISetting[];
  features: string[] = [];
  expirationDate: string;
  isLicenseValid = false;

  constructor(private dialog: MatDialog,
              private alertService: AlertService,
              private appSettingsService: AppSettingsService) { }

  ngOnInit(): void {
    this.subNavigationTitle = 'Application License';
    this.subNavigationButtonTitle = 'Enter License Key';
    this.loadLicenseSettings();
  }

  loadLicenseSettings() {
    this.appSettingsService.getLicenseSettings().subscribe(response => {
      if (response){
        this.licenseSettings = response.data;

        this.licenseKey = this.licenseSettings.filter(feature => feature.name === LicenseFeatures.LICENSE_KEY);
        if (this.licenseKey.length) {
          this.licenseKey = this.licenseKey[0].value.slice(-4);
        }

        this.instanceKey = this.licenseSettings.filter(feature => feature.name === LicenseFeatures.INSTANCE_KEY);
        if (this.instanceKey.length) {
          this.instanceKey = this.instanceKey[0].value.slice(-4);
        }

        this.maxNode = this.licenseSettings.filter(feature => feature.name === LicenseFeatures.MAX_NODES);
        if (this.maxNode.length) {
          this.maxNode = this.maxNode[0].value;
        }

        this.maxCpu = this.licenseSettings.filter(feature => feature.name === LicenseFeatures.MAX_CPU);
        if (this.maxCpu.length) {
          this.maxCpu = this.maxCpu[0].value;
        }

        this.maxRam = this.licenseSettings.filter(feature => feature.name === LicenseFeatures.MAX_RAM);
        if (this.maxRam.length) {
          this.maxRam = this.maxRam[0].value;
        }

        // tslint:disable-next-line:max-line-length
        this.features = this.licenseSettings.filter(feature => ((feature.name === LicenseFeatures.IMAGE_SCANNING || feature.name === LicenseFeatures.IMAGE_SCANNING_ENFORCEMENT || feature.name === LicenseFeatures.IMAGE_SCANNING_EXCEPTIONS) && feature.value !== '')).map(feature => feature.name);

        const rawExpirationDate: string | ISetting[] = this.licenseSettings.filter(feature => feature.name === LicenseFeatures.EXPIRATION_DATE);
        if (typeof(rawExpirationDate) === 'string') {
          this.expirationDate = rawExpirationDate;
        } else if (rawExpirationDate.length) {
          this.expirationDate = rawExpirationDate[0].value;
          if (Number(this.expirationDate) > Date.now()) {
            this.isLicenseValid = true;
          }
        }
      }
    });
  }

  displayFeatures() {
    return this.features.join(', ');
  }

  openCheckLicenseDialog() {
    const licenseCheckDialog = this.dialog.open(LicenseCheckComponent, {
      width: '600px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: true,
    });

    licenseCheckDialog.afterClosed().subscribe(response => {
      if (response.isLicenseValid) {
        this.loadLicenseSettings();
      }
    });
  }
}
