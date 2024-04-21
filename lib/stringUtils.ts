import dateFormat from "dateformat";

export function getRomanNumerals(num: number): string {
  const numerals = ["0", "I", "II", "III", "IV", "V", "VI"];
  return numerals[num] ?? "";
}

let last = 0;
export function genID(prefix: string = "") {
  const now = Date.now();
  last = now > last ? now : last + 1;
  return (prefix || "") + last.toString(36);
}

export function getFirstOfThisMonthDateString(): string {
  return dateFormat(new Date(), "yyyy-mm-01");
}
