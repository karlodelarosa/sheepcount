import type { Person } from "@/lib/people";

export const WORKER_ONBOARDING_STATUSES = [
  "in_progress",
  "for_approval",
  "ready_for_deployment",
  "completed",
] as const;

export type WorkerOnboardingStatus =
  (typeof WORKER_ONBOARDING_STATUSES)[number];

export type WorkerOnboardingConfig = {
  organizationId: string;
  courseId: string;
  updatedAt: string;
};

export type WorkerOnboardingCandidate = {
  id: string;
  organizationId: string;
  personId: string;
  courseId: string;
  progressId: string;
  targetMinistryId: string;
  status: WorkerOnboardingStatus;
  returnNote: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  deployedBy: string | null;
  deployedAt: string | null;
  deployedMembershipType: "Worker" | "Volunteer Worker" | null;
  deployedMinistryId: string | null;
  deployedTeamId: string | null;
  deployedRole: string;
  deployedServiceRole: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkerCandidateInput = {
  organizationId: string;
  personId: string;
  targetMinistryId: string;
};

export type DeployWorkerCandidateInput = {
  candidateId: string;
  membershipType: "Worker" | "Volunteer Worker";
  ministryId: string;
  teamId?: string | null;
  role?: string;
  serviceRole?: string;
};

export type WorkerCandidateNextAction =
  | "continue_training"
  | "submit_for_approval"
  | "review"
  | "deploy"
  | "view_profile";

export type WorkerOnboardingRow = {
  candidate: WorkerOnboardingCandidate;
  person: Person;
  ministryName: string;
};

export function isEligibleWorkerCandidate(
  person: Person,
  existingCandidatePersonIds: ReadonlySet<string>,
): boolean {
  return (
    person.status === "Active" &&
    (person.membershipType === "Member" ||
      person.membershipType === "Attender") &&
    !existingCandidatePersonIds.has(person.id)
  );
}

export function getCandidateProgress(
  moduleIds: readonly string[],
  completedModuleIds: readonly string[],
) {
  const configuredIds = new Set(moduleIds);
  const completed = new Set(
    completedModuleIds.filter(id => configuredIds.has(id)),
  ).size;
  const total = configuredIds.size;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    completed,
    total,
    percent,
    isComplete: total > 0 && completed === total,
  };
}

export function getCandidateNextAction(
  candidate: WorkerOnboardingCandidate,
  isTrainingComplete: boolean,
): WorkerCandidateNextAction {
  switch (candidate.status) {
    case "in_progress":
      return isTrainingComplete ? "submit_for_approval" : "continue_training";
    case "for_approval":
      return "review";
    case "ready_for_deployment":
      return "deploy";
    case "completed":
      return "view_profile";
  }
}

export function getOnboardingStageCounts(
  candidates: readonly WorkerOnboardingCandidate[],
): Record<WorkerOnboardingStatus, number> {
  const counts: Record<WorkerOnboardingStatus, number> = {
    in_progress: 0,
    for_approval: 0,
    ready_for_deployment: 0,
    completed: 0,
  };
  for (const candidate of candidates) counts[candidate.status] += 1;
  return counts;
}

export function filterOnboardingCandidates(
  rows: readonly WorkerOnboardingRow[],
  filters: {
    stage: WorkerOnboardingStatus | "all";
    ministryId: string | "all";
    query: string;
  },
): WorkerOnboardingRow[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return rows.filter(({ candidate, person, ministryName }) => {
    if (filters.stage !== "all" && candidate.status !== filters.stage) {
      return false;
    }
    if (
      filters.ministryId !== "all" &&
      candidate.targetMinistryId !== filters.ministryId
    ) {
      return false;
    }
    if (!query) return true;
    return [person.name, person.email, person.householdName, ministryName].some(
      value => value.toLocaleLowerCase().includes(query),
    );
  });
}

export function splitServingPeople(people: readonly Person[]) {
  return {
    workers: people.filter(
      person =>
        person.status === "Active" && person.membershipType === "Worker",
    ),
    volunteers: people.filter(
      person =>
        person.status === "Active" &&
        person.membershipType === "Volunteer Worker",
    ),
  };
}
