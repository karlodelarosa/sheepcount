import { describe, expect, it } from "vitest";
import { filterMinistries, getMinistryCounts } from "./directory";
import type {
  WorkMinistry,
  WorkMinistryMember,
  WorkMinistryTeam,
} from "@/lib/supabase/work-ministries";
const ministries = [
  {
    id: "a",
    name: "Media Ministry",
    description: "Production and digital",
    headPersonId: null,
  },
  {
    id: "b",
    name: "Worship",
    description: "Music ministry",
    headPersonId: "p",
  },
  { id: "c", name: "Welcome", description: "", headPersonId: null },
] as WorkMinistry[];
const members = [
  { ministryId: "a" },
  { ministryId: "a" },
  { ministryId: "b" },
] as WorkMinistryMember[];
const teams = [{ ministryId: "a" }] as WorkMinistryTeam[];
describe("ministry directory", () => {
  it("counts ministries independently of duplicate assignments", () => {
    expect(getMinistryCounts(ministries, members)).toEqual({
      all: 3,
      members: 2,
      missing: 2,
    });
  });
  it("combines case-insensitive description search, team and quick filters", () => {
    expect(
      filterMinistries(
        ministries,
        members,
        teams,
        " DIGITAL ",
        "with",
        "missing",
      ).map(m => m.id),
    ).toEqual(["a"]);
    expect(
      filterMinistries(
        ministries,
        members,
        teams,
        "",
        "without",
        "members",
      ).map(m => m.id),
    ).toEqual(["b"]);
  });
  it("preserves order and handles unmatched and empty results", () => {
    expect(
      filterMinistries(ministries, members, teams, "", "all", "all"),
    ).toEqual(ministries);
    expect(
      filterMinistries(ministries, members, teams, "unknown", "all", "all"),
    ).toEqual([]);
    expect(getMinistryCounts([], [])).toEqual({
      all: 0,
      members: 0,
      missing: 0,
    });
  });
});
