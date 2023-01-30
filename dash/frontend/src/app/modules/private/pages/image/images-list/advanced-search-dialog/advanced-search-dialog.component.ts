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
    const savedText = localStorage.getItem('text');
    if (savedText){
      this.searchForm.get('cve').setValue(savedText);
    }

  }

  onSearch() {

    const searchText = this.searchForm.get('cve').value;
    localStorage.setItem('text', searchText);

    this.dialogRef.close(this.searchForm.value);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
