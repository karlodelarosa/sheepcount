import type { ExpenseLine, IncomeLine } from "./types";

export type OverviewPeriodMode = "year" | "single" | "range";

export type OverviewPeriodFilter = {
  mode: OverviewPeriodMode;
  year?: number;
  /** YYYY-MM */
  month?: string;
  /** YYYY-MM */
  fromMonth?: string;
  /** YYYY-MM */
  toMonth?: string;
};

export function currentYear(): number {
  return new Date().getFullYear();
}

export const DEFAULT_OVERVIEW_PERIOD: OverviewPeriodFilter = {
  mode: "year",
  year: currentYear(),
};

export function getMonthKeyFromDate(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  if (year && month) return `${year}-${month}`;
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthShort(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatOverviewPeriodLabel(filter: OverviewPeriodFilter): string {
  if (filter.mode === "year" && filter.year) {
    return String(filter.year);
  }
  if (filter.mode === "single" && filter.month) {
    return formatMonthShort(filter.month);
  }
  if (filter.mode === "range" && filter.fromMonth && filter.toMonth) {
    const [fromYear] = filter.fromMonth.split("-");
    const [toYear] = filter.toMonth.split("-");
    const fromLabel = new Date(
      Number(fromYear),
      Number(filter.fromMonth.split("-")[1]) - 1,
      1,
    ).toLocaleDateString("en-US", { month: "short" });
    const toLabel = formatMonthShort(filter.toMonth);
    if (fromYear === toYear) {
      return `${fromLabel}–${toLabel}`;
    }
    return `${formatMonthShort(filter.fromMonth)} – ${toLabel}`;
  }
  return String(currentYear());
}

export function normalizeRangeFilter(
  filter: OverviewPeriodFilter,
): OverviewPeriodFilter {
  if (filter.mode !== "range" || !filter.fromMonth || !filter.toMonth) {
    return filter;
  }
  if (filter.fromMonth <= filter.toMonth) return filter;
  return {
    ...filter,
    fromMonth: filter.toMonth,
    toMonth: filter.fromMonth,
  };
}

export function isDateInOverviewPeriod(
  dateStr: string,
  filter: OverviewPeriodFilter,
): boolean {
  const key = getMonthKeyFromDate(dateStr);
  if (filter.mode === "year" && filter.year) {
    return key.startsWith(`${filter.year}-`);
  }
  if (filter.mode === "single" && filter.month) {
    return key === filter.month;
  }
  if (filter.mode === "range" && filter.fromMonth && filter.toMonth) {
    return key >= filter.fromMonth && key <= filter.toMonth;
  }
  return true;
}

export function filterLinesByOverviewPeriod<T extends { date: string }>(
  lines: T[],
  filter: OverviewPeriodFilter,
): T[] {
  return lines.filter(line => isDateInOverviewPeriod(line.date, filter));
}

export function listAvailableYears(
  income: IncomeLine[],
  expenses: ExpenseLine[],
): number[] {
  const years = new Set<number>([currentYear()]);
  for (const line of income) {
    years.add(Number(getMonthKeyFromDate(line.date).split("-")[0]));
  }
  for (const line of expenses) {
    years.add(Number(getMonthKeyFromDate(line.date).split("-")[0]));
  }
  return Array.from(years).sort((a, b) => b - a);
}

export function enumerateMonthKeys(fromMonth: string, toMonth: string): string[] {
  const [fromYear, fromMonthNum] = fromMonth.split("-").map(Number);
  const [toYear, toMonthNum] = toMonth.split("-").map(Number);
  const months: string[] = [];
  let year = fromYear;
  let month = fromMonthNum;

  while (year < toYear || (year === toYear && month <= toMonthNum)) {
    months.push(`${year}-${String(month).padStart(2, "0")}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return months;
}

export function enumerateYearMonthKeys(year: number): string[] {
  return Array.from(
    { length: 12 },
    (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`,
  );
}
