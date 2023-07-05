import {Injectable} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ChartSizeService {
  constructor(
  ) {}

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

  getDashboardChartSize(breakpointLarge = 1200,
                        breakpointMedium = 800,
                        screenWidth: number): [number, number] {
    let chartWidth: number;
    if (screenWidth >= breakpointLarge) {
      chartWidth = Math.floor(screenWidth / 3) - 40;
    } else if (screenWidth >= breakpointMedium) {
      chartWidth = Math.floor(screenWidth / 2) - 40;
    } else {
      chartWidth = screenWidth - 60;
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
