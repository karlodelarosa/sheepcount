import type { Person } from "@/lib/people";
import type { OutreachPriority } from "@/lib/growth-track/types";
import type { PersonAttendanceRow } from "./person-attendance";
import { getPersonAttendanceRows } from "./person-attendance";

export const VISIT_THRESHOLD_DAYS = 30;
export const CHECK_IN_THRESHOLD_DAYS = 14;
export const NEW_MEMBER_GRACE_DAYS = 30;

export type PastoralCareLevel =
  | "regular"
  | "check_in"
  | "needs_visit"
  | "needs_contact"
  | "needs_follow_up"
  | "new_member"
  | "inactive";

export type PersonPastoralStatus = {
  level: PastoralCareLevel;
  label: string;
  description: string;
  daysSinceLastSeen: number | null;
  lastSeenDate: string | null;
  suggestedAction: string;
};

function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function getLastSundayDate(
  personRows: PersonAttendanceRow[],
  lastAttendanceFromProfile?: string,
): string | null {
  const lastSunday = personRows.find(row => row.serviceCategory === "sunday");
  if (lastSunday) return lastSunday.date;
  if (lastAttendanceFromProfile) return lastAttendanceFromProfile;
  return personRows[0]?.date ?? null;
}

function formatLastSeen(date: string): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildStatus(
  level: PastoralCareLevel,
  label: string,
  description: string,
  suggestedAction: string,
  lastSeenDate: string | null,
  daysSinceLastSeen: number | null,
): PersonPastoralStatus {
  return {
    level,
    label,
    description,
    suggestedAction,
    lastSeenDate,
    daysSinceLastSeen,
  };
}

export function getPersonPastoralStatus(
  person: Person,
  attendanceRows: PersonAttendanceRow[],
  outreachPriority?: OutreachPriority | null,
): PersonPastoralStatus {
  if (person.status === "Inactive" || person.status === "Exited") {
    return buildStatus(
      "inactive",
      person.status,
      `This person is marked as ${person.status.toLowerCase()}.`,
      "Update their status if they have returned to church.",
      null,
      null,
    );
  }

  const personRows = getPersonAttendanceRows(attendanceRows, person.id);
  const lastSeenDate = getLastSundayDate(personRows, person.lastAttendance);
  const daysSinceLastSeen = lastSeenDate ? daysSince(lastSeenDate) : null;

  if (outreachPriority === "contact") {
    return buildStatus(
      "needs_contact",
      "Needs first contact",
      "First-time attendee who hasn't been reached out to yet.",
      "Send a welcome message or make an introductory call.",
      lastSeenDate,
      daysSinceLastSeen,
    );
  }

  if (outreachPriority === "follow_up") {
    return buildStatus(
      "needs_follow_up",
      "Needs follow-up",
      "In follow-up stage but no follow-up message or call logged yet.",
      "Log a follow-up call or message in Growth Track.",
      lastSeenDate,
      daysSinceLastSeen,
    );
  }

  if (!lastSeenDate) {
    const daysSinceJoin = daysSince(person.joinDate);
    if (daysSinceJoin <= NEW_MEMBER_GRACE_DAYS) {
      return buildStatus(
        "new_member",
        "New — no attendance yet",
        `Joined ${formatLastSeen(person.joinDate)}. No service attendance recorded.`,
        "Welcome them and invite them to their next visit.",
        null,
        null,
      );
    }

    return buildStatus(
      "needs_visit",
      "Needs visiting",
      `No attendance on record since joining ${formatLastSeen(person.joinDate)}.`,
      "Schedule a home or pastoral visit to reconnect.",
      null,
      null,
    );
  }

  if (
    outreachPriority === "visitation" ||
    (daysSinceLastSeen !== null && daysSinceLastSeen >= VISIT_THRESHOLD_DAYS)
  ) {
    return buildStatus(
      "needs_visit",
      "Needs visiting",
      `Last seen ${formatLastSeen(lastSeenDate)} — ${daysSinceLastSeen} day${daysSinceLastSeen === 1 ? "" : "s"} ago.`,
      "Schedule a home or pastoral visit to check in.",
      lastSeenDate,
      daysSinceLastSeen,
    );
  }

  if (daysSinceLastSeen !== null && daysSinceLastSeen >= CHECK_IN_THRESHOLD_DAYS) {
    return buildStatus(
      "check_in",
      "Due for check-in",
      `Last seen ${formatLastSeen(lastSeenDate)} — ${daysSinceLastSeen} days without attendance.`,
      "Send a quick message or call to see how they're doing.",
      lastSeenDate,
      daysSinceLastSeen,
    );
  }

  return buildStatus(
    "regular",
    "Attending regularly",
    lastSeenDate
      ? `Last seen ${formatLastSeen(lastSeenDate)}${daysSinceLastSeen !== null ? ` (${daysSinceLastSeen} day${daysSinceLastSeen === 1 ? "" : "s"} ago)` : ""}.`
      : "Recent attendance on record.",
    "No immediate pastoral action needed.",
    lastSeenDate,
    daysSinceLastSeen,
  );
}

export function isPastoralAlertLevel(level: PastoralCareLevel): boolean {
  return (
    level === "needs_visit" ||
    level === "check_in" ||
    level === "needs_contact" ||
    level === "needs_follow_up"
  );
}

export const PASTORAL_LEVEL_STYLES: Record<
  PastoralCareLevel,
  { badge: string; banner: string; icon: string }
> = {
  needs_visit: {
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    banner:
      "border-rose-200/80 bg-rose-50/80 dark:border-rose-900/50 dark:bg-rose-950/30",
    icon: "text-rose-600 dark:text-rose-400",
  },
  check_in: {
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    banner:
      "border-amber-200/80 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30",
    icon: "text-amber-600 dark:text-amber-400",
  },
  needs_contact: {
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
    banner:
      "border-sky-200/80 bg-sky-50/80 dark:border-sky-900/50 dark:bg-sky-950/30",
    icon: "text-sky-600 dark:text-sky-400",
  },
  needs_follow_up: {
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
    banner:
      "border-orange-200/80 bg-orange-50/80 dark:border-orange-900/50 dark:bg-orange-950/30",
    icon: "text-orange-600 dark:text-orange-400",
  },
  new_member: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    banner:
      "border-blue-200/80 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/30",
    icon: "text-blue-600 dark:text-blue-400",
  },
  regular: {
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    banner:
      "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/30",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  inactive: {
    badge: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400",
    banner:
      "border-slate-200/80 bg-slate-50/80 dark:border-zinc-700/50 dark:bg-zinc-900/30",
    icon: "text-slate-500 dark:text-zinc-500",
  },
};
