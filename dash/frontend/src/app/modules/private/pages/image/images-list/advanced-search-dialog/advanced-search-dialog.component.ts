import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertService} from '@full-fledged/alerts';

@Component({
  selector: 'app-advanced-search-dialog',
  templateUrl: './advanced-search-dialog.component.html',
  styleUrls: ['./advanced-search-dialog.component.scss']
})
export class AdvancedSearchDialogComponent implements OnInit {

  searchForm: FormGroup;

  constructor(private dialogRef: MatDialogRef<AdvancedSearchDialogComponent>,
              private formBuilder: FormBuilder,
              private alertService: AlertService,
              protected dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      name: [''],
      cve: [''],
      onlyRunning: [true]
    });

    const searchTexts = JSON.parse(localStorage.getItem('text'));

    if (searchTexts[0]){
      this.searchForm.get('name').setValue(searchTexts[0]);
    }
    if (searchTexts[1]){
      this.searchForm.get('cve').setValue(searchTexts[1]);
    }
  }

  onSearch() {
    const storageArray = [];

    const searchImageText = this.searchForm.get('name').value;
    storageArray.push(searchImageText);
    const searchCveText = this.searchForm.get('cve').value;
    storageArray.push(searchCveText);
    localStorage.setItem('text', JSON.stringify(storageArray));

    this.dialogRef.close(this.searchForm.value);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
