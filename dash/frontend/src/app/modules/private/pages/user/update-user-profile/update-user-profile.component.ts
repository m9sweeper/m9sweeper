import { Component, OnInit } from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {IAuthority, IUser, IUserUpdateRequestPayload} from '../../../../../core/entities/IUser';
import {UserService} from '../../../../../core/services/user.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {AlertService} from '@full-fledged/alerts';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {FileManagementService} from '../../../../../core/services/file-management.service';
import {IFile} from '../../../../../core/entities/IFile';

@Component({
  selector: 'app-update-user-profile',
  templateUrl: './update-user-profile.component.html',
  styleUrls: ['./update-user-profile.component.scss']
})
export class UpdateUserProfileComponent implements OnInit {
  updateUserForm: UntypedFormGroup;
  userProfileData: IUser;
  authorities: IAuthority[];
  currentUserId = null;
  profileImageFileId = '';

  constructor(private dialogRef: MatDialogRef<UpdateUserProfileComponent>,
              private formBuilder: UntypedFormBuilder,
              private userService: UserService,
              private alertService: AlertService,
              private jwtAuthService: JwtAuthService,
              private fileManagementService: FileManagementService) {
    this.updateUserForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', Validators.pattern(/^(\+|\d)[0-9]{6,20}$/)],
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.jwtAuthService.getCurrentUserData().id;
    console.log('currentUserId', this.currentUserId);
    this.populateUserForm();
  }

  onNoClick(){
    this.dialogRef.close();
  }

  populateUserForm(): void {
    this.userService.getUserProfileSetting().subscribe((response: IServerResponse<IUser>) => {
      this.userProfileData = response.data;
      this.updateUserForm.get('firstName').setValue(this.userProfileData.firstName);
      this.updateUserForm.get('lastName').setValue(this.userProfileData.lastName);
      this.updateUserForm.get('phone').setValue(this.userProfileData.phone);
    }, () => {
      this.alertService.danger('User not found');
    });
  }

  onSubmit(){
    const userProfileUpdatePayload: IUserUpdateRequestPayload = {
      email: this.userProfileData.email,
      firstName: this.updateUserForm.get('firstName').value,
      lastName: this.updateUserForm.get('lastName').value,
      phone: this.updateUserForm.get('phone').value,
      authorities: this.userProfileData.authorities.map((authority: IAuthority) => authority.id),
      isActive: this.userProfileData.isActive
    };
    this.updateProfileSetting(userProfileUpdatePayload);
  }

  updateProfileSetting(userProfileUpdatePayload: IUserUpdateRequestPayload) {
    this.userService.updateUserProfileSetting(
      userProfileUpdatePayload
    ).subscribe((updatedUserResponse: IServerResponse<IUser>) => {
      this.alertService.success('Account updated successfully.');
      this.dialogRef.close();
    }, (event) => {
      this.alertService.danger('User profile data update failed!');
    });
  }
}
