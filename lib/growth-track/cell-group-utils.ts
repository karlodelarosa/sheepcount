import type { CellGroup, CellGroupMember } from "@/lib/supabase/cell-groups";
import type { GrowthTrackPerson } from "@/lib/growth-track/types";

export function getEffectiveCellGroupLeaderId(
  group: CellGroup | undefined,
  cellGroupMembers: CellGroupMember[],
): string | null {
  if (!group) return null;
  if (group.leaderPersonId) return group.leaderPersonId;

  const leaderMember = cellGroupMembers.find(
    m => m.cellGroupId === group.id && m.role === "Leader",
  );
  return leaderMember?.personId ?? null;
}

export function cellGroupHasLeader(
  group: CellGroup | undefined,
  cellGroupMembers: CellGroupMember[],
): boolean {
  return getEffectiveCellGroupLeaderId(group, cellGroupMembers) !== null;
}

export function isPlacedInCellGroup(person: GrowthTrackPerson): boolean {
  if (!person.cellGroupId) return false;
  return (
    person.assignmentStatus === "assigned" ||
    person.assignmentStatus === "ready_for_discipleship"
  );
}

export function needsCellGroupAssignment(person: GrowthTrackPerson): boolean {
  if (
    person.evangelismStage !== "Follow-up" &&
    person.evangelismStage !== "Small Group"
  ) {
    return false;
  }

  if (
    person.assignmentStatus === "unassigned" ||
    person.assignmentStatus === "pending_placement" ||
    person.assignmentStatus === "ready_for_leader"
  ) {
    return true;
  }

  return false;
}
