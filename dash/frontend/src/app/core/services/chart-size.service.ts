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

  calculateNumElementsInRow(numElementsByScreenSize: {xs: number, s: number, m: number, l: number, xl: number}): number {
    let numElements = 1;
    switch (this.currentBreakpoint) {
      case Breakpoints.XSmall:
        numElements = numElementsByScreenSize.xs;
        break;
      case Breakpoints.Small:
        numElements = numElementsByScreenSize.s;
        break;
      case Breakpoints.Medium:
        numElements = numElementsByScreenSize.m;
        break;
      case Breakpoints.Large:
        numElements = numElementsByScreenSize.l;
        break;
      case Breakpoints.XLarge:
        numElements = numElementsByScreenSize.xl;
        break;
      default:
        numElements = numElementsByScreenSize.l;
        break;
    }
    return numElements ? numElements : 1;
  }

  getChartSize(
    componentScreenWidthInPx: number,
    numElementsInRowByScreenSize = {
      xs: 1, s: 1,
      m: 2,
      l: 3, xl: 3
    },
    pageMarginPlusPaddingInPx = {
      left: 40, right: 40
    },
    rowMarginPlusPaddingInPx = {
      left: 30, right: 20
    },
    betweenChartMarginPlusPaddingInPx = {
      left: 10, right: 10
    },
    chartMarginPlusPaddingInPx = {
      left: 10, right: 10
    }
  ): [number, number] {
    console.log('current breakpoint: ', this.currentBreakpoint);
    const spaceInRow = componentScreenWidthInPx - pageMarginPlusPaddingInPx.left - pageMarginPlusPaddingInPx.right - rowMarginPlusPaddingInPx.left - rowMarginPlusPaddingInPx.right;
    const numElementsInRow = this.calculateNumElementsInRow(numElementsInRowByScreenSize);
    const sumOfSpaceBetweenGraphs = (betweenChartMarginPlusPaddingInPx.left + betweenChartMarginPlusPaddingInPx.right) * (numElementsInRow - 1);
    const sumOfSpaceOnGraphs = (chartMarginPlusPaddingInPx.left + chartMarginPlusPaddingInPx.right) * numElementsInRow;
    const spaceForAllGraphs = spaceInRow - sumOfSpaceBetweenGraphs - sumOfSpaceOnGraphs;
    const chartWidth = Math.floor(spaceForAllGraphs / numElementsInRow);

    // Keep the chart at a consistent aspect ratio through window size changes
    const chartHeight = Math.floor((chartWidth * 8) / 16);
    return [chartWidth, chartHeight];
  }

  getDashboardChartSize(
    fullScreenWidth: number,
    chartScreenWidth: number,
    marginPaddingOnScreen = 40,
    paddingLeftOfGraphsInPx = 30,
    paddingRightOfGraphsInPx = 20,
    paddingOnGraphsInPx: number,
    marginBetweenGraphsInPx = 10,
    breakpointLarge = 1200,
    breakpointMedium = 800,
  ): [number, number] {  // returns [chartWidth, chartHeight]
    console.log('current breakpoint: ', this.currentBreakpoint);
    let screenToWorkWith = chartScreenWidth - marginPaddingOnScreen - paddingLeftOfGraphsInPx - paddingRightOfGraphsInPx;
    let chartWidth;
    if (fullScreenWidth > breakpointLarge) {
      screenToWorkWith -= (marginBetweenGraphsInPx * 2);
      screenToWorkWith -= (paddingOnGraphsInPx * 3);
      chartWidth = Math.floor(screenToWorkWith / 3);
    } else if (fullScreenWidth > breakpointMedium) {
      screenToWorkWith -= marginBetweenGraphsInPx;  // aka (marginBetweenGraphsInPx * 1)
      screenToWorkWith -= (paddingOnGraphsInPx * 2);
      chartWidth = Math.floor(screenToWorkWith / 2);
    } else {
      screenToWorkWith -= paddingOnGraphsInPx;  // aka (paddingOnGraphsInPx * 1)
      chartWidth = Math.floor(screenToWorkWith);
    }
    // Keep the chart at a consistent aspect ratio through window size changes
    const chartHeight = Math.floor((chartWidth * 8) / 16);
    return [chartWidth, chartHeight];
  }


}
