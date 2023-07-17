import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppSettingsService } from '../../../../core/services/app-settings.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateAppSettingsComponent } from './create-app-settings/create-app-settings.component';
import { Subject } from 'rxjs';
import {IServerResponse} from '../../../../core/entities/IServerResponse';
import {ISetting} from '../../../../core/entities/ISetting';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {take, takeUntil} from 'rxjs/operators';


@Component({
  selector: 'app-app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss']
})
export class AppSettingsComponent implements OnInit, OnDestroy {
  protected readonly unsubscribe$ = new Subject<void>();

  organizationName: string;
  organizationLogo: SafeUrl;
  appSettingsId: number;
  buttonText: string;
  displayLogo: boolean;
  isEdit: boolean;
  subNavigationTitle: string;
  subNavigationButtonTitle: string;
  subNavigationButtonUrl: any;

  constructor(private appSettingsService: AppSettingsService,
              private dialog: MatDialog,
              private domSanitizer: DomSanitizer) {
    this.isEdit = this.displayLogo = false;
    this.subNavigationButtonTitle = 'Add Settings';
  }

  ngOnInit(): void {
    this.loadSiteSettings();

    this.appSettingsService.getUpdatedSettingsData()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: data => {
          if (data.length > 0) {
            this.isEdit = true;
            this.subNavigationButtonTitle = 'Edit Organization';
            this.organizationName = data.find(setting => setting.name === 'SITE_NAME')?.value;
            const organizationLogoFileId = data.find(setting => setting.name === 'SITE_LOGO')?.value;
            if (organizationLogoFileId && organizationLogoFileId !== '') {
              this.appSettingsService.getSiteLogo().pipe(take(1)).subscribe({
                next: response => {
                  localStorage.setItem('__site_title__', this.organizationName);
                  const reader = new FileReader();
                  reader.readAsDataURL(response);
                  reader.onloadend = () => {
                    localStorage.setItem('__site_logo__', reader.result.toString());
                  };
                  this.organizationLogo = this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(response));
                  this.displayLogo = true;
                }
              });
            }
          }
        }
      });
    this.subNavigationTitle = 'Organization';
  }

  loadSiteSettings(): void {
    this.appSettingsService.getAppSettings()
      .pipe(take(1))
      .subscribe({
        next: (result: IServerResponse<ISetting[]>) => {
          this.appSettingsService.setSettingsData(result.data);
        }
      });
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
    openAddCluster.afterClosed().pipe(take(1)).subscribe({
      next: (result: { refresh?: boolean}) => {
        if (result?.refresh) {
          this.loadSiteSettings();
        }
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
