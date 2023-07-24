import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter, pairwise} from 'rxjs/operators';

@Component({
  selector: 'app-datepicker-component',
  templateUrl: './datepicker.component.html',
  styleUrls: [
    './datepicker.component.scss',
  ]
})
export class DatepickerComponent implements OnInit {
  @Input() initialDate = new Date();
  @Input() allowFutureDate = true;

  @Output() newDateSelected: EventEmitter<{ isToday: boolean, desiredDate: Date, startTime: number, endTime: number }> = new EventEmitter();

  limit = 10;
  page = 0;
  today = new Date();
  datePickerFilled = false;
  currentlySelectedDate = new Date();

  constructor(
    private router: Router,
  ) {
    this.setInitialDatepickerValue();
  }

  ngOnInit() {}

  setInitialDatepickerValue() {
    console.log('datepicker setInitialDatepickerValue');
    const currentUrl = this.router.url;
    const urlPieces = currentUrl.split('/');
    const includesWorkloadPath = urlPieces.includes('kubernetes-namespaces');
    const storedDateAsNumber = parseInt(localStorage.getItem('dateSearchTerm'), 10);

    if (includesWorkloadPath && storedDateAsNumber) {
      this.currentlySelectedDate = new Date(storedDateAsNumber);
    } else {
      this.currentlySelectedDate = this.today;
    }

    this.emitEvent();
  }

  clearDatepicker() {
    this.currentlySelectedDate = null;
    this.datePickerFilled = false;
    localStorage.setItem('dateSearchTerm', this.today.valueOf().toString());
    const mutableDate = new Date(this.today.getTime());
    const startTime = mutableDate.setHours(0, 0, 0, 0).valueOf();
    const endTime = mutableDate.setHours(23, 59, 59, 999).valueOf();
    this.newDateSelected.emit({
      isToday: true,
      desiredDate: this.today,
      startTime,
      endTime
    });
  }

  dateChange(event) {
    this.currentlySelectedDate = event?.value ? new Date(event.value) : this.today;
    this.emitEvent();
  }

  emitEvent() {
    localStorage.setItem('dateSearchTerm', this.currentlySelectedDate.valueOf().toString());
    const isToday = (
      this.today.getFullYear() === this.currentlySelectedDate.getFullYear() &&
      this.today.getMonth() === this.currentlySelectedDate.getMonth() &&
      this.today.getDate() === this.currentlySelectedDate.getDate()
    );
    this.datePickerFilled = true;
    const mutableDate = new Date(this.currentlySelectedDate.getTime());
    const startTime = mutableDate.setHours(0, 0, 0, 0).valueOf();
    const endTime = mutableDate.setHours(23, 59, 59, 999).valueOf();
    this.newDateSelected.emit({isToday, desiredDate: this.currentlySelectedDate, startTime, endTime});
  }
}
