import type { EvangelismStage } from "@/lib/people";
import type {
  ActionHubAction,
  GrowthTrackFilters,
  GrowthTrackPerson,
  NextStepAction,
} from "./types";
import { STAGE_ORDER } from "./stage-config";
import { needsCellGroupAssignment } from "@/lib/growth-track/cell-group-utils";

export function filterGrowthTrackPeople(
  people: GrowthTrackPerson[],
  filters: GrowthTrackFilters,
): GrowthTrackPerson[] {
  const searchLower = filters.search.toLowerCase().trim();

  return people.filter(person => {
    if (filters.stage !== "all" && person.evangelismStage !== filters.stage) {
      return false;
    }

    if (
      filters.assignmentStatus !== "all" &&
      person.assignmentStatus !== filters.assignmentStatus
    ) {
      return false;
    }

    if (searchLower) {
      const haystack = [
        person.name,
        person.householdName ?? "",
        person.membershipType,
        person.evangelismStage,
        person.statusNote ?? "",
        person.assignmentStatus.replace(/_/g, " "),
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });
}

export function groupByStage(
  people: GrowthTrackPerson[],
): Record<EvangelismStage, GrowthTrackPerson[]> {
  const grouped = Object.fromEntries(
    STAGE_ORDER.map(stage => [stage, [] as GrowthTrackPerson[]]),
  ) as Record<EvangelismStage, GrowthTrackPerson[]>;

  for (const person of people) {
    grouped[person.evangelismStage].push(person);
  }

  return grouped;
}

export function getPendingAssignmentPeople(
  people: GrowthTrackPerson[],
): GrowthTrackPerson[] {
  return people.filter(needsCellGroupAssignment);
}

export function getReadyForDiscipleshipPeople(
  people: GrowthTrackPerson[],
): GrowthTrackPerson[] {
  return people.filter(p => p.assignmentStatus === "ready_for_discipleship");
}

export function getNeedsContactPeople(
  people: GrowthTrackPerson[],
): GrowthTrackPerson[] {
  return people.filter(p => p.outreachPriority === "contact");
}

export function getNeedsFollowUpPeople(
  people: GrowthTrackPerson[],
): GrowthTrackPerson[] {
  return people.filter(p => p.outreachPriority === "follow_up");
}

export function getDaysInactive(
  lastActive: string,
  referenceDate = new Date(),
): number {
  if (!lastActive) return 999;
  const last = new Date(lastActive);
  const diff = referenceDate.getTime() - last.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getAtRiskPeople(
  people: GrowthTrackPerson[],
  thresholdDays = 90,
  referenceDate = new Date(),
): GrowthTrackPerson[] {
  return people
    .filter(p => getDaysInactive(p.lastActive, referenceDate) >= thresholdDays)
    .sort(
      (a, b) =>
        getDaysInactive(b.lastActive, referenceDate) -
        getDaysInactive(a.lastActive, referenceDate),
    );
}

export function getNextStepAction(person: GrowthTrackPerson): NextStepAction {
  switch (person.evangelismStage) {
    case "First-time Attendee":
      if (!person.followUpMessageSent) {
        return {
          label: "Mark as Followed Up",
          variant: "default",
          action: "complete_follow_up",
        };
      }
      return {
        label: "Move to Follow-up",
        variant: "default",
        action: "move_to_follow_up",
      };
    case "Follow-up":
      if (!person.followUpMessageSent) {
        return {
          label: "Mark as Followed Up",
          variant: "default",
          action: "complete_follow_up",
        };
      }
      if (needsCellGroupAssignment(person)) {
        return {
          label: "Assign to Cell Group",
          variant: "default",
          action: "assign_cell_group",
        };
      }
      return {
        label: "Log Outreach",
        variant: "outline",
        action: "log_contact",
      };
    case "Small Group":
      if (person.assignmentStatus === "ready_for_discipleship") {
        return {
          label: "Enroll in Discipleship 101",
          variant: "default",
          action: "enroll_discipleship",
        };
      }
      if (needsCellGroupAssignment(person)) {
        return {
          label: "Assign to Cell Group",
          variant: "default",
          action: "assign_cell_group",
        };
      }
      return {
        label: "Log Outreach",
        variant: "outline",
        action: "log_contact",
      };
    case "Discipleship":
      return {
        label: "Advance to Worker",
        variant: "outline",
        action: "advance_to_worker",
      };
    case "Worker":
      return {
        label: "Log Outreach",
        variant: "outline",
        action: "log_contact",
      };
  }
}

export function getActionHubAction(person: GrowthTrackPerson): ActionHubAction {
  if (person.outreachPriority === "contact") {
    return {
      label: "Log Contact",
      section: "contact",
      action: "log_contact",
    };
  }

  if (person.outreachPriority === "visitation") {
    return {
      label: "Log Outreach / Call",
      section: "visitation",
      action: "log_visitation",
    };
  }

  if (needsCellGroupAssignment(person)) {
    return {
      label: "Assign to Cell Group",
      section: "assignment",
      action: "assign_cell_group",
    };
  }

  if (person.assignmentStatus === "ready_for_discipleship") {
    return {
      label: "Enroll in Discipleship 101",
      section: "discipleship",
      action: "enroll_discipleship",
    };
  }

  if (person.outreachPriority === "follow_up") {
    return {
      label: "Mark as Followed Up",
      section: "outreach",
      action: "complete_follow_up",
    };
  }

  return {
    label: "Log Outreach / Call",
    section: "outreach",
    action: "log_visitation",
  };
}

export function formatLastActive(date: string): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}
