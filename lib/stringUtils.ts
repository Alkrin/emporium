export function getRomanNumerals(num: number): string {
  const numerals = ["0", "I", "II", "III", "IV", "V", "VI"];
  return numerals[num] ?? "";
}
