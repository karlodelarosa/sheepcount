export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const MONTH_NAMES_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function parseBirthdateParts(birthdate: string) {
  const [year, month, day] = birthdate.split("-").map(part => parseInt(part, 10));
  if (!year || !month || !day) return null;
  return { month: month - 1, day };
}

export function getBirthMonthIndex(birthdate: string): number | null {
  const parts = parseBirthdateParts(birthdate);
  if (!parts) return null;
  return parts.month;
}

export function isBirthMonthIndex(
  birthdate: string,
  monthIndex: number,
): boolean {
  return getBirthMonthIndex(birthdate) === monthIndex;
}

export function getMonthFullName(monthIndex: number): string {
  return MONTH_NAMES_FULL[monthIndex] ?? "";
}

export function getBirthMonthShort(birthdate: string): string | null {
  const parts = parseBirthdateParts(birthdate);
  if (!parts) return null;
  return MONTH_NAMES[parts.month] ?? null;
}

export function isBirthMonth(
  birthdate: string,
  referenceDate = new Date(),
): boolean {
  const parts = parseBirthdateParts(birthdate);
  if (!parts) return false;
  return parts.month === referenceDate.getMonth();
}

export function isBirthdayToday(
  birthdate: string,
  referenceDate = new Date(),
): boolean {
  const parts = parseBirthdateParts(birthdate);
  if (!parts) return false;
  return (
    parts.month === referenceDate.getMonth() &&
    parts.day === referenceDate.getDate()
  );
}

export function formatBirthdayDisplay(birthdate: string): string | null {
  const parts = parseBirthdateParts(birthdate);
  if (!parts) return null;
  return new Date(2000, parts.month, parts.day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

/** Sort key for month-day ordering (MMDD). */
export function getBirthdaySortKey(birthdate: string): number | null {
  const parts = parseBirthdateParts(birthdate);
  if (!parts) return null;
  return (parts.month + 1) * 100 + parts.day;
}
