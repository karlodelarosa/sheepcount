import type { Person } from "@/lib/people";
import type { GrowthTrackPerson } from "@/lib/growth-track/types";
import type { GrowthTrackActivity } from "@/lib/supabase/growth-track";
import type { PersonAttendanceRow } from "@/app/(protected)/people/_lib/person-attendance";
import {
  getPersonPastoralStatus,
  isPastoralAlertLevel,
  type PastoralCareLevel,
  type PersonPastoralStatus,
} from "@/app/(protected)/people/_lib/person-pastoral-status";

/**
 * Turns the pastoral-status engine into an actionable shepherding worklist for
 * the mobile app. Reuses getPersonPastoralStatus / isPastoralAlertLevel (the
 * same rules the desktop person profile uses) and adds two things the worklist
 * needs: a snooze (so someone recently reached out to drops off for a while)
 * and an urgency ordering.
 */

// Once any of these is logged for a person, they're considered "recently
// shepherded" and are hidden from the list for SHEPHERD_SNOOZE_DAYS.
const ACTION_ACTIVITY_TYPES = new Set([
  "visitation",
  "contact",
  "follow_up_call",
  "follow_up_message",
  "outreach",
]);

export const SHEPHERD_SNOOZE_DAYS = 14;

// Most urgent first.
const LEVEL_ORDER: PastoralCareLevel[] = [
  "needs_visit",
  "needs_contact",
  "needs_follow_up",
  "check_in",
];

export type ShepherdActionType = "visitation" | "contact" | "follow_up_call";

export const LEVEL_ACTION: Record<
  string,
  { type: ShepherdActionType; label: string }
> = {
  needs_visit: { type: "visitation", label: "Log visit" },
  needs_contact: { type: "contact", label: "Log contact" },
  needs_follow_up: { type: "follow_up_call", label: "Log follow-up" },
  check_in: { type: "contact", label: "Log check-in" },
};

export interface ShepherdItem {
  person: Person;
  status: PersonPastoralStatus;
}

function daysBetween(fromISO: string, now: Date): number {
  const from = new Date(fromISO);
  from.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

/** Most recent outreach/visit timestamp per person, from the activity log. */
function latestActionByPerson(
  activities: GrowthTrackActivity[],
): Map<string, string> {
  const latest = new Map<string, string>();
  for (const activity of activities) {
    if (!ACTION_ACTIVITY_TYPES.has(activity.activityType)) continue;
    const current = latest.get(activity.personId);
    if (!current || activity.performedAt > current) {
      latest.set(activity.personId, activity.performedAt);
    }
  }
  return latest;
}

export function buildShepherdWorklist(params: {
  people: Person[];
  attendanceRows: PersonAttendanceRow[];
  growthPeople: GrowthTrackPerson[];
  activities: GrowthTrackActivity[];
  now?: Date;
}): ShepherdItem[] {
  const { people, attendanceRows, growthPeople, activities } = params;
  const now = params.now ?? new Date();

  const priorityById = new Map(
    growthPeople.map(person => [person.id, person.outreachPriority]),
  );
  const lastActionById = latestActionByPerson(activities);

  const items: ShepherdItem[] = [];
  for (const person of people) {
    const status = getPersonPastoralStatus(
      person,
      attendanceRows,
      priorityById.get(person.id) ?? null,
    );
    if (!isPastoralAlertLevel(status.level)) continue;

    const lastAction = lastActionById.get(person.id);
    if (lastAction && daysBetween(lastAction, now) < SHEPHERD_SNOOZE_DAYS) {
      continue;
    }

    items.push({ person, status });
  }

  return items.sort((a, b) => {
    const levelDiff =
      LEVEL_ORDER.indexOf(a.status.level) - LEVEL_ORDER.indexOf(b.status.level);
    if (levelDiff !== 0) return levelDiff;
    // Within a level, the longest-unseen first.
    return (
      (b.status.daysSinceLastSeen ?? 0) - (a.status.daysSinceLastSeen ?? 0)
    );
  });
}

export function groupByLevel(
  items: ShepherdItem[],
): { level: PastoralCareLevel; items: ShepherdItem[] }[] {
  return LEVEL_ORDER.map(level => ({
    level,
    items: items.filter(item => item.status.level === level),
  })).filter(group => group.items.length > 0);
}
