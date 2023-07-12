import {Component, Inject} from '@angular/core';
import { Router } from '@angular/router';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {take} from 'rxjs/operators';
import {Observable} from 'rxjs';

interface AlertDialogData {
  functionToRun?: Observable<any>;
  afterRoute?: string[];
  reload?: boolean;
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss']
})
export class AlertDialogComponent {

  constructor(private matDialogRef: MatDialogRef<AlertDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: AlertDialogData,
              private router: Router) { }

  onSubmit(){
    if (this.data?.functionToRun) {
      this.data.functionToRun
        .pipe(take(1))
        .subscribe({
          next: result => console.log(result)
        });
    }
    this.matDialogRef.close(true);
    if (this.data?.afterRoute?.length > 0) {
      this.router.navigate(this.data.afterRoute);
    } else if (this.data?.reload) {
      window.location.reload();
    }
  }

  cancel(){
    this.matDialogRef.close(false);
  }

}
