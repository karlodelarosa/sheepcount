import { describe, expect, it } from "vitest";

import type { Household, Person } from "@/lib/people";
import {
  buildHouseholdDirectoryEntries,
  buildHouseholdDirectoryQuery,
  buildHouseholdDirectorySummary,
  filterHouseholdDirectory,
  getHouseholdDirectoryState,
  getMemberInitials,
  parseHouseholdPage,
  parseHouseholdPageSize,
} from "./directory";

const households: Household[] = [
  {
    id: "household-1",
    name: "Dela Rosa Household",
    address: "Caloocan",
    createdDate: "2026-01-01",
  },
  {
    id: "household-2",
    name: "Doe Household",
    address: "",
    createdDate: "2026-01-02",
  },
  {
    id: "household-3",
    name: "James Household",
    address: "Quezon City",
    createdDate: "2026-01-03",
  },
];

function person(
  id: string,
  householdId: string | null,
  role: string,
  firstName: string,
  lastName: string,
): Person {
  return {
    id,
    firstName,
    middleName: "",
    lastName,
    name: `${firstName} ${lastName}`,
    phone: "",
    socialContact: "",
    birthdate: "",
    gender: null,
    isProspect: false,
    role,
    householdId,
    householdName: "",
    email: "",
    age: 0,
    joinDate: "",
    firstAttendance: "",
    memberSince: "",
    status: "Active",
    membershipType: "Member",
    evangelismStage: "Follow-up",
    lastAttendance: "",
  };
}

const people = [
  person("person-1", "household-1", "Head", "Karlo", "Dela Rosa"),
  person("person-2", "household-1", "Spouse", "Jamie", "Dela Rosa"),
  person("person-3", "household-2", "Single", "Alex", "Doe"),
  person("person-4", null, "Single", "Unlinked", "Person"),
];

describe("household directory derivation", () => {
  it("derives members and the assigned head for every household", () => {
    const entries = buildHouseholdDirectoryEntries(households, people);

    expect(entries[0].members.map(member => member.id)).toEqual([
      "person-1",
      "person-2",
    ]);
    expect(entries[0].head?.id).toBe("person-1");
    expect(entries[1].head).toBeUndefined();
    expect(entries[2].members).toEqual([]);
  });

  it("counts households, linked directory people, and empty households", () => {
    const entries = buildHouseholdDirectoryEntries(households, people);

    expect(buildHouseholdDirectorySummary(entries)).toEqual({
      totalHouseholds: 3,
      linkedPeople: 3,
      emptyHouseholds: 1,
    });
  });

  it("returns zero summary values for an empty directory", () => {
    expect(buildHouseholdDirectorySummary([])).toEqual({
      totalHouseholds: 0,
      linkedPeople: 0,
      emptyHouseholds: 0,
    });
  });
});

describe("filterHouseholdDirectory", () => {
  const entries = buildHouseholdDirectoryEntries(households, people);

  it("filters households by member and address states", () => {
    expect(
      filterHouseholdDirectory(entries, "", "with-members").map(
        entry => entry.household.id,
      ),
    ).toEqual(["household-1", "household-2"]);
    expect(
      filterHouseholdDirectory(entries, "", "empty").map(
        entry => entry.household.id,
      ),
    ).toEqual(["household-3"]);
    expect(
      filterHouseholdDirectory(entries, "", "missing-address").map(
        entry => entry.household.id,
      ),
    ).toEqual(["household-2"]);
  });

  it("searches household, address, head, and member names case-insensitively", () => {
    expect(
      filterHouseholdDirectory(entries, "caloocan", "all")[0].household.id,
    ).toBe("household-1");
    expect(
      filterHouseholdDirectory(entries, "JAMIE", "all")[0].household.id,
    ).toBe("household-1");
    expect(filterHouseholdDirectory(entries, "missing", "all")).toEqual([]);
  });
});

describe("household directory URL state", () => {
  it("parses valid state and falls back safely for invalid values", () => {
    expect(parseHouseholdPage("3")).toBe(3);
    expect(parseHouseholdPage("-2")).toBe(1);
    expect(parseHouseholdPageSize("24")).toBe(24);
    expect(parseHouseholdPageSize("25")).toBe(12);

    expect(
      getHouseholdDirectoryState(
        new URLSearchParams("q=rosa&status=empty&page=4&size=48"),
      ),
    ).toEqual({ search: "rosa", filter: "empty", page: 4, pageSize: 48 });

    expect(
      getHouseholdDirectoryState(
        new URLSearchParams("status=unknown&page=nope&size=100"),
      ),
    ).toEqual({ search: "", filter: "all", page: 1, pageSize: 12 });
  });

  it("serializes only non-default values", () => {
    expect(
      buildHouseholdDirectoryQuery({
        search: "  Dela Rosa  ",
        filter: "with-members",
        page: 2,
        pageSize: 24,
      }),
    ).toBe("q=Dela+Rosa&status=with-members&page=2&size=24");

    expect(
      buildHouseholdDirectoryQuery({
        search: "",
        filter: "all",
        page: 1,
        pageSize: 12,
      }),
    ).toBe("");
  });
});

describe("getMemberInitials", () => {
  it("returns up to four readable initials and an overflow count", () => {
    const members = [
      person("1", "household-1", "Head", "Karlo", "Dela Rosa"),
      person("2", "household-1", "Spouse", "Jamie", "Dela Rosa"),
      person("3", "household-1", "Child", "Lia", "Dela Rosa"),
      person("4", "household-1", "Child", "Kai", "Dela Rosa"),
      person("5", "household-1", "Child", "Noah", "Dela Rosa"),
    ];

    expect(getMemberInitials(members)).toEqual({
      initials: ["K", "J", "L", "K"],
      overflow: 1,
    });
  });
});
