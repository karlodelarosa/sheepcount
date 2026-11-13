import { describe, expect, it } from "vitest";

import {
  buildPeopleDirectorySummary,
  formatLastAttended,
} from "./directory-summary";

const people = [
  {
    id: "person-1",
    status: "Active" as const,
    membershipType: "Member" as const,
    isProspect: false,
  },
  {
    id: "person-2",
    status: "Inactive" as const,
    membershipType: "Attender" as const,
    isProspect: false,
  },
  {
    id: "person-3",
    status: "Active" as const,
    membershipType: "Worker" as const,
    isProspect: false,
  },
  {
    id: "person-4",
    status: "Active" as const,
    membershipType: "Volunteer Worker" as const,
    isProspect: false,
  },
  {
    id: "person-5",
    status: "Exited" as const,
    membershipType: "Prospect" as const,
    isProspect: true,
  },
  {
    id: "person-6",
    status: "Active" as const,
    membershipType: "For Evangelism" as const,
    isProspect: true,
  },
];

describe("buildPeopleDirectorySummary", () => {
  it("counts directory statuses and membership categories", () => {
    const summary = buildPeopleDirectorySummary(people, []);

    expect(summary).toEqual({
      total: 6,
      active: 4,
      inLifeGroups: 0,
      prospects: 2,
      members: 1,
      attenders: 1,
      workers: 1,
      volunteers: 1,
    });
  });

  it("counts each valid life-group member once", () => {
    const summary = buildPeopleDirectorySummary(people, [
      { personId: "person-1" },
      { personId: "person-1" },
      { personId: "person-3" },
      { personId: "missing-person" },
    ]);

    expect(summary.inLifeGroups).toBe(2);
  });

  it("returns zeroes for an empty directory", () => {
    expect(buildPeopleDirectorySummary([], [])).toEqual({
      total: 0,
      active: 0,
      inLifeGroups: 0,
      prospects: 0,
      members: 0,
      attenders: 0,
      workers: 0,
      volunteers: 0,
    });
  });
});

describe("formatLastAttended", () => {
  it("formats an ISO date without shifting the calendar day", () => {
    expect(formatLastAttended("2026-06-13")).toBe("Jun 13, 2026");
  });

  it("uses an em dash for a missing or invalid date", () => {
    expect(formatLastAttended("")).toBe("—");
    expect(formatLastAttended("not-a-date")).toBe("—");
  });
});
