import { describe, expect, it } from "vitest";

import type { Person } from "@/lib/people";
import { DEFAULT_PEOPLE_FILTERS, filterPeople } from "./filters";

function person(
  id: string,
  membershipType: Person["membershipType"],
  isProspect: boolean,
): Person {
  return {
    id,
    firstName: id,
    middleName: "",
    lastName: "Person",
    name: `${id} Person`,
    phone: "",
    socialContact: "",
    birthdate: "",
    gender: null,
    isProspect,
    role: "",
    householdId: null,
    householdName: "",
    email: "",
    age: 0,
    joinDate: "",
    firstAttendance: "",
    memberSince: "",
    status: "Active",
    membershipType,
    evangelismStage: "Follow-up",
    lastAttendance: "",
  };
}

describe("filterPeople", () => {
  it("includes prospect-flagged records in the Prospect membership filter", () => {
    const result = filterPeople(
      [
        person("membership-prospect", "Prospect", true),
        person("flagged-prospect", "For Evangelism", true),
        person("attender", "Attender", false),
      ],
      { ...DEFAULT_PEOPLE_FILTERS, membershipType: "Prospect" },
      new Map(),
    );

    expect(result.map(entry => entry.id)).toEqual([
      "membership-prospect",
      "flagged-prospect",
    ]);
  });
});
