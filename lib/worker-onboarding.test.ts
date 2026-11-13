import { describe, expect, it } from "vitest";
import type { Person } from "@/lib/people";
import {
  filterOnboardingCandidates,
  getCandidateNextAction,
  getCandidateProgress,
  getOnboardingStageCounts,
  isEligibleWorkerCandidate,
  splitServingPeople,
  type WorkerOnboardingCandidate,
} from "@/lib/worker-onboarding";

const person = (overrides: Partial<Person> = {}): Person => ({
  id: "person-1",
  firstName: "Alex",
  middleName: "",
  lastName: "Rivera",
  name: "Alex Rivera",
  phone: "",
  socialContact: "",
  birthdate: "",
  gender: null,
  isProspect: false,
  role: "",
  householdId: null,
  householdName: "Rivera Household",
  email: "alex@example.com",
  age: 30,
  joinDate: "2026-01-01",
  firstAttendance: "",
  memberSince: "",
  status: "Active",
  membershipType: "Member",
  evangelismStage: "Discipleship",
  lastAttendance: "",
  ...overrides,
});

const candidate = (
  overrides: Partial<WorkerOnboardingCandidate> = {},
): WorkerOnboardingCandidate => ({
  id: "candidate-1",
  organizationId: "org-1",
  personId: "person-1",
  courseId: "course-1",
  progressId: "progress-1",
  targetMinistryId: "ministry-1",
  status: "in_progress",
  returnNote: "",
  reviewedBy: null,
  reviewedAt: null,
  approvedAt: null,
  deployedBy: null,
  deployedAt: null,
  deployedMembershipType: null,
  deployedMinistryId: null,
  deployedTeamId: null,
  deployedRole: "",
  deployedServiceRole: "",
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
  ...overrides,
});

describe("worker onboarding helpers", () => {
  it("only accepts active members and attenders who are not already candidates", () => {
    expect(isEligibleWorkerCandidate(person(), new Set())).toBe(true);
    expect(
      isEligibleWorkerCandidate(
        person({ membershipType: "Attender" }),
        new Set(),
      ),
    ).toBe(true);
    expect(
      isEligibleWorkerCandidate(
        person({ membershipType: "Worker" }),
        new Set(),
      ),
    ).toBe(false);
    expect(
      isEligibleWorkerCandidate(person({ status: "Inactive" }), new Set()),
    ).toBe(false);
    expect(isEligibleWorkerCandidate(person(), new Set(["person-1"]))).toBe(
      false,
    );
  });

  it("clamps progress to configured modules and requires at least one module", () => {
    expect(getCandidateProgress(["module-1"], [])).toEqual({
      completed: 0,
      total: 1,
      percent: 0,
      isComplete: false,
    });
    expect(
      getCandidateProgress(
        ["module-1", "module-2"],
        ["module-1", "module-2", "stale-module"],
      ),
    ).toEqual({ completed: 2, total: 2, percent: 100, isComplete: true });
    expect(getCandidateProgress([], [])).toEqual({
      completed: 0,
      total: 0,
      percent: 0,
      isComplete: false,
    });
  });

  it("selects the next action from stage and training progress", () => {
    expect(getCandidateNextAction(candidate(), false)).toBe(
      "continue_training",
    );
    expect(getCandidateNextAction(candidate(), true)).toBe(
      "submit_for_approval",
    );
    expect(
      getCandidateNextAction(candidate({ status: "for_approval" }), true),
    ).toBe("review");
    expect(
      getCandidateNextAction(
        candidate({ status: "ready_for_deployment" }),
        true,
      ),
    ).toBe("deploy");
    expect(
      getCandidateNextAction(candidate({ status: "completed" }), true),
    ).toBe("view_profile");
  });

  it("counts every persisted onboarding stage", () => {
    expect(
      getOnboardingStageCounts([
        candidate(),
        candidate({ id: "2", status: "for_approval" }),
        candidate({ id: "3", status: "ready_for_deployment" }),
        candidate({ id: "4", status: "completed" }),
      ]),
    ).toEqual({
      in_progress: 1,
      for_approval: 1,
      ready_for_deployment: 1,
      completed: 1,
    });
  });

  it("filters candidates by stage, ministry, and person text", () => {
    const rows = [
      { candidate: candidate(), person: person(), ministryName: "Media" },
      {
        candidate: candidate({
          id: "2",
          personId: "person-2",
          status: "completed",
          targetMinistryId: "ministry-2",
        }),
        person: person({
          id: "person-2",
          name: "Jamie Cruz",
          email: "jamie@example.com",
        }),
        ministryName: "Worship",
      },
    ];

    expect(
      filterOnboardingCandidates(rows, {
        stage: "completed",
        ministryId: "all",
        query: "jamie",
      }),
    ).toHaveLength(1);
    expect(
      filterOnboardingCandidates(rows, {
        stage: "all",
        ministryId: "ministry-1",
        query: "rivera household",
      }),
    ).toHaveLength(1);
  });

  it("separates paid workers from volunteer workers", () => {
    expect(
      splitServingPeople([
        person({ id: "w", membershipType: "Worker" }),
        person({ id: "v", membershipType: "Volunteer Worker" }),
        person({ id: "m", membershipType: "Member" }),
      ]),
    ).toEqual({
      workers: [expect.objectContaining({ id: "w" })],
      volunteers: [expect.objectContaining({ id: "v" })],
    });
  });
});
