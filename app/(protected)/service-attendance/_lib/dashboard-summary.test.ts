import { describe, it, expect } from "vitest";
import {
  getDashboardCategories,
  getRecentSundaySessions,
} from "./dashboard-summary";

describe("dashboard summary", () => {
  it("counts each person once and keeps category totals consistent", () => {
    const categories = getDashboardCategories([
      { personId: "a", membershipType: "Worker" },
      { personId: "a", membershipType: "Worker" },
      { personId: "b", membershipType: "Member" },
    ]);
    expect(categories.map(item => item.count)).toEqual([1, 1]);
    expect(categories.reduce((sum, item) => sum + item.percentage, 0)).toBe(
      100,
    );
  });
  it("orders only Sunday sessions newest first and limits to three", () => {
    const records = [
      "2026-01-01",
      "2026-01-04",
      "2026-01-03",
      "2026-01-02",
    ].map(date => ({
      date,
      serviceId: date,
      serviceCategory: "sunday" as const,
      serviceType: "Sunday",
      attendees: ["a"],
    }));
    expect(
      getRecentSundaySessions([
        ...records,
        { ...records[0], date: "2026-02-01", serviceCategory: "life_group" },
      ]).map(row => row.date),
    ).toEqual(["2026-01-04", "2026-01-03", "2026-01-02"]);
    expect(records[0].date).toBe("2026-01-01");
  });
});

import {
  buildDashboardAttendeeSummaries,
  clampDateRange,
} from "./group-attendance";
import {
  matchesAgeBracketFilter,
  DEFAULT_AGE_BRACKET_FILTER,
} from "@/lib/person-demographics";

it("combines inclusive date boundaries and gathering selection with unknown demographics", () => {
  const rows = [
    {
      id: "1",
      personId: "missing",
      serviceId: "s",
      serviceType: "Sunday",
      serviceCategory: "sunday" as const,
      date: "2026-11-01",
    },
    {
      id: "2",
      personId: "missing",
      serviceId: "s",
      serviceType: "Sunday",
      serviceCategory: "sunday" as const,
      date: "2026-11-30",
    },
    {
      id: "3",
      personId: "missing",
      serviceId: "s",
      serviceType: "Sunday",
      serviceCategory: "sunday" as const,
      date: "2026-12-01",
    },
    {
      id: "4",
      personId: "group",
      serviceId: "g",
      serviceType: "Group",
      serviceCategory: "life_group" as const,
      date: "2026-11-20",
    },
  ];
  const result = buildDashboardAttendeeSummaries(
    rows,
    [],
    { from: "2026-11-01", to: "2026-11-30" },
    { sunday: true, lifeGroup: false },
  );
  expect(result).toHaveLength(1);
  expect(result[0].attendanceCount).toBe(2);
  expect(result[0].name).toBe("Unknown");
  expect(
    matchesAgeBracketFilter(
      result[0].age,
      result[0].birthdate,
      DEFAULT_AGE_BRACKET_FILTER,
    ),
  ).toBe(true);
  expect(
    matchesAgeBracketFilter(result[0].age, result[0].birthdate, {
      ...DEFAULT_AGE_BRACKET_FILTER,
      unknown: false,
    }),
  ).toBe(false);
  const range = clampDateRange({ from: "2020-01-01", to: "2026-11-30" });
  expect(
    (new Date(range.to).getTime() - new Date(range.from).getTime()) / 86400000,
  ).toBeLessThanOrEqual(365);
});

import { getCurrentMonthRange } from "./group-attendance";
it("keeps local calendar dates when selecting this month", () => {
  expect(getCurrentMonthRange(new Date(2026, 10, 14, 0, 30))).toEqual({
    from: "2026-11-01",
    to: "2026-11-14",
  });
});
