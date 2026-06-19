import type { WorkMinistryMember, WorkMinistryTeam } from "@/lib/supabase/work-ministries";

export function formatMinistryAssignmentLabel(
  assignment: Pick<WorkMinistryMember, "role" | "serviceRole"> & {
    team?: WorkMinistryTeam | null;
  },
): string {
  const parts: string[] = [];
  if (assignment.team?.name) parts.push(assignment.team.name);
  if (assignment.serviceRole) parts.push(assignment.serviceRole);
  if (assignment.role && assignment.role !== "Member") parts.push(assignment.role);
  return parts.length > 0 ? parts.join(" · ") : assignment.role || "Member";
}
