import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AlertService} from '@full-fledged/alerts';
import {MatLegacyCheckboxChange as MatCheckboxChange} from '@angular/material/legacy-checkbox';

@Component({
  selector: 'app-advanced-search-dialog',
  templateUrl: './advanced-search-dialog.component.html',
  styleUrls: ['./advanced-search-dialog.component.scss']
})
export class AdvancedSearchDialogComponent implements OnInit {

  searchForm: UntypedFormGroup;
  isChecked = false;

  constructor(private dialogRef: MatDialogRef<AdvancedSearchDialogComponent>,
              private formBuilder: UntypedFormBuilder,
              private alertService: AlertService,
              protected dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      name: [''],
      cve: [''],
      onlyRunning: []
    });

    const searchName = localStorage.getItem('image-search-name');
    if (searchName){
      this.searchForm.get('name').setValue(searchName);
    }
    const searchCve = localStorage.getItem('image-search-cve');
    if (searchCve){
      this.searchForm.get('cve').setValue(searchCve);
    }
    const searchRunningImage = JSON.parse(localStorage.getItem('image-search-running-image'));
    this.searchForm.get('onlyRunning').setValue(searchRunningImage);
  }

  onSearch() {
    const storageArray = [];

    const searchImageText = this.searchForm.get('name').value;
    localStorage.setItem('image-search-name', searchImageText);
    const searchCveText = this.searchForm.get('cve').value;
    localStorage.setItem('image-search-cve', searchCveText);

    const searchRunningImage = this.searchForm.get('onlyRunning').value;
    localStorage.setItem('image-search-running-image', JSON.stringify(searchRunningImage));

    this.dialogRef.close(this.searchForm.value);
  }

  onCancel() {
    this.dialogRef.close();
  }

  onlyRunningImage(event: MatCheckboxChange){
   this.isChecked = !this.isChecked;
  }
}
