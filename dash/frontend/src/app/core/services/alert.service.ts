import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  defaultConfig: Partial<MatSnackBarConfig> = {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  };

  constructor(
    private snackBarService: MatSnackBar,
  ) {}

  info(message, label = 'close', config?: Partial<MatSnackBarConfig>) {
    this.snackBarService.open(message, label, {
      announcementMessage: message,  // for the text reader
      panelClass: ['info-alert'],
      ...this.defaultConfig,
      ...config,
    });
  }

  success(message, label = 'close', config?: Partial<MatSnackBarConfig>) {
    this.snackBarService.open(message, label, {
      announcementMessage: message,  // for the text reader
      panelClass: ['success-alert'],
      ...this.defaultConfig,
      ...config,
    });
  }

  warning(message, label = 'close', config?: Partial<MatSnackBarConfig>) {
    this.snackBarService.open(message, label, {
      announcementMessage: message,  // for the text reader
      politeness: 'polite',  // for the text reader
      panelClass: ['warning-alert'],
      ...this.defaultConfig,
      ...config,
    });
  }

  danger(message, label = 'close', config?: Partial<MatSnackBarConfig>) {
    this.snackBarService.open(message, label, {
      announcementMessage: message,  // for the text reader
      politeness: 'assertive',  // for the text reader
      panelClass: ['danger-alert'],
      ...this.defaultConfig,
      ...config,
    });
  }

  dangerAlertForHTTPError(error, caller, label = 'close', config?: Partial<MatSnackBarConfig>) {
    let message = '';
    if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.error) {
      message = error.error;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      message = 'There was an error';
      console.log(`There was an error from ${caller}`, error);
    }

    this.snackBarService.open(message, label, {
      announcementMessage: message,  // for the text reader
      politeness: 'assertive',  // for the text reader
      panelClass: ['danger-alert'],
      ...this.defaultConfig,
      ...config,
    });
  }
}
