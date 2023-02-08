import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {MatLegacyChipInputEvent as MatChipInputEvent} from '@angular/material/legacy-chips';
import {MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent, MatLegacyAutocomplete as MatAutocomplete} from '@angular/material/legacy-autocomplete';
import {AlertService} from '@full-fledged/alerts';
import {ClusterService} from '../../../../../core/services/cluster.service';
import {ITag} from '../../../../../core/entities/ITag';
import {TagService} from '../../../../../core/services/tag.service';
import {map, take, takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {CustomValidators} from '../../../form-validator/custom-validators';
import {IKubeConfig} from '../../../../../core/entities/IKubeConfig';
import {environment} from '../../../../../../environments/environment';


@Component({
  selector: 'app-cluster-edit',
  templateUrl: './cluster-edit.component.html',
  styleUrls: ['./cluster-edit.component.scss']
})

export class ClusterEditComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  createClusterForm: UntypedFormGroup;
  selectable = true;
  removable = true;
  tags: any[];
  displayedTags = [];
  filteredTags: Observable<any[]>;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  tagFormCtrl = new UntypedFormControl();
  azureColorSchema = ['#004C1A', '#AA0000', '#2F6C71', '#B600A0', '#008272', '#001E51', '#004B51'];

  config: IKubeConfig;

  constructor(private dialogRef: MatDialogRef<ClusterEditComponent>,
              private formBuilder: UntypedFormBuilder,
              private alertService: AlertService,
              private clusterService: ClusterService,
              private tagService: TagService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.createClusterForm = this.formBuilder.group({
      name: [data.name ? data.name : '', [CustomValidators.requiredNoTrim, Validators.maxLength(100)]],
      groupId: [data.groupId, [Validators.required]],
      gracePeriodDays: [data.gracePeriodDays ? data.gracePeriodDays : 0, [Validators.nullValidator] ]
    });
  }

  ngOnInit(): void {
    if (this.data.isEdit) {
      this.displayedTags = this.data.tags ? this.data.tags : [];
    }
    this.tagService.getAllTags()
      .pipe(take(1))
      .subscribe(response => {
        this.tags = response.data ? response.data : [];
        this.filteredTags = this.tagFormCtrl.valueChanges.pipe(
          map((d: any) => d ? this._filter(d) : this.tags.slice()),
          takeUntil(this.unsubscribe$));
    });
  }

  cancel() {
    this.dialogRef.close({cancel: true});
  }

  onSubmit() {
    if (!environment.production) {
      console.log('Tags', this.displayedTags, this.createClusterForm.getRawValue());
    }
    this.createClusterForm.value.name = this.createClusterForm.value.name.trim();
    this.createClusterForm.value.gracePeriodDays = Number(this.createClusterForm.value.gracePeriodDays);
    if (this.data.isEdit) {
      this.clusterService.updateCluster({...this.createClusterForm.value, tags: JSON.stringify(this.displayedTags)},
        this.data.clusterId)
        .pipe(take(1))
        .subscribe((response) => {
          this.alertService.success('Cluster updated successfully');
          this.dialogRef.close();
        }, error => {
          this.alertService.danger(error.error.message);
        });
    } else {
      this.clusterService.createCluster({...this.createClusterForm.value, tags: JSON.stringify(this.displayedTags)})
        .subscribe((response) => {
          this.alertService.success('Cluster added successfully');
          this.dialogRef.close();
        }, error => {
          this.alertService.danger(error.error.message);
        });
    }
  }

  addTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if (value?.trim()) {
      this.tagService.createTag({name: value.trim(), groupId: this.createClusterForm.controls.groupId.value})
        .subscribe(response => {
          // console.log({response});
          if (!this.displayedTags.includes(value)) {
            this.displayedTags.push({name: value.trim(), id: response.data.id, groupId: response.data.groupId});
          }
        }, error => {
          // console.log({error});
          this.alertService.warning(error?.error?.message);
        });
    }
    if (input) {
      input.value = '';
    }

    this.tagFormCtrl.setValue(null);
  }

  removeTag(tag: ITag): void {
    const index = this.displayedTags.indexOf(tag);
    if (index >= 0) {
      this.displayedTags.splice(index, 1);
    }
    this.tagService.deleteTag(tag.id, this.data.clusterId)
      .pipe(take(1))
      .subscribe(() => {});
  }

  addAutocompleteSuggestionToTags(event: MatAutocompleteSelectedEvent): void {
    if (!this.displayedTags.includes(event.option.value)) {
      this.displayedTags.push(event.option.value);
    }
    this.tagInput.nativeElement.value = '';
    this.tagFormCtrl.setValue(null);
  }

  // Auto complete (finds any existing tags that starts with what the user has already typed)
  private _filter(value) {
    return this.tags.filter(tag => {
      return tag.name.toLowerCase().indexOf(value.length ? value.toLowerCase() : value.name.toLowerCase()) === 0;
    });
  }

  calculateMenuColor(rowIndex: number) {
    if (rowIndex < 5) {
      return this.azureColorSchema[rowIndex];
    }
    return this.azureColorSchema[rowIndex % 7];
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
