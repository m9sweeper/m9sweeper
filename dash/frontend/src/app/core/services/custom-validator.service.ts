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

  /** Group level validator. Requires the at least one of the controls with the specified keys to have meet its criteria */
  atLeastOne(params: { key: string, condition: (val: any) => boolean}[]): ValidatorFn {
    return (group: FormGroup) => {
      const controls = group?.controls;
      const exists = params.some(param => {
        return param.condition(controls?.[param.key]?.value);
      });
      return exists ? null : { atLeastOne: true };
    };
  }

  regex(control: AbstractControl): { regex: boolean } {
    if (!control.value) {
      return null;
    }
    try {
      const r = new RegExp(control.value);
      return null;
    } catch (e) {
      return { regex: true };
    }
  }
}
