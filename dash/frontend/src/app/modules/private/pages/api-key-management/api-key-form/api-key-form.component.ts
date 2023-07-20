import { Component, OnInit } from '@angular/core';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '@full-fledged/alerts';
import { ApiKeyService } from '../../../../../core/services/api-key.service';
import { UserService } from '../../../../../core/services/user.service';
import { IServerResponse } from '../../../../../core/entities/IServerResponse';
import { IApiKey } from '../../../../../core/entities/IApiKey';
import {IAPIKeyUser} from '../../../../../core/entities/IUser';
import {Location} from '@angular/common';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-api-key-form',
  templateUrl: './api-key-form.component.html',
  styleUrls: ['./api-key-form.component.scss']
})
export class ApiKeyFormComponent implements OnInit {
  apiKeyForm: FormGroup;
  subMenuTitle = 'Create API Key';
  isEdit = false;
  apiKeyId = null;

  apiKeyData: IApiKey;
  userList: IAPIKeyUser[];

  constructor(
    private formBuilder: FormBuilder,
    private apiKeyService: ApiKeyService,
    private userService: UserService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.isEdit = this.router.url.indexOf('private/api-key/edit/') !== -1;
    this.apiKeyId = +this.route.snapshot.paramMap.get('id');

    this.apiKeyForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      isActive: [true, Validators.nullValidator],
      userId: ['', [Validators.required]]
    });

    if (this.isEdit) {
      this.populateApiKeyForm(this.apiKeyId);
      this.subMenuTitle = 'Edit API Key';
    } else {
      this.subMenuTitle = 'Create API Key';
    }
    this.loadUserList();
  }

  loadUserList(): void {
    this.userService.loadAllActiveUsers()
      .pipe(take(1))
      .subscribe({
        next: response => this.userList = response.data
      });
  }

  populateApiKeyForm(apiKeyId): void {
    this.apiKeyService.getApiKeyById(apiKeyId)
      .pipe(take(1))
      .subscribe({
        next: (response: IServerResponse<IApiKey>) => {
          this.apiKeyData = response.data[0];
          this.apiKeyForm.get('name').setValue(this.apiKeyData.name);
          this.apiKeyForm.get('isActive').setValue(this.apiKeyData.isActive);
          this.apiKeyForm.get('userId').setValue(this.apiKeyData.userId);
        },
        error: error => {
          this.alertService.danger(error.error.message);
          this.router.navigate(['/private/api-key']);
        }
    });
  }
  cancel() {
    this.location.back();
  }

  onSubmit(): void {
    if (!this.isEdit) {
      const data: IApiKey = {
        name: this.apiKeyForm.get('name').value,
        userId: this.apiKeyForm.get('userId').value,
        isActive: this.apiKeyForm.get('isActive').value,
      };

      this.apiKeyService.addApiKey(data)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.alertService.success('Api Key created successfully.');
            this.router.navigate(['/private/api-key']);
          },
          error: error => {
            this.alertService.danger(error.error.message);
          }
        });
    } else {
      const data: IApiKey = {
        name: this.apiKeyForm.get('name').value,
        userId: this.apiKeyData.userId,
        isActive: this.apiKeyForm.get('isActive').value,
      };

      this.apiKeyService.updateApiKey(this.apiKeyData.id, data)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.alertService.success('Api Key updated successfully.');
            this.router.navigate(['/private/api-key']);
          },
          error: error => {
            this.alertService.danger(error.error.message);
          }
      });
    }
  }
}
