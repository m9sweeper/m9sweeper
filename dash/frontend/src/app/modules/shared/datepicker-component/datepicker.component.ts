import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter, pairwise} from 'rxjs/operators';
import {merge} from 'rxjs';

@Component({
  selector: 'app-datepicker-component',
  templateUrl: './datepicker.component.html',
  styleUrls: [
    './datepicker.component.scss',
  ]
})
export class DatepickerComponent implements OnInit {
  @Input() initialDate = new Date();

  @Output() newDateSelected: EventEmitter<{ isToday: boolean, desiredDate: Date, startTime: number, endTime: number }> = new EventEmitter();

  limit = 10;
  page = 0;
  today = new Date();
  datePickerFilled = false;
  currentlySelectedDate = new Date();

  constructor(
    private router: Router,
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      pairwise()
    ).subscribe((event: any[]) => {
      const previousUrl = event[0].url.split('/').includes('kubernetes-namespaces');
      if (previousUrl) {
        const desiredDate = parseInt(localStorage.getItem('dateSearchTerm'), 10);
        console.log({previousDateExists: desiredDate});
        this.emitEvent(new Date(desiredDate));
      } else {
        this.setDatepickerToToday();
      }
    });
  }

  setDatepickerToToday() {
    console.log({today: this.today});
    this.emitEvent(this.today);
  }

  dateChange(event) {
    const desiredDate = event?.value ? new Date(event.value) : new Date();
    console.log({event, desiredDate});
    this.emitEvent(desiredDate);
  }

  emitEvent(desiredDate: Date) {
    console.log({emitEventDate: desiredDate, stringified: desiredDate.valueOf().toString()});
    localStorage.setItem('dateSearchTerm', desiredDate.valueOf().toString());
    const isToday = (
      this.today.getFullYear() === desiredDate.getFullYear() &&
      this.today.getMonth() === desiredDate.getMonth() &&
      this.today.getDate() === desiredDate.getDate()
    );
    if (isToday) {
      this.currentlySelectedDate = null;
      this.datePickerFilled = false;
    } else {
      this.currentlySelectedDate = desiredDate;
      this.datePickerFilled = true;
    }
    const mutableDate = new Date(desiredDate.getTime());
    const startTime = mutableDate.setHours(0, 0, 0, 0).valueOf();
    const endTime = mutableDate.setHours(23, 59, 59, 999).valueOf();
    console.log({isToday, desiredDate, startTime, endTime});
    this.newDateSelected.emit({isToday, desiredDate, startTime, endTime});
  }
}
