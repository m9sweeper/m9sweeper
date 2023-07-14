import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AppSettingsService} from '../../../../../core/services/app-settings.service';
import {FileManagementService} from '../../../../../core/services/file-management.service';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {IFile} from '../../../../../core/entities/IFile';
import {SafeUrl} from '@angular/platform-browser';


interface CreateAppSettingsDialogData {
  isEdit: boolean;
  appSettingsData: {
    organizationName: string;
    organizationLogo: SafeUrl;
  };
}
@Component({
  selector: 'app-create-app-settings',
  templateUrl: './create-app-settings.component.html',
  styleUrls: ['./create-app-settings.component.scss']
})
export class CreateAppSettingsComponent implements OnInit {
  createAppSettingsForm: FormGroup;
  imageUrl: string | SafeUrl;

  constructor(private dialogRef: MatDialogRef<CreateAppSettingsComponent>,
              private formBuilder: FormBuilder,
              private appSettingsService: AppSettingsService,
              private fileManagementService: FileManagementService,
              @Inject(MAT_DIALOG_DATA) public data: CreateAppSettingsDialogData
              )
  {
    this.createAppSettingsForm = this.formBuilder.group({
      name: [this.data.isEdit ? this.data.appSettingsData.organizationName : '' , Validators.required],
      file: ['', Validators.required],
      fileSource: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log(this.data);
    this.imageUrl = this.data?.appSettingsData?.organizationLogo;
  }

  onSubmit() {
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
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
