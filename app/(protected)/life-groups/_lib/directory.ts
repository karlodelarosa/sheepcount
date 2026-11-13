import type { LifeGroup, LifeGroupMember } from "@/lib/supabase/life-groups";

export type QuickFilter = "all" | "members" | "missing";
export function getGroupCounts(
  groups: LifeGroup[],
  members: LifeGroupMember[],
) {
  const populated = new Set(members.map(member => member.lifeGroupId));
  return {
    all: groups.length,
    members: groups.filter(group => populated.has(group.id)).length,
    missing: groups.filter(group => !group.schedule.trim()).length,
  };
}
export function filterGroups(
  groups: LifeGroup[],
  members: LifeGroupMember[],
  search: string,
  category: string,
  quick: QuickFilter,
) {
  const populated = new Set(members.map(member => member.lifeGroupId));
  const query = search.trim().toLowerCase();
  return groups.filter(
    group =>
      (category === "all" || group.category === category) &&
      (!query ||
        `${group.name} ${group.description}`.toLowerCase().includes(query)) &&
      (quick !== "members" || populated.has(group.id)) &&
      (quick !== "missing" || !group.schedule.trim()),
  );
}
