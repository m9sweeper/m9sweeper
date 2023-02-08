import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from '@full-fledged/alerts';
import { ImageService } from '../../../../../core/services/image.service';
import { DockerRegistriesService } from '../../../../../core/services/docker-registries.service';
import { IDockerRegistries } from '../../../../../core/entities/IDockerRegistries';
import { CustomValidators } from '../../../form-validator/custom-validators';
import { IServerResponse } from '../../../../../core/entities/IServerResponse';
import { Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-create-image',
  templateUrl: './create-image.component.html',
  styleUrls: ['./create-image.component.scss'],
})

export class CreateImageComponent implements OnInit {
  imageForm: UntypedFormGroup;
  subMenuTitle = 'Create Image';
  urlPattern = /^(https:\/\/?|http:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
  clusterId: number;
  dockerRegistries: IDockerRegistries[];

  constructor(
    private dialogRef: MatDialogRef<CreateImageComponent>,
    private formBuilder: UntypedFormBuilder,
    private imageService: ImageService,
    private dockerRegistriesService: DockerRegistriesService,
    private alertService: AlertService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.imageForm = this.formBuilder.group({
      name: ['', [CustomValidators.requiredNoTrim, Validators.maxLength(250)]],
      url: ['', [Validators.required, Validators.pattern(this.urlPattern)]],
      fullUrl: ['', [Validators.required]],
      tag: ['', CustomValidators.requiredNoTrim],
      registryId : ['']
    });
  }

  ngOnInit(): void {
    this.clusterId = this.data.clusterId;
  }

  onNoClick(){
    this.dialogRef.close({cancel: true});
  }

  parseURL(event) {
    const rawUrl: string = this.imageForm.get('fullUrl').value;
    const splitOnColon = rawUrl.split(':');
    let imageTag = '';
    if (splitOnColon.length > 1) {
      imageTag = splitOnColon[splitOnColon.length - 1];
    }
    if (!imageTag) { imageTag = 'latest'; }
    const splitOnSlash = splitOnColon[0].split('/');
    let containerRegistry = 'docker.io';
    if (splitOnSlash[0].split('.').length > 1) {
      containerRegistry = splitOnSlash.shift();
    }
    let containerPath = '';
    while (splitOnSlash.length > 1) {
      containerPath += `${splitOnSlash.shift()}/`;
    }
    containerPath += splitOnSlash.shift();
    // console.log({containerRegistry, containerPath, imageTag});
    this.imageForm.get('url').setValue(containerRegistry);
    this.imageForm.get('name').setValue(containerPath);
    this.imageForm.get('tag').setValue(imageTag);
  }

  onSubmit() {
    const image = this.imageForm.getRawValue();
    delete image.registryId;
    this.imageService.postImageModule(this.clusterId, {
      url: image.url,
      name: image.name,
      tag: image.tag,
      runningInCluster: false
    }).pipe(take(1))
      .subscribe((response) => {
      if (response.success) {
        this.alertService.success('Image created successfully');
      }
    }, error => {
      this.alertService.danger(error.error.message);
    }, () => {
      this.dialogRef.close();
    });
  }

  openDockerRegistriesPage() {
    this.dialogRef.close();
    this.router.navigate(['/private', 'docker-registries']);
  }
}
