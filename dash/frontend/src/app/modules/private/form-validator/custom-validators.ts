import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';
import {IScanner} from '../../../core/entities/IScanner';

export class CustomValidators {

  static requiredNoTrim(control: AbstractControl) {
    return ((control.value) && control.value.trim() === '' || control.value.length === 0) ? {required: true} : null;
  }

  static checkPasswordAndConfirmPassword(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({mustMatch: true});
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  static checkForCurrentDate(isEdit= false, currentDate = 0): ValidatorFn {
    if (isEdit) {
      return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        const currentControlDate = new Date(currentDate);
        const formattedCurrentDate = `${currentControlDate.getMonth() + 1}-${currentControlDate.getDate()}-${currentControlDate.getFullYear()}`;
        const inputDate = new Date(value);
        const formattedInputDate = `${inputDate.getMonth() + 1}-${inputDate.getDate()}-${inputDate.getFullYear()}`;
        if (formattedCurrentDate > formattedInputDate) {
          return {inputDateIsToday: true};
        }
        return null;
      };
    }
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const today = isEdit ? new Date() : new Date();
      const formattedToday = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;
      const inputDate = new Date(value);
      const formattedInputDate = `${inputDate.getMonth() + 1}-${inputDate.getDate()}-${inputDate.getFullYear()}`;
      if (formattedToday > formattedInputDate) {
        return {inputDateIsToday: true};
      }
      return null;
    };
  }

  static validateActivePolicyScanners(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const policyActive = control.get('enabled');
      const scanners = control.get('scanners');
      // if a policy is marked as active, ensure it has at least one active scanner
      if (policyActive.value && !scanners.value.some((scanner: IScanner) => scanner.enabled)) {
        return {activePolicyHasActiveScanner: true};
      }
      return null;
    };
  }

  static checkEndDateIsGreaterThanStartDate(): ValidatorFn {
    return (form: FormGroup): ValidationErrors | null => {
      const start = new Date(form.get('startDate').value);
      const end = new Date(form.get('endDate').value);
      const endDateFieldValue = form.get('endDate').value;
      if (!endDateFieldValue) { return null; }
      if (start && end) {
        if (end.getTime() - start.getTime() > 0) {
          form.get('endDate').setErrors(null);
          return null;
        }
      }
      const error = {checkEndDateIsGreaterThanStartDate: true};
      form.get('endDate').setErrors(error);
      return error;
    };
  }
}

