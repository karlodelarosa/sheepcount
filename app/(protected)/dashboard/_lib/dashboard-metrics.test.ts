import { describe, expect, it } from "vitest";

import {
  compareAttendancePeriods,
  getLatestAttendanceTrend,
  sliceAttendanceRange,
} from "./dashboard-metrics";

const trend = Array.from({ length: 24 }, (_, index) => ({
  rawDate: `2026-${String(Math.floor(index / 4) + 1).padStart(2, "0")}-${String((index % 4) * 7 + 1).padStart(2, "0")}`,
  count: index + 1,
}));

describe("sliceAttendanceRange", () => {
  it.each([4, 8, 12] as const)("returns the latest %i weeks", weeks => {
    const result = sliceAttendanceRange(trend, weeks);

    expect(result).toHaveLength(weeks);
    expect(result[0]).toBe(trend.at(-weeks));
    expect(result.at(-1)).toBe(trend.at(-1));
  });

  it("returns all available points when history is shorter than the range", () => {
    expect(sliceAttendanceRange(trend.slice(0, 3), 4)).toEqual(
      trend.slice(0, 3),
    );
  });
});

describe("compareAttendancePeriods", () => {
  it("compares equal current and previous windows", () => {
    const result = compareAttendancePeriods(
      [10, 10, 10, 10, 15, 15, 15, 15].map((count, index) => ({
        rawDate: String(index),
        count,
      })),
      4,
    );

    expect(result).toEqual({
      currentAverage: 15,
      previousAverage: 10,
      direction: "up",
      percent: 50,
    });
  });

  it("returns null when either period is incomplete", () => {
    expect(compareAttendancePeriods(trend.slice(0, 7), 4)).toBeNull();
  });

  it("returns null when the previous average is zero", () => {
    const points = [0, 0, 0, 0, 5, 5, 5, 5].map((count, index) => ({
      rawDate: String(index),
      count,
    }));

    expect(compareAttendancePeriods(points, 4)).toBeNull();
  });
});

describe("getLatestAttendanceTrend", () => {
  it("compares the latest Sunday to the preceding Sunday", () => {
    expect(
      getLatestAttendanceTrend([
        { rawDate: "2026-10-18", count: 40 },
        { rawDate: "2026-10-25", count: 50 },
      ]),
    ).toEqual({ direction: "up", percent: 25 });
  });

  it("returns null without two usable Sundays", () => {
    expect(
      getLatestAttendanceTrend([{ rawDate: "2026-10-25", count: 50 }]),
    ).toBeNull();
    expect(
      getLatestAttendanceTrend([
        { rawDate: "2026-10-18", count: 0 },
        { rawDate: "2026-10-25", count: 50 },
      ]),
    ).toBeNull();
  });
});
