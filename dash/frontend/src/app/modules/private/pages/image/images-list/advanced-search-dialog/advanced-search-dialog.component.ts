import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatCheckboxChange} from '@angular/material/checkbox';

@Component({
  selector: 'app-advanced-search-dialog',
  templateUrl: './advanced-search-dialog.component.html',
  styleUrls: ['./advanced-search-dialog.component.scss']
})
export class AdvancedSearchDialogComponent implements OnInit {

  searchForm: FormGroup;
  isChecked = false;

  constructor(private dialogRef: MatDialogRef<AdvancedSearchDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {imageName: string, cve: string, onlyRunning: boolean},
              private formBuilder: FormBuilder,
              protected dialog: MatDialog,
              ) { }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      name: [''],
      cve: [''],
      onlyRunning: []
    });

    // if data is available from the image scan detail page with cve, fill in the fields
    if ( this.data.imageName ){
      localStorage.setItem('image-search-name', this.data.imageName);
    }
    if ( this.data.cve ){
      localStorage.setItem('image-search-cve', this.data.cve);
    }

    if ( this.data.onlyRunning !== undefined ) {
      localStorage.setItem('image-search-running-image', JSON.stringify(this.data.onlyRunning));
      this.searchForm.get('onlyRunning').setValue(this.data.onlyRunning);
    }

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
