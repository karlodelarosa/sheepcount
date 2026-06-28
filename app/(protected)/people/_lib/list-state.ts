import type {
  EvangelismStage,
  MembershipType,
  PersonStatus,
} from "@/lib/people";
import {
  type PeopleAchievementFilter,
  type PeopleFilters,
} from "./filters";

export const PEOPLE_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PeoplePageSize = (typeof PEOPLE_PAGE_SIZE_OPTIONS)[number];
export const DEFAULT_PEOPLE_PAGE_SIZE: PeoplePageSize = 50;

const NAV_STORAGE_KEY = "people-list-nav";

export type PeopleListNavigationContext = {
  personIds: string[];
  page: number;
  pageSize: number;
  returnQuery: string;
};

const VALID_STATUSES = new Set<PersonStatus | "all">([
  "all",
  "Active",
  "Inactive",
  "Exited",
]);
const VALID_MEMBERSHIP = new Set<MembershipType | "all">([
  "all",
  "Worker",
  "Volunteer Worker",
  "Member",
  "Attender",
  "For Evangelism",
  "Prospect",
]);
const VALID_EVANGELISM = new Set<EvangelismStage | "all">([
  "all",
  "First-time Attendee",
  "Follow-up",
  "Small Group",
  "Discipleship",
  "Worker",
]);
const VALID_ACHIEVEMENT = new Set<PeopleAchievementFilter>([
  "all",
  "any",
  "discipleship",
  "training",
  "none",
]);
const VALID_YES_NO = new Set<"all" | "yes" | "no">(["all", "yes", "no"]);

function parseEnum<T extends string>(
  value: string | null,
  allowed: Set<T>,
  fallback: T,
): T {
  if (value && allowed.has(value as T)) return value as T;
  return fallback;
}

export function parsePage(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export function parsePageSize(value: string | null): PeoplePageSize {
  const parsed = Number(value);
  if (PEOPLE_PAGE_SIZE_OPTIONS.includes(parsed as PeoplePageSize)) {
    return parsed as PeoplePageSize;
  }
  return DEFAULT_PEOPLE_PAGE_SIZE;
}

export function filtersFromSearchParams(
  searchParams: URLSearchParams,
): PeopleFilters {
  return {
    search: searchParams.get("q") ?? "",
    status: parseEnum(searchParams.get("status"), VALID_STATUSES, "all"),
    membershipType: parseEnum(
      searchParams.get("membership"),
      VALID_MEMBERSHIP,
      "all",
    ),
    evangelismStage: parseEnum(
      searchParams.get("evangelism"),
      VALID_EVANGELISM,
      "all",
    ),
    achievement: parseEnum(
      searchParams.get("achievement"),
      VALID_ACHIEVEMENT,
      "all",
    ),
    prospect: parseEnum(searchParams.get("prospect"), VALID_YES_NO, "all"),
    newcomer: parseEnum(searchParams.get("newcomer"), VALID_YES_NO, "all"),
  };
}

export function buildPeopleListQuery(
  page: number,
  pageSize: PeoplePageSize,
  filters: PeopleFilters,
): string {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.membershipType !== "all") {
    params.set("membership", filters.membershipType);
  }
  if (filters.evangelismStage !== "all") {
    params.set("evangelism", filters.evangelismStage);
  }
  if (filters.achievement !== "all") {
    params.set("achievement", filters.achievement);
  }
  if (filters.prospect !== "all") params.set("prospect", filters.prospect);
  if (filters.newcomer !== "all") params.set("newcomer", filters.newcomer);
  if (page > 1) params.set("page", String(page));
  if (pageSize !== DEFAULT_PEOPLE_PAGE_SIZE) {
    params.set("size", String(pageSize));
  }

  return params.toString();
}

export function savePeopleListNavigation(
  context: PeopleListNavigationContext,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(context));
}

export function loadPeopleListNavigation(): PeopleListNavigationContext | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(NAV_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PeopleListNavigationContext;
    if (!Array.isArray(parsed.personIds)) return null;
    return parsed;
  } catch {
    return null;
  }
}
