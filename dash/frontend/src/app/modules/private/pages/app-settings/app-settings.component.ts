import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppSettingsService } from '../../../../core/services/app-settings.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { CreateAppSettingsComponent } from './create-app-settings/create-app-settings.component';
import { JwtAuthService } from '../../../../core/services/jwt-auth.service';
import { Subscription } from 'rxjs';
import {IServerResponse} from '../../../../core/entities/IServerResponse';
import {ISetting} from '../../../../core/entities/ISetting';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';


@Component({
  selector: 'app-app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss']
})
export class AppSettingsComponent implements OnInit, OnDestroy {
  organizationName: string;
  organizationLogo: SafeUrl;
  appSettingsId: number;
  buttonText: string;
  displayLogo: boolean;
  isEdit: boolean;
  getUpdatedSettings: Subscription;
  subNavigationTitle: string;
  subNavigationButtonTitle: string;
  subNavigationButtonUrl: any;

  constructor(private appSettingsService: AppSettingsService,
              private dialog: MatDialog,
              private domSanitizer: DomSanitizer) {
    this.isEdit = this.displayLogo = false;
    this.buttonText = 'Add Settings';
  }

  ngOnInit(): void {
    this.appSettingsService.getAppSettings().subscribe((result: IServerResponse<ISetting[]>) => {
      this.appSettingsService.sendUpdatedSettingsData(result.data);
    });

    this.getUpdatedSettings = this.appSettingsService.getUpdatedSettingsData().subscribe(data => {
      if (data.length > 0) {
        this.isEdit = true;
        this.buttonText = 'Edit Organization';
        this.organizationName = data.find(setting => setting.name === 'SITE_NAME')?.value;
        const organizationLogoFileId = data.find(setting => setting.name === 'SITE_LOGO')?.value;
        if (organizationLogoFileId && organizationLogoFileId !== '') {
          this.appSettingsService.getSiteLogo().subscribe(response => {
            localStorage.setItem('__site_title__', this.organizationName);
            const reader = new FileReader();
            reader.readAsDataURL(response);
            reader.onloadend = () => {
              localStorage.setItem('__site_logo__', reader.result.toString());
            };
            this.organizationLogo = this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(response));
            this.displayLogo = true;
          });
        }
      }
    });
    this.subNavigationTitle = 'Organization';
  }

  openAddSettingDialog() {
    const openAddCluster = this.dialog.open(CreateAppSettingsComponent, {
      width: '600px',
      closeOnNavigation: true,
      disableClose: true,
      data: {
        isEdit: this.isEdit,
        appSettingsData: {
          organizationName: this.organizationName,
          organizationLogo: this.organizationLogo,
          id: this.appSettingsId
        }
      }
    });
    openAddCluster.afterClosed().subscribe(result => {
      if (result && result.updatedSiteSettings) {
        this.appSettingsService.sendUpdatedSettingsData(result.updatedSiteSettings);
      }
    });
  }

  ngOnDestroy() {
    this.getUpdatedSettings.unsubscribe();
  }
}
