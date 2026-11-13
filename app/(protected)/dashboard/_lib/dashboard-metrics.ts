export type DashboardRangeWeeks = 4 | 8 | 12;

type AttendancePoint = {
  count: number;
};

export type AttendanceComparison = {
  currentAverage: number;
  previousAverage: number;
  direction: "up" | "down" | "flat";
  percent: number;
};

export type AttendanceTrend = Pick<
  AttendanceComparison,
  "direction" | "percent"
>;

function average(points: AttendancePoint[]): number {
  return Math.round(
    points.reduce((total, point) => total + point.count, 0) / points.length,
  );
}

function percentageChange(
  current: number,
  previous: number,
): AttendanceTrend | null {
  if (previous <= 0) return null;

  const percent = Math.round(((current - previous) / previous) * 100);
  return {
    direction: percent > 0 ? "up" : percent < 0 ? "down" : "flat",
    percent: Math.abs(percent),
  };
}

export function sliceAttendanceRange<T extends AttendancePoint>(
  points: T[],
  weeks: DashboardRangeWeeks,
): T[] {
  return points.slice(-weeks);
}

export function compareAttendancePeriods<T extends AttendancePoint>(
  points: T[],
  weeks: DashboardRangeWeeks,
): AttendanceComparison | null {
  if (points.length < weeks * 2) return null;

  const current = points.slice(-weeks);
  const previous = points.slice(-weeks * 2, -weeks);
  const currentAverage = average(current);
  const previousAverage = average(previous);
  const change = percentageChange(currentAverage, previousAverage);

  return change ? { currentAverage, previousAverage, ...change } : null;
}

export function getLatestAttendanceTrend<T extends AttendancePoint>(
  points: T[],
): AttendanceTrend | null {
  if (points.length < 2) return null;

  return percentageChange(points.at(-1)!.count, points.at(-2)!.count);
}
