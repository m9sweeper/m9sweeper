import { format } from 'date-fns';

export const yesterdaysDate = function yesterdaysDate(): Date {
  const day = new Date();
  day.setDate(day.getDate() - 1);
  return day;
}

export const yesterdaysDateAsStr = function yesterdaysDateAsStr(): string {
  const day = yesterdaysDate();
  const dayStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
  return dayStr;
}

export const previousDayDate = function previousDayDate(numberOfDays: number): Date {
  const day = new Date();
  day.setDate(day.getDate() - numberOfDays);
  return day;
}


export const lastThirtyDaysFromYesterDay = function lastThirtyDaysFromYesterDay(totalDays: number): Date[] {
  let days: Date[] = [];
  
  let yesterDay = yesterdaysDate();
  
  for (let i = totalDays - 1; i >= 0; i--) {
    const day = new Date();
    day.setDate(yesterDay.getDate() - 1 * i);
    days.push(day);
  }

  return days;
}

export const lastThirtyDaysFromYesterDayAsStr = function lastThirtyDaysFromYesterDayStr(totalDays: number): string[] {
  let dayStrings: string[] = [];
  
  let days = lastThirtyDaysFromYesterDay(totalDays);

  for (let day of days) {
    //const dayStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    dayStrings.push(format(day, 'yyyy-M-d'));
  }
  
  return dayStrings;
}
