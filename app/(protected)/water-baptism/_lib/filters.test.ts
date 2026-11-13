import { describe, expect, it } from "vitest";
import type { Person } from "@/lib/people";
import type { BaptismRecord } from "@/lib/supabase/baptism";
import {
  buildBaptismRegistryRows,
  DEFAULT_BAPTISM_REGISTRY_FILTERS,
  filterBaptismQuickRows,
  getBaptismRegistryCounts,
  hasActiveBaptismFilters,
} from "./filters";
const people = [
  { id: "a", name: "Ana" },
  { id: "b", name: "Ben" },
  { id: "c", name: "Chris" },
] as Person[];
const records = [
  {
    id: "old",
    personId: "a",
    baptizedAt: "2024-02-01",
    location: "River",
    notes: "Old record",
    officiantPersonId: null,
  },
  {
    id: "latest",
    personId: "a",
    baptizedAt: "2026-11-01",
    location: "Sanctuary",
    notes: "Morning service",
    officiantPersonId: "c",
  },
  {
    id: "b",
    personId: "b",
    baptizedAt: "2026-10-01",
    location: "  ",
    notes: "Evening service",
    officiantPersonId: null,
  },
  {
    id: "orphan",
    personId: "missing",
    baptizedAt: "2026-11-10",
    location: "River",
    notes: "",
    officiantPersonId: null,
  },
] as BaptismRecord[];
describe("baptism registry", () => {
  it("groups people, preserves history, ignores unavailable people, and sorts latest first", () => {
    const rows = buildBaptismRegistryRows(
      records,
      people,
      DEFAULT_BAPTISM_REGISTRY_FILTERS,
    );
    expect(rows.map(row => row.person.id)).toEqual(["a", "b"]);
    expect(rows[0].latestRecord.id).toBe("latest");
    expect(rows[0].allRecords.map(record => record.id)).toEqual([
      "latest",
      "old",
    ]);
    expect(getBaptismRegistryCounts(rows)).toEqual({
      all: 2,
      rebaptisms: 1,
      missing: 1,
    });
  });
  it("combines quick filters, case-insensitive search, and inclusive latest-date boundaries", () => {
    const rows = buildBaptismRegistryRows(records, people, {
      search: " MORNING ",
      dateFrom: "2026-11-01",
      dateTo: "2026-11-01",
    });
    expect(
      filterBaptismQuickRows(rows, "rebaptisms").map(row => row.person.id),
    ).toEqual(["a"]);
    expect(filterBaptismQuickRows(rows, "missing")).toEqual([]);
    expect(
      buildBaptismRegistryRows(records, people, {
        ...DEFAULT_BAPTISM_REGISTRY_FILTERS,
        search: "old record",
      }),
    ).toEqual([]);
  });
  it("counts independently of search and detects missing latest location or officiant", () => {
    const rows = buildBaptismRegistryRows(
      records,
      people,
      DEFAULT_BAPTISM_REGISTRY_FILTERS,
    );
    expect(
      filterBaptismQuickRows(rows, "missing").map(row => row.person.id),
    ).toEqual(["b"]);
    expect(getBaptismRegistryCounts(rows).all).toBe(2);
    expect(getBaptismRegistryCounts([])).toEqual({
      all: 0,
      rebaptisms: 0,
      missing: 0,
    });
    expect(
      hasActiveBaptismFilters({
        ...DEFAULT_BAPTISM_REGISTRY_FILTERS,
        search: " ",
      }),
    ).toBe(false);
  });
});
