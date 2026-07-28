import type { Person } from "@/lib/people";
import type { LifeGroupMember } from "@/lib/supabase/life-groups";
import { getBirthdaySortKey } from "@/lib/person-birthdate";

/**
 * Action-oriented signals for the dashboard "Needs attention" area.
 *
 * These are the buckets the shepherding worklist (lib/shepherding.ts) does NOT
 * already cover: newcomers to connect, data-entry gaps, and this week's
 * pastoral reminders. Everything here is surface-and-link — no writes.
 */

const NEW_MEMBER_WINDOW_DAYS = 90;
const CONNECTED_MEMBERSHIP: ReadonlySet<Person["membershipType"]> = new Set([
  "Member",
  "Attender",
  "Worker",
  "Volunteer Worker",
]);

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysSince(dateStr: string, now: Date): number | null {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000,
  );
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Active members who joined recently but aren't in any life group yet —
 * the assimilation gap.
 */
export function getUnassignedNewMembers(
  people: Person[],
  lifeGroupMembers: LifeGroupMember[],
  now: Date = new Date(),
): Person[] {
  const grouped = new Set(lifeGroupMembers.map(member => member.personId));

  return people
    .filter(person => {
      if (person.status !== "Active") return false;
      if (!CONNECTED_MEMBERSHIP.has(person.membershipType)) return false;
      if (grouped.has(person.id)) return false;
      const joined = daysSince(person.joinDate, now);
      return joined !== null && joined <= NEW_MEMBER_WINDOW_DAYS;
    })
    .sort(
      (a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
    );
}

/**
 * The date of this week's Sunday if it has passed but has no attendance
 * recorded yet — otherwise null. Never nags on Sunday itself.
 */
export function getUnrecordedSunday(
  latestRecordedSundayISO: string | null,
  now: Date = new Date(),
): string | null {
  const today = startOfDay(now);
  const dayOfWeek = today.getDay(); // 0 = Sunday
  if (dayOfWeek === 0) return null; // today is Sunday — service may not have happened

  const thisSunday = new Date(today);
  thisSunday.setDate(today.getDate() - dayOfWeek);
  const thisSundayISO = toISODate(thisSunday);

  if (!latestRecordedSundayISO) return thisSundayISO;
  return latestRecordedSundayISO < thisSundayISO ? thisSundayISO : null;
}

export interface UpcomingBirthday {
  person: Person;
  inDays: number;
}

function daysUntilBirthday(birthdate: string, now: Date): number | null {
  const key = getBirthdaySortKey(birthdate);
  if (key === null) return null;
  const month = Math.floor(key / 100) - 1;
  const day = key % 100;

  const today = startOfDay(now);
  let next = new Date(today.getFullYear(), month, day);
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, month, day);
  }
  return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}

/** People whose birthday falls within the next `withinDays` days. */
export function getUpcomingBirthdays(
  people: Person[],
  now: Date = new Date(),
  withinDays = 7,
): UpcomingBirthday[] {
  const result: UpcomingBirthday[] = [];
  for (const person of people) {
    if (person.status !== "Active") continue;
    if (!person.birthdate) continue;
    const inDays = daysUntilBirthday(person.birthdate, now);
    if (inDays === null || inDays > withinDays) continue;
    result.push({ person, inDays });
  }
  return result.sort((a, b) => a.inDays - b.inDays);
}
