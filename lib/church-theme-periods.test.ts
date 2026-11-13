import { describe, it, expect } from "vitest";
import {
  getThemePeriods,
  getActiveThemePeriod,
  matchesThemeCadence,
} from "./church-theme-periods";
describe("micro theme periods", () => {
  it("keeps twelve months and four distinct quarters", () => {
    expect(getThemePeriods("monthly")).toHaveLength(12);
    expect(getThemePeriods("quarterly").map(p => p.range)).toEqual([
      "January – March",
      "April – June",
      "July – September",
      "October – December",
    ]);
  });
  it("uses calendar quarter boundaries", () => {
    expect(
      Array.from({ length: 12 }, (_, i) =>
        getActiveThemePeriod("quarterly", i + 1),
      ),
    ).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
    expect(getActiveThemePeriod("monthly", 11)).toBe(11);
  });
  it("treats existing themes as monthly without mixing quarterly records", () => {
    expect(matchesThemeCadence({}, "monthly")).toBe(true);
    expect(matchesThemeCadence({}, "quarterly")).toBe(false);
    expect(matchesThemeCadence({ cadence: "quarterly" }, "monthly")).toBe(
      false,
    );
  });
});

import { vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { upsertMonthlyTheme } from "./supabase/church-goals";
describe("saving micro themes", () => {
  const input = {
    year: 2026,
    month: 1,
    title: "Grow",
    description: "",
    content: "",
  };
  it("scopes quarterly writes separately from January", async () => {
    const query: any = {};
    for (const method of ["select", "eq", "insert"])
      query[method] = vi.fn(() => query);
    query.maybeSingle = vi.fn(async () => ({ data: null, error: null }));
    query.single = vi.fn(async () => ({
      data: {
        ...input,
        id: "q1",
        organization_id: "org",
        cadence: "quarterly",
      },
      error: null,
    }));
    const db = { from: vi.fn(() => query) } as unknown as SupabaseClient;
    const saved = await upsertMonthlyTheme(db, "org", {
      ...input,
      cadence: "quarterly",
    });
    expect(query.eq).toHaveBeenCalledWith("cadence", "quarterly");
    expect(query.insert).toHaveBeenCalledWith(
      expect.objectContaining({ cadence: "quarterly", month: 1 }),
    );
    expect(saved.cadence).toBe("quarterly");
  });
  it("rejects quarters outside Q1–Q4 before making a request", async () => {
    const db = { from: vi.fn() } as unknown as SupabaseClient;
    await expect(
      upsertMonthlyTheme(db, "org", {
        ...input,
        month: 5,
        cadence: "quarterly",
      }),
    ).rejects.toThrow("Invalid theme period");
    expect(db.from).not.toHaveBeenCalled();
  });
  it("stops on a failed lookup instead of attempting an insert", async () => {
    const query: any = {};
    for (const method of ["select", "eq"]) query[method] = vi.fn(() => query);
    query.maybeSingle = vi.fn(async () => ({
      data: null,
      error: new Error("Lookup failed"),
    }));
    query.insert = vi.fn();
    const db = { from: vi.fn(() => query) } as unknown as SupabaseClient;
    await expect(upsertMonthlyTheme(db, "org", input)).rejects.toThrow(
      "Lookup failed",
    );
    expect(query.insert).not.toHaveBeenCalled();
  });
});
