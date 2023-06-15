import {Injectable} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ChartSizeService {
  constructor(
  ) {}

  /** Get the size for fullscreen charts displayed on the reports pages based on
   * the current window size */
  getReportChartSize(): [number, number] {
    const screenWidth = this.getScreenWidth();
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
                        dashboard = false): [number, number] {
    const screenWidth = this.getScreenWidth(dashboard);
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

  getScreenWidth(dashboard: boolean = false): number {
    // the cluster list page uses a different property to track the size of the internal window than the rest
    // of  the application. Allow users to specify when they need the alternate value
    if (dashboard) {
      return +document.documentElement.style
        .getPropertyValue('--dashboard-container-width')
        .replace('px', '');
    } else {
      return +document.documentElement.style
        .getPropertyValue('--cluster-container-width')
        .replace('px', '');
    }
  }
}
