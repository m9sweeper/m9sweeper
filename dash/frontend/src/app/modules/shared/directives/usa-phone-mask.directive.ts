import { Directive, Input, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


// adapted from https://stackblitz.com/edit/angular-phone-mask-directive
@Directive({
  selector: '[USAPhoneMask]'
})
export class USAPhoneMaskDirective implements OnInit, OnDestroy {

  // tslint:disable:variable-name
  private _phoneControl: AbstractControl;
  private _previousValue: string;
  // tslint:enable:variable-name

  @Input()
  set phoneControl(control: AbstractControl) {
    this._phoneControl = control;
  }
  @Input()
  set currentValue(value: string) {
    this._previousValue = value;
  }

  private unsubscribe$ = new Subject<void>();

  ngOnInit(){
    this.phoneValidate();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  phoneValidate() {
    this._phoneControl.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(newPhoneNumberValue => {
        // strip non-numbers
        let newVal = newPhoneNumberValue.replace(/\D/g, '');

        // limit the length to the standard US format: (123) 456-7890 = 10 numerical characters
        newVal = newVal.substring(0, 10);

        if (!newVal.length) {
          this._phoneControl.patchValue(newVal, {emitEvent: false, onlySelf: true});
          return;
        }

        // only add punctuation AFTER the next number is added, or it causes weirdness with backspacing
        if (newVal.length <= 3) {
          newVal = newVal.replace(/^(\d{0,3})/, '($1');
        } else if (newVal.length <= 6) {
          newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '($1) $2');
        } else if (newVal.length > 6) {
          newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(.*)/, '($1) $2-$3');
        }
        // update the value without triggering valueChanges (would start an infinite loop)
        this._phoneControl.patchValue(newVal, {emitEvent: false, onlySelf: true});
      });
  }
}
