import dateFormat from "dateformat";

export const dayInMillis = 60 * 60 * 24 * 1000;
export const serverDateFormat = "yyyy-mm-dd";

export function addDaysToDateString(dateString: string, days: number): string {
  const originalDate = new Date(dateString);
  // Have to undo the timezone logic that Date trys to "help" you with.
  const originalTime = originalDate.getTime() + originalDate.getTimezoneOffset() * 60000;
  const newTime = originalTime + days * dayInMillis + originalDate.getTimezoneOffset() * 60000;
  const newDate = new Date(newTime);
  return dateFormat(newDate, serverDateFormat);
}

export function getDaysBetweenDateStrings(startDate: string, endDate: string): number {
  const durationInDays = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / dayInMillis);
  return durationInDays;
}
