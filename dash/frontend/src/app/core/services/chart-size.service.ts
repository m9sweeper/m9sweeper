import {HostListener, Injectable, OnDestroy, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {Observable, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, map, shareReplay, tap} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ChartSizeService {
  currentScreenWidthInPx: number;
  currentScreenWidthInEM: number;

  private FlexBoxMinWidthsInEm = {
    XSmall: 0,
    Small: 48,
    Medium: 62,
    Large: 75,
  };

  constructor() {
    this.calculateScreenWidth();
  }

  private calculateScreenWidth() {
    const fullHTML = document.getElementsByTagName('html').item(0) as HTMLElement;
    const computedFontSize = window.getComputedStyle(fullHTML).fontSize;
    const computedFontNumber = parseFloat(computedFontSize.split('px')[0]);  // pull off the 'px' and parse
    const windowWidthInEm = (window.innerWidth / computedFontNumber);

    this.currentScreenWidthInPx = window.innerWidth;
    this.currentScreenWidthInEM = windowWidthInEm;
  }

  private calculateNumElementsInRow(
    numElementsByScreenSize: {xs: number, s: number, m: number, l: number}
  ): number {
    this.calculateScreenWidth();
    let numElements = 1;
    if (this.currentScreenWidthInEM > this.FlexBoxMinWidthsInEm.Large) {
      numElements = numElementsByScreenSize.l;
    } else if (this.currentScreenWidthInEM > this.FlexBoxMinWidthsInEm.Medium) {
      numElements = numElementsByScreenSize.m;
    } else if (this.currentScreenWidthInEM > this.FlexBoxMinWidthsInEm.Small) {
      numElements = numElementsByScreenSize.s;
    } else {
      numElements = numElementsByScreenSize.xs;
    }
    console.log({
      FlexBoxMinWidthsInEm: this.FlexBoxMinWidthsInEm,
      currentScreenWidthInEM: this.currentScreenWidthInEM,
      numElements,
    });
    return numElements ? numElements : 1;
  }

  getChartSize(
    componentScreenWidthInPx: number,
    numElementsInRowByScreenSize = {
      xs: 1, s: 1,
      m: 2, l: 3,
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
    console.log({ componentScreenWidthInPx, numElementsInRowByScreenSize, pageMarginPlusPaddingInPx, rowMarginPlusPaddingInPx, betweenChartMarginPlusPaddingInPx, chartMarginPlusPaddingInPx });
    const numElementsInRow = this.calculateNumElementsInRow(numElementsInRowByScreenSize);
    console.log('new method, # charts per row', numElementsInRow);
    const spaceInRow = componentScreenWidthInPx - pageMarginPlusPaddingInPx.left - pageMarginPlusPaddingInPx.right - rowMarginPlusPaddingInPx.left - rowMarginPlusPaddingInPx.right;
    console.log('new method space in row: ', spaceInRow);
    const sumOfSpaceBetweenGraphs = (betweenChartMarginPlusPaddingInPx.left + betweenChartMarginPlusPaddingInPx.right) * (numElementsInRow - 1);
    const sumOfSpaceOnGraphs = (chartMarginPlusPaddingInPx.left + chartMarginPlusPaddingInPx.right) * numElementsInRow;
    const spaceForAllGraphs = spaceInRow - sumOfSpaceBetweenGraphs - sumOfSpaceOnGraphs;
    console.log('new method, sums', sumOfSpaceBetweenGraphs, sumOfSpaceOnGraphs);
    const chartWidth = Math.floor(spaceForAllGraphs / numElementsInRow);

    // Keep the chart at a consistent aspect ratio through window size changes
    const chartHeight = Math.floor((chartWidth * 8) / 16);
    return [chartWidth, chartHeight];
  }
}
