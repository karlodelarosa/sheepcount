import type { CellGroup, CellGroupMember } from "@/lib/supabase/cell-groups";
import type { DiscipleshipEnrollment } from "@/lib/supabase/discipleship";
import type { GrowthTrackActivity } from "@/lib/supabase/growth-track";
import type { LifeGroupMember } from "@/lib/supabase/life-groups";
import type { EvangelismStage, Person } from "@/lib/people";
import type { AssignmentStatus, GrowthTrackPerson } from "@/lib/growth-track/types";
import { getEffectiveCellGroupLeaderId } from "@/lib/growth-track/cell-group-utils";

const PIPELINE_STAGES: EvangelismStage[] = [
  "First-time Attendee",
  "Follow-up",
  "Small Group",
  "Discipleship",
  "Worker",
];

const GROWTH_MEMBERSHIP_TYPES = new Set([
  "Prospect",
  "For Evangelism",
  "Attender",
  "Member",
  "Volunteer Worker",
]);

export function isGrowthTrackCandidate(person: Person): boolean {
  if (person.status !== "Active") return false;
  if (PIPELINE_STAGES.includes(person.evangelismStage)) return true;
  return GROWTH_MEMBERSHIP_TYPES.has(person.membershipType);
}

function getPersonActivities(
  personId: string,
  activities: GrowthTrackActivity[],
): GrowthTrackActivity[] {
  return activities.filter(a => a.personId === personId);
}

function hasActivityType(
  personActivities: GrowthTrackActivity[],
  type: GrowthTrackActivity["activityType"],
): boolean {
  return personActivities.some(a => a.activityType === type);
}

function getLastActivityDate(
  personActivities: GrowthTrackActivity[],
  types?: GrowthTrackActivity["activityType"][],
): string | null {
  const filtered = types
    ? personActivities.filter(a => types.includes(a.activityType))
    : personActivities;

  if (filtered.length === 0) return null;
  return filtered[0].performedAt.split("T")[0];
}

function hasFollowUpCompleted(
  personActivities: GrowthTrackActivity[],
): boolean {
  return (
    hasActivityType(personActivities, "follow_up_message") ||
    hasActivityType(personActivities, "follow_up_call")
  );
}

function computeAssignmentStatus(
  person: Person,
  cellMembership: (CellGroupMember & { group?: CellGroup }) | undefined,
  lifeMemberships: LifeGroupMember[],
  discipleshipEnrollment: DiscipleshipEnrollment | undefined,
  cellGroups: CellGroup[],
  cellGroupMembers: CellGroupMember[],
): AssignmentStatus {
  if (discipleshipEnrollment?.status === "active") {
    return "assigned";
  }

  if (person.evangelismStage === "Discipleship" || person.evangelismStage === "Worker") {
    return "assigned";
  }

  const isCellLeader =
    cellGroups.some(g => g.leaderPersonId === person.id) ||
    cellMembership?.role === "Leader";

  if (cellMembership) {
    const group = cellMembership.group;
    const effectiveLeaderId = getEffectiveCellGroupLeaderId(
      group,
      cellGroupMembers,
    );

    if (
      isCellLeader ||
      effectiveLeaderId === person.id ||
      (effectiveLeaderId && group)
    ) {
      if (person.evangelismStage === "Small Group") {
        const joined = new Date(cellMembership.joinedDate);
        const daysInGroup = Math.floor(
          (Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysInGroup >= 14 && !discipleshipEnrollment) {
          return "ready_for_discipleship";
        }
      }

      return "assigned";
    }

    if (group && !effectiveLeaderId) {
      return "ready_for_leader";
    }

    return "assigned";
  }

  if (lifeMemberships.length > 0) {
    return "pending_placement";
  }

  return "unassigned";
}

function computeStatusNote(
  assignmentStatus: AssignmentStatus,
  cellMembership: (CellGroupMember & { group?: CellGroup }) | undefined,
): string | undefined {
  if (assignmentStatus === "ready_for_leader") {
    return "Assign to a cell group with a leader";
  }
  if (assignmentStatus === "ready_for_discipleship") {
    return "Ready for Discipleship 101";
  }
  if (assignmentStatus === "pending_placement" && !cellMembership) {
    return "Needs cell group placement";
  }
  return undefined;
}

export type BuildGrowthTrackPeopleInput = {
  people: Person[];
  activities: GrowthTrackActivity[];
  cellGroupMembers: CellGroupMember[];
  cellGroups: CellGroup[];
  lifeGroupMembers: LifeGroupMember[];
  discipleshipEnrollments: DiscipleshipEnrollment[];
  getPersonCellGroup: (
    personId: string,
  ) => (CellGroupMember & { group?: CellGroup }) | undefined;
};

export function buildGrowthTrackPeople(
  input: BuildGrowthTrackPeopleInput,
): GrowthTrackPerson[] {
  const {
    people,
    activities,
    discipleshipEnrollments,
    getPersonCellGroup,
    lifeGroupMembers,
  } = input;

  return people
    .filter(isGrowthTrackCandidate)
    .map(person => {
      const personActivities = getPersonActivities(person.id, activities);
      const cellMembership = getPersonCellGroup(person.id);
      const lifeMemberships = lifeGroupMembers.filter(
        m => m.personId === person.id,
      );
      const discipleshipEnrollment = discipleshipEnrollments.find(
        e => e.personId === person.id && e.status === "active",
      );

      const assignmentStatus = computeAssignmentStatus(
        person,
        cellMembership,
        lifeMemberships,
        discipleshipEnrollment,
        input.cellGroups,
        input.cellGroupMembers,
      );

      const followUpMessageSent = hasFollowUpCompleted(personActivities);
      const lastFollowUpAt =
        getLastActivityDate(personActivities, [
          "follow_up_message",
          "follow_up_call",
          "contact",
        ]) ?? undefined;

      const lastActive =
        person.lastAttendance ||
        getLastActivityDate(personActivities) ||
        person.joinDate ||
        "";

      let outreachPriority: GrowthTrackPerson["outreachPriority"] = null;
      if (
        person.evangelismStage === "First-time Attendee" &&
        !followUpMessageSent &&
        !hasActivityType(personActivities, "contact")
      ) {
        outreachPriority = "contact";
      } else if (
        person.evangelismStage === "Follow-up" &&
        !followUpMessageSent
      ) {
        outreachPriority = "follow_up";
      } else if (lastActive) {
        const daysInactive = Math.floor(
          (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysInactive >= 90) {
          outreachPriority = "visitation";
        }
      }

      return {
        id: person.id,
        name: person.name,
        householdName: person.householdName || undefined,
        membershipType: person.membershipType,
        evangelismStage: person.evangelismStage,
        lastActive,
        assignmentStatus,
        statusNote: computeStatusNote(assignmentStatus, cellMembership),
        followUpMessageSent,
        lastFollowUpAt,
        outreachPriority,
        cellGroupId: cellMembership?.cellGroupId,
        lifeGroupIds: lifeMemberships.map(m => m.lifeGroupId),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getStageCounts(
  growthPeople: GrowthTrackPerson[],
): Record<EvangelismStage, number> {
  const counts = Object.fromEntries(
    PIPELINE_STAGES.map(stage => [stage, 0]),
  ) as Record<EvangelismStage, number>;

  for (const person of growthPeople) {
    counts[person.evangelismStage] += 1;
  }

  return counts;
}
