import type {
  WorkMinistry,
  WorkMinistryMember,
  WorkMinistryTeam,
} from "@/lib/supabase/work-ministries";
export type MinistryQuickFilter = "all" | "members" | "missing";
export type TeamFilter = "all" | "with" | "without";
export function getMinistryCounts(
  ministries: WorkMinistry[],
  members: WorkMinistryMember[],
) {
  const populated = new Set(members.map(member => member.ministryId));
  return {
    all: ministries.length,
    members: ministries.filter(m => populated.has(m.id)).length,
    missing: ministries.filter(m => !m.headPersonId).length,
  };
}
export function filterMinistries(
  ministries: WorkMinistry[],
  members: WorkMinistryMember[],
  teams: WorkMinistryTeam[],
  search: string,
  teamFilter: TeamFilter,
  quick: MinistryQuickFilter,
) {
  const populated = new Set(members.map(member => member.ministryId));
  const withTeams = new Set(teams.map(team => team.ministryId));
  const query = search.trim().toLowerCase();
  return ministries.filter(
    m =>
      (!query || `${m.name} ${m.description}`.toLowerCase().includes(query)) &&
      (quick !== "members" || populated.has(m.id)) &&
      (quick !== "missing" || !m.headPersonId) &&
      (teamFilter === "all" || withTeams.has(m.id) === (teamFilter === "with")),
  );
}
