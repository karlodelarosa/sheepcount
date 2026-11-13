import type { Household, Person } from "@/lib/people";

export const HOUSEHOLD_PAGE_SIZE_OPTIONS = [12, 24, 48] as const;
export const DEFAULT_HOUSEHOLD_PAGE_SIZE = 12;

export type HouseholdPageSize = (typeof HOUSEHOLD_PAGE_SIZE_OPTIONS)[number];
export type HouseholdDirectoryFilter =
  | "all"
  | "with-members"
  | "empty"
  | "missing-address";

export type HouseholdDirectoryEntry = {
  household: Household;
  members: Person[];
  head: Person | undefined;
};

export type HouseholdDirectorySummary = {
  totalHouseholds: number;
  linkedPeople: number;
  emptyHouseholds: number;
};

export type HouseholdDirectoryState = {
  search: string;
  filter: HouseholdDirectoryFilter;
  page: number;
  pageSize: HouseholdPageSize;
};

const VALID_FILTERS = new Set<HouseholdDirectoryFilter>([
  "all",
  "with-members",
  "empty",
  "missing-address",
]);

export function buildHouseholdDirectoryEntries(
  households: Household[],
  people: Person[],
): HouseholdDirectoryEntry[] {
  const peopleByHousehold = new Map<string, Person[]>();

  for (const person of people) {
    if (!person.householdId) continue;
    const members = peopleByHousehold.get(person.householdId) ?? [];
    members.push(person);
    peopleByHousehold.set(person.householdId, members);
  }

  return households.map(household => {
    const members = peopleByHousehold.get(household.id) ?? [];
    return {
      household,
      members,
      head: members.find(member => member.role === "Head"),
    };
  });
}

export function buildHouseholdDirectorySummary(
  entries: HouseholdDirectoryEntry[],
): HouseholdDirectorySummary {
  return entries.reduce<HouseholdDirectorySummary>(
    (summary, entry) => ({
      totalHouseholds: summary.totalHouseholds + 1,
      linkedPeople: summary.linkedPeople + entry.members.length,
      emptyHouseholds:
        summary.emptyHouseholds + (entry.members.length === 0 ? 1 : 0),
    }),
    { totalHouseholds: 0, linkedPeople: 0, emptyHouseholds: 0 },
  );
}

export function filterHouseholdDirectory(
  entries: HouseholdDirectoryEntry[],
  search: string,
  filter: HouseholdDirectoryFilter,
): HouseholdDirectoryEntry[] {
  const query = search.trim().toLocaleLowerCase();

  return entries.filter(entry => {
    const matchesFilter =
      filter === "all" ||
      (filter === "with-members" && entry.members.length > 0) ||
      (filter === "empty" && entry.members.length === 0) ||
      (filter === "missing-address" && !entry.household.address.trim());

    if (!matchesFilter) return false;
    if (!query) return true;

    return [
      entry.household.name,
      entry.household.address,
      ...entry.members.map(member => member.name),
    ].some(value => value.toLocaleLowerCase().includes(query));
  });
}

export function parseHouseholdPage(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export function parseHouseholdPageSize(
  value: string | null,
): HouseholdPageSize {
  const parsed = Number(value);
  if (HOUSEHOLD_PAGE_SIZE_OPTIONS.includes(parsed as HouseholdPageSize)) {
    return parsed as HouseholdPageSize;
  }
  return DEFAULT_HOUSEHOLD_PAGE_SIZE;
}

export function getHouseholdDirectoryState(
  searchParams: URLSearchParams,
): HouseholdDirectoryState {
  const filter = searchParams.get("status");

  return {
    search: searchParams.get("q") ?? "",
    filter: VALID_FILTERS.has(filter as HouseholdDirectoryFilter)
      ? (filter as HouseholdDirectoryFilter)
      : "all",
    page: parseHouseholdPage(searchParams.get("page")),
    pageSize: parseHouseholdPageSize(searchParams.get("size")),
  };
}

export function buildHouseholdDirectoryQuery(
  state: HouseholdDirectoryState,
): string {
  const params = new URLSearchParams();
  const search = state.search.trim();

  if (search) params.set("q", search);
  if (state.filter !== "all") params.set("status", state.filter);
  if (state.page > 1) params.set("page", String(state.page));
  if (state.pageSize !== DEFAULT_HOUSEHOLD_PAGE_SIZE) {
    params.set("size", String(state.pageSize));
  }

  return params.toString();
}

export function getMemberInitials(members: Person[]): {
  initials: string[];
  overflow: number;
} {
  const visibleMembers = members.slice(0, 4);
  return {
    initials: visibleMembers.map(member =>
      (member.firstName || member.name).trim().charAt(0).toLocaleUpperCase(),
    ),
    overflow: Math.max(0, members.length - visibleMembers.length),
  };
}
