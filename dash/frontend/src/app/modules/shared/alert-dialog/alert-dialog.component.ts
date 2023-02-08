import {Component, Inject, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-alert',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss']
})
export class AlertDialogComponent implements OnInit {

  constructor(private matDialogRef: MatDialogRef<AlertDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private router: Router) { }

  ngOnInit(): void {
  }

  onSubmit(){
    this.data.functionToRun.subscribe(result => console.log(result));
    this.matDialogRef.close(true);
    if (this.data.afterRoute.length > 0) {
      this.router.navigate(this.data.afterRoute);
    } else if (this.data.reload) {
      window.location.reload();
    }
  }

  onNoClick(){
    this.matDialogRef.close(false);
  }

}
