import {Injectable} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ChartSizeService {
  constructor(
  ) {}

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

  // marginPaddingOnScreen defaults to 20px on each side
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

  getIncidenceRateChartSize(breakpointMedium = 800,
                            screenWidth: number): [number, number] {
    let chartWidth: number;
    if (screenWidth >= breakpointMedium) {
      chartWidth = Math.floor(screenWidth / 2) - 100;
    } else {
      chartWidth = screenWidth - 110;
    }
    const chartHeight = Math.floor((chartWidth * 8) / 16);
    return [chartWidth, chartHeight];
  }
}
