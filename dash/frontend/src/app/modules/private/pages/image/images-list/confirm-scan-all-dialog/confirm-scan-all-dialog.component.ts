import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-confirm-scan-all-dialog',
  templateUrl: './confirm-scan-all-dialog.component.html',
  styleUrls: ['./confirm-scan-all-dialog.component.scss']
})
export class ConfirmScanAllDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ConfirmScanAllDialogComponent>,
              protected dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  selectedImages: number[];

  ngOnInit(): void {
    // set all images as selected by default
    this.selectedImages = this.data.images.map(image => image.id);
  }

  onConfirm() {
    this.dialogRef.close({continue: true, selectedImages: this.selectedImages});
  }

  onCancel() {
    this.dialogRef.close({continue: false});
  }
}
