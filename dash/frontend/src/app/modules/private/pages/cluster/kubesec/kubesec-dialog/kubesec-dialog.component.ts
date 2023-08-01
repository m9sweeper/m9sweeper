import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-kubesec-dialog',
  templateUrl: './kubesec-dialog.component.html',
  styleUrls: ['./kubesec-dialog.component.scss']
})
export class KubesecDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public kubesecReport,
  ) {}
}
