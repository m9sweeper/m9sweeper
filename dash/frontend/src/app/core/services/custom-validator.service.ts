import {Injectable} from '@angular/core';
import {AbstractControl} from '@angular/forms';
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
}
