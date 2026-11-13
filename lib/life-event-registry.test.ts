import { describe, expect, it } from "vitest";
import {
  filterLifeEventQuickRecords,
  getLifeEventCounts,
} from "./life-event-registry";
import { filterWeddingRecords } from "@/app/(protected)/weddings/_lib/filters";
import { filterDedicationRecords } from "@/app/(protected)/dedications/_lib/filters";
import { filterMemorialRecords } from "@/app/(protected)/memorials/_lib/filters";
import type { WeddingRecord } from "./supabase/weddings";
import type { DedicationRecord } from "./supabase/dedications";
import type { MemorialRecord } from "./supabase/memorials";

const records = [
  {
    id: "a",
    date: "2026-01-01",
    location: "Sanctuary",
    officiantName: "Pastor",
  },
  { id: "b", date: "2025-12-31", location: "  ", officiantName: "Pastor" },
  { id: "c", date: "2026-11-01", location: "River", officiantName: "" },
];
const getDate = (record: (typeof records)[number]) => record.date;
describe("life event quick filters", () => {
  it("counts all records independently of visible results", () => {
    expect(getLifeEventCounts(records, getDate, 2026)).toEqual({
      all: 3,
      year: 2,
      missing: 2,
    });
    expect(getLifeEventCounts([], getDate, 2026)).toEqual({
      all: 0,
      year: 0,
      missing: 0,
    });
  });
  it("filters calendar-year boundaries without mutating order", () => {
    expect(
      filterLifeEventQuickRecords(records, "year", getDate, 2026).map(
        r => r.id,
      ),
    ).toEqual(["a", "c"]);
    expect(filterLifeEventQuickRecords(records, "all", getDate, 2026)).toEqual(
      records,
    );
  });
  it("treats whitespace location and absent officiant as missing", () => {
    expect(
      filterLifeEventQuickRecords(records, "missing", getDate, 2026).map(
        r => r.id,
      ),
    ).toEqual(["b", "c"]);
  });
});
const filters = {
  search: " FAMILY ",
  dateFrom: "2026-01-01",
  dateTo: "2026-01-01",
};
describe("registry search and dates", () => {
  it("combines wedding search, inclusive dates, and quick filters", () => {
    const weddings = records.map(r => ({
      ...r,
      marriedAt: r.date,
      spouse1Name: "Ana",
      spouse2Name: "Ben",
      notes: "Family celebration",
    })) as unknown as WeddingRecord[];
    const rows = filterWeddingRecords(weddings, filters);
    expect(rows.map(r => r.id)).toEqual(["a"]);
    expect(
      filterLifeEventQuickRecords(rows, "missing", r => r.marriedAt, 2026),
    ).toEqual([]);
  });
  it("searches dedication parents and sorts by dedication date", () => {
    const dedications = records.map(r => ({
      ...r,
      dedicatedAt: r.date,
      childName: "Child",
      parentNames: "Family",
      notes: "",
    })) as unknown as DedicationRecord[];
    expect(
      filterDedicationRecords(dedications, filters).map(r => r.id),
    ).toEqual(["a"]);
    expect(
      filterDedicationRecords(dedications, {
        search: "",
        dateFrom: "",
        dateTo: "",
      }).map(r => r.id),
    ).toEqual(["c", "a", "b"]);
  });
  it("filters memorials by passing date and searches surviving family", () => {
    const memorials = records.map(r => ({
      ...r,
      deathDate: r.date,
      serviceDate: "2027-01-01",
      deceasedName: "Person",
      survivedBy: "Family",
      notes: "",
    })) as unknown as MemorialRecord[];
    expect(filterMemorialRecords(memorials, filters).map(r => r.id)).toEqual([
      "a",
    ]);
    expect(
      filterMemorialRecords(memorials, { ...filters, search: "unmatched" }),
    ).toEqual([]);
    expect(filterMemorialRecords([], filters)).toEqual([]);
  });
});
