import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {Observable, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, map, shareReplay, tap} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ChartSizeService implements OnInit, OnDestroy {
  protected readonly unsubscribe$ = new Subject<void>();
  private currentBreakpoint: any;
  readonly currentBreakpoint$ = this.breakpointObserver
    .observe([
      Breakpoints.XLarge, Breakpoints.Large,
      Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall
    ])
    .pipe(
      map(value => {
        console.log('new breakpoint:', value);
        return value;
      }),
      shareReplay(),
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit() {
    // console.log('helloworld');
    // console.log('current breakpoint: ', this.currentBreakpoint);
    this.currentBreakpoint$.subscribe(value => {
      console.log('subscription shows a new breakpoint', value);
      this.updateBreakpoint();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateBreakpoint() {
    if (this.breakpointObserver.isMatched(Breakpoints.XLarge)) {
      this.currentBreakpoint = Breakpoints.XLarge;
    } else if (this.breakpointObserver.isMatched(Breakpoints.Large)) {
      this.currentBreakpoint = Breakpoints.Large;
    } else if (this.breakpointObserver.isMatched(Breakpoints.Medium)) {
      this.currentBreakpoint = Breakpoints.Medium;
    } else if (this.breakpointObserver.isMatched(Breakpoints.Small)) {
      this.currentBreakpoint = Breakpoints.Small;
    } else if (this.breakpointObserver.isMatched(Breakpoints.XSmall)) {
      this.currentBreakpoint = Breakpoints.XSmall;
    }
  }

  // getReportChartSize(cardHeight: number, cardWidth: number): [number, number] {
  //   let chartWidth: number, chartHeight: number;
  //
  //   return [chartWidth, chartHeight];
  // }

  /** Get the size for fullscreen charts displayed on the reports pages based on
   * the current window size
   */
  getReportChartSize(screenWidth: number): [number, number] {
    let chartWidth: number;
    if (screenWidth < 600) {
      chartWidth = 600;
    } else if (screenWidth > 2000) {
      chartWidth = 1950;
    } else {
      chartWidth = screenWidth - 110;
    }
    // Keep the chart at a consistent aspect ratio through window size changes
    const chartHeight = Math.floor((chartWidth * 7) / 16);
    return [chartWidth, chartHeight];
  }
}
