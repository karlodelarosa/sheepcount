import type {
  EvangelismStage,
  MembershipType,
  Person,
  PersonStatus,
} from "@/lib/people";
import {
  getPersonVisitDate,
  isAttenderNewComer,
} from "@/lib/membership-path";
import type { PersonAchievementKind } from "../_components/person-detail-ui";

export type PeopleAchievementFilter =
  | "all"
  | "any"
  | "discipleship"
  | "training"
  | "none";

export type PeopleFilters = {
  search: string;
  status: PersonStatus | "all";
  membershipType: MembershipType | "all";
  evangelismStage: EvangelismStage | "all";
  achievement: PeopleAchievementFilter;
  prospect: "all" | "yes" | "no";
  newcomer: "all" | "yes" | "no";
};

export const DEFAULT_PEOPLE_FILTERS: PeopleFilters = {
  search: "",
  status: "all",
  membershipType: "all",
  evangelismStage: "all",
  achievement: "all",
  prospect: "all",
  newcomer: "all",
};

export function hasActivePeopleFilters(filters: PeopleFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.membershipType !== "all" ||
    filters.evangelismStage !== "all" ||
    filters.achievement !== "all" ||
    filters.prospect !== "all" ||
    filters.newcomer !== "all"
  );
}

export function countActivePeopleFilters(filters: PeopleFilters): number {
  let count = 0;
  if (filters.status !== "all") count++;
  if (filters.membershipType !== "all") count++;
  if (filters.evangelismStage !== "all") count++;
  if (filters.achievement !== "all") count++;
  if (filters.prospect !== "all") count++;
  if (filters.newcomer !== "all") count++;
  return count;
}

export function filterPeople(
  people: Person[],
  filters: PeopleFilters,
  achievementByPersonId: Map<string, PersonAchievementKind>,
): Person[] {
  const searchLower = filters.search.toLowerCase().trim();

  return people.filter(person => {
    if (filters.status !== "all" && person.status !== filters.status) {
      return false;
    }

    if (
      filters.membershipType !== "all" &&
      person.membershipType !== filters.membershipType
    ) {
      return false;
    }

    if (
      filters.evangelismStage !== "all" &&
      person.evangelismStage !== filters.evangelismStage
    ) {
      return false;
    }

    if (filters.prospect === "yes" && !person.isProspect) return false;
    if (filters.prospect === "no" && person.isProspect) return false;

    const visitDate = getPersonVisitDate(person);
    const isNewcomer =
      person.membershipType === "Attender" && isAttenderNewComer(visitDate);
    if (filters.newcomer === "yes" && !isNewcomer) return false;
    if (filters.newcomer === "no" && isNewcomer) return false;

    const achievement = achievementByPersonId.get(person.id) ?? null;
    if (filters.achievement === "any" && !achievement) return false;
    if (filters.achievement === "discipleship" && achievement !== "discipleship" && achievement !== "both") {
      return false;
    }
    if (filters.achievement === "training" && achievement !== "training" && achievement !== "both") {
      return false;
    }
    if (filters.achievement === "none" && achievement) return false;

    if (searchLower) {
      const haystack = [
        person.name,
        person.phone,
        person.householdName,
        person.email,
        person.membershipType,
        person.evangelismStage,
        person.status,
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(searchLower)) return false;
    }

    return true;
  });
}

export function buildPersonAchievementMap(
  people: Person[],
  getDiscipleshipBadgeCount: (personId: string) => number,
  getTrainingBadgeCount: (personId: string) => number,
): Map<string, PersonAchievementKind> {
  const map = new Map<string, PersonAchievementKind>();

  for (const person of people) {
    const hasDiscipleship = getDiscipleshipBadgeCount(person.id) > 0;
    const hasTraining = getTrainingBadgeCount(person.id) > 0;

    if (hasDiscipleship && hasTraining) {
      map.set(person.id, "both");
    } else if (hasDiscipleship) {
      map.set(person.id, "discipleship");
    } else if (hasTraining) {
      map.set(person.id, "training");
    }
  }

  return map;
}
