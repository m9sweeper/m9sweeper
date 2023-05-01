import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '@full-fledged/alerts';
import { UserService } from '../../../../../core/services/user.service';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {IAuthority, IUser, IUserRequestPayload} from '../../../../../core/entities/IUser';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  userForm: FormGroup;
  subMenuTitle = 'Create Local User';
  isEdit = false;
  userId = null;
  currentUserId = null;

  userProfileData: IUser;
  authorities: IAuthority[];
  defaultAuthority: Array<number>;
  activateReadOly = false;
  hidePassword = true;
  authType: string;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private jwtAuthService: JwtAuthService
  ) {
    this.isEdit = this.router.url.indexOf('private/users/edit/') !== -1;
    this.userId = +this.route.snapshot.paramMap.get('id');

    this.userForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', Validators.nullValidator],
      phone: ['', Validators.pattern(/^(\+|\d)[0-9]{6,20}$/)],
      isActive: [true, Validators.nullValidator],
      authorities: ['', [Validators.required]]
    });

    if (this.isEdit) {
      this.populateUserForm(this.userId);
      this.subMenuTitle = 'Edit User - ' + this.userId;
    } else {
      this.subMenuTitle = 'Create Local User';
    }
  }

  ngOnInit(): void {
    this.currentUserId = this.jwtAuthService.getCurrentUserData().id;
    this.loadAuthorities();
  }

  loadAuthorities() {
    this.userService.getAuthorityList().subscribe((response: IServerResponse<IAuthority[]>) => {
      this.authorities = response.data;
      this.defaultAuthority = this.authorities
        .filter((authority) => authority.type === 'READ_ONLY')
        .map((authority) => authority.id);
      const getAuthorities = this.userForm.get('authorities').value;
      if (getAuthorities.length === 0){
        this.userForm.get('authorities').setValue(this.defaultAuthority);
      }
    });
  }

  populateUserForm(userId): void {
    this.userService.getUpdatedUserData(userId).subscribe((response: IServerResponse<IUser>) => {
      this.userProfileData = response.data;
      this.authType = this.userProfileData.sourceSystem.type;
      this.activateReadOly = +this.userProfileData.sourceSystem.id > 0;
      this.userForm.get('firstName').setValue(this.userProfileData.firstName);
      this.userForm.get('lastName').setValue(this.userProfileData.lastName);
      this.userForm.get('phone').setValue(this.userProfileData.phone);
      this.userForm.get('isActive').setValue(this.userProfileData.isActive);
      this.userForm.get('authorities').setValue(this.userProfileData.authorities.map((authority: IAuthority) => authority.id));
      this.userForm.removeControl('email');
    }, () => {
      this.alertService.danger('User not found');
      this.router.navigate(['/private/users']);
    });
  }

  // async onFileChange(event) {
  //   this.selectedFile = event.target.files[0];
  //   console.log(this.selectedFile);
  //   const data = await this.toBase64(this.selectedFile);
  //   this.selectedFileTo64base = data;
  //   this.selectedFileType = this.selectedFile.type;
  // }

  onSubmit() {
    if (!this.isEdit) {
      const userCreatePayload: IUserRequestPayload = {
          authorities: this.userForm.get('authorities').value,
          email: this.userForm.get('email').value,
          password: this.userForm.get('password').value,
          firstName: this.userForm.get('firstName').value,
          lastName: this.userForm.get('lastName').value,
          phone: this.userForm.get('phone').value,
          isActive: this.userForm.get('isActive').value,
        };
      this.userService.addUser(userCreatePayload).subscribe((createdUserResponse: IServerResponse<IUser>) => {
          this.alertService.success('Account created successfully.');
          this.router.navigate(['/private/users']);
        }, (event) => {
          this.alertService.danger(event.error.message);
        });
    } else {
      const userCreatePayload: IUserRequestPayload = {
        authorities: this.userForm.get('authorities').value,
        email: this.userProfileData.email,
        password: this.userForm.get('password').value,
        firstName: this.userForm.get('firstName').value,
        lastName: this.userForm.get('lastName').value,
        phone: this.userForm.get('phone').value,
        isActive: this.userForm.get('isActive').value,
      };
      // if user did not add a password, do not send it to the backend
      if (!userCreatePayload.password || userCreatePayload.password.trim() === '') {
        delete userCreatePayload.password;
      }
      this.userService.updateUserInfo(
        this.userProfileData.id,
        userCreatePayload
      ).pipe(take(1))
        .subscribe((updatedUserResponse: IServerResponse<IUser>) => {
        this.alertService.success('Account updated successfully.');
        this.router.navigate(['/private/users']);
      }, (event) => {
        this.alertService.danger(event.error.message);
      });
    }
    // this.loaderService.start();
    // if (this.userId) {
    //   this.userService
    //     .updateUserInfo(+this.userId, {...this.userForm.value, logo: this.selectedFileTo64base, logo_type: this.selectedFileType})
    //     .subscribe((response) => {
    //       this.alertService.success('Information updated');
    //       this.router.navigate(['/private/users']);
    //     }, e => {
    //       this.alertService.danger(e.error.message);
    //       this.loaderService.stop();
    //     }, () => {
    //       this.loaderService.stop();
    //     });
    // } else {
    //
    //   this.userService
    //     .addUser({...this.userForm.value, logo: this.selectedFileTo64base, logo_type: this.selectedFileType})
    //     .subscribe((response) => {
    //       if (response.data.length > 0) {
    //         console.log('create user response:', response);
    //         this.alertService.success('Account created successfully.');
    //         this.router.navigate(['/private/users']);
    //       }
    //     }, event => {
    //       this.alertService.danger(event.error.message);
    //       this.loaderService.stop();
    //     }, () => {
    //       this.loaderService.stop();
    //     });
    // }
    // if (+this.userId === this.currentUserId) {
    //   this.userService.sendUpdatedLogo(this.selectedFileTo64base);
    // }
  }

  // private toBase64(file: File) {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = error => reject(error);
  //   });
  // }
}
