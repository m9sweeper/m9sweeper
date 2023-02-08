import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';
import {AppSettingsService} from '../../../../../core/services/app-settings.service';
import {FileManagementService} from '../../../../../core/services/file-management.service';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {IFile} from '../../../../../core/entities/IFile';
import {NgxUiLoaderService} from 'ngx-ui-loader';

@Component({
  selector: 'app-create-app-settings',
  templateUrl: './create-app-settings.component.html',
  styleUrls: ['./create-app-settings.component.scss']
})
export class CreateAppSettingsComponent implements OnInit {
  createAppSettingsForm: UntypedFormGroup;

  constructor(private dialogRef: MatDialogRef<CreateAppSettingsComponent>,
              private formBuilder: UntypedFormBuilder,
              private appSettingsService: AppSettingsService,
              private fileManagementService: FileManagementService,
              @Inject(MAT_DIALOG_DATA) public data: any
              )
  {
    this.createAppSettingsForm = this.formBuilder.group({
      name: [this.data.isEdit ? this.data.appSettingsData.organizationName : '' , Validators.required],
      file: ['', Validators.required],
      fileSource: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    // const currentUserId = this.jwtAuthService.getCurrentUserData().id;
    // const appSettingsData = {...this.createAppSettingsForm.value, logo: this.selectedLogoAsBase64,
    //   logo_type: this.selectedLogoType, user_id: currentUserId};
    // if (this.data.isEdit) {
    //   this.appSettingsService.updateAppSettings(this.data.appSettingsData.id, appSettingsData).subscribe(result => {
    //     this.appSettingsService.sendUpdatedSettingsData({...appSettingsData, id: result.data.id});
    //   });
    // } else {
    //   this.appSettingsService.createAppSettings(appSettingsData).subscribe(result => {
    //     this.appSettingsService.sendUpdatedSettingsData({...appSettingsData, id: result.data[0].id});
    //   });
    // }
    const formData = new FormData();
    formData.append('files', this.createAppSettingsForm.get('fileSource').value);

    this.fileManagementService.upload(formData).subscribe((fileSaveResponse: IServerResponse<IFile[]>) => {
      console.log('Response: ', fileSaveResponse);
      if (fileSaveResponse.data.length > 0 ) {
        const siteName = this.createAppSettingsForm.get('name').value;
        const siteLogoFileId = fileSaveResponse.data[0].fileId;
        const siteSettings = [
          {
            name: 'SITE_NAME',
            value: siteName
          },
          {
            name: 'SITE_LOGO',
            value: siteLogoFileId
          }
        ];
        this.appSettingsService.saveAppSettings(siteSettings, this.data.isEdit).subscribe(saveSiteSettingsResponse => {
          console.log('Save app settings: ', saveSiteSettingsResponse);
          this.dialogRef.close({updatedSiteSettings: saveSiteSettingsResponse.data});
        });
      }
    });
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onLogoChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.createAppSettingsForm.patchValue({
        fileSource: file
      });
    }
  }
  //
  // private toBase64(file: File) {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = error => reject(error);
  //   });
  // }
}
