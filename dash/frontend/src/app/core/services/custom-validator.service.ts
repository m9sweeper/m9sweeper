import {Injectable} from '@angular/core';
import {AbstractControl, FormGroup, ValidatorFn} from '@angular/forms';
import {isFuture, isPast} from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class CustomValidatorService {
  constructor(
  ){}

  dateInPastOrToday(control: AbstractControl): {dateInPast: boolean} {
    if (!control.value) {
      return null;
    }
    if (!isFuture(control.value)) {
      return null;
    } else {
      return {dateInPast: true};
    }
  }

  dateInPast(control: AbstractControl): {dateInPast: boolean} {
    if (!control.value) {
      return null;
    }
    if (isPast(control.value)) {
      return null;
    } else {
      return {dateInPast: true};
    }
  }

  /** Group level validator. Requires the at least one of the controls with the specified keys to have a value */
  atLeastOne(keys: string[]): ValidatorFn {
    return (group: FormGroup) => {
      const controls = group?.controls;
      const exists = keys.some(key => !!controls?.[key]?.value);
      return exists ? null : { atLeastOne: true };
    };
  }
}
