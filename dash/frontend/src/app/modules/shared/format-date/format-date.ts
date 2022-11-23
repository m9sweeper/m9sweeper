import {format} from 'date-fns';

export class FormatDate {
  static formatLastScannedDate(date?: number) {
    if (!date) {
      return 'NA';
    }
    return format (new Date(+date), 'yyyy-MM-dd H:mm:s');
  }

  static formatClusterEventDetailsDate(date?: number) {
    if (!date) {
      return 'NA';
    }
    return format(new Date(+date), 'MM/dd/yyyy H:mm:s');
  }

  static formatScanDate(date?: string) {
    if (!date) {
      return 'NA';
    }
    return format(new Date(date), 'yyyy/MM/dd');
  }

  static parseDatetimeToTimestamp(datetime: string): number {
    const timezoneOffset = new Date().getTimezoneOffset();
    const newDate = new Date(datetime);
    const newTimestamp = newDate.getTime() - (timezoneOffset * 60000);
    return newTimestamp;
  }

  static parseTimestampToLocalTimestamp(datetime: string): number {
    const timezoneOffset = new Date().getTimezoneOffset();
    const newDate = new Date(Number(datetime));
    const newTimestamp = newDate.getTime() - (timezoneOffset * 60000);
    return newTimestamp;
  }
}
