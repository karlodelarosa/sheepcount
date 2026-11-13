import { describe, expect, it } from "vitest";
import { filterGroups, getGroupCounts } from "./directory";
import type { LifeGroup, LifeGroupMember } from "@/lib/supabase/life-groups";
const groups = [
  {
    id: "a",
    name: "Youth Fellowship",
    description: "Bible lessons",
    category: "Youth",
    schedule: "  ",
  },
  {
    id: "b",
    name: "Adult Fellowship",
    description: "Working professionals",
    category: "Adults",
    schedule: "Friday",
  },
  {
    id: "c",
    name: "Children",
    description: "",
    category: "Children",
    schedule: "",
  },
] as LifeGroup[];
const members = [
  { lifeGroupId: "a" },
  { lifeGroupId: "a" },
  { lifeGroupId: "b" },
] as LifeGroupMember[];
describe("life group directory", () => {
  it("counts groups rather than memberships and treats whitespace schedules as missing", () => {
    expect(getGroupCounts(groups, members)).toEqual({
      all: 3,
      members: 2,
      missing: 2,
    });
  });
  it("combines search, category, and quick filters while preserving order", () => {
    expect(
      filterGroups(groups, members, " BIBLE ", "Youth", "missing").map(
        g => g.id,
      ),
    ).toEqual(["a"]);
    expect(
      filterGroups(groups, members, "fellowship", "all", "members").map(
        g => g.id,
      ),
    ).toEqual(["a", "b"]);
  });
  it("handles empty and unmatched results", () => {
    expect(filterGroups(groups, members, "unknown", "all", "all")).toEqual([]);
    expect(getGroupCounts([], [])).toEqual({ all: 0, members: 0, missing: 0 });
  });
});
