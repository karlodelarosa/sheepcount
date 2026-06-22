import {
  getMembershipDisplayLabel,
  getPersonVisitDate,
} from "@/lib/membership-path";
import type { MembershipType } from "@/lib/people";

export type AttendanceStatusKey =
  | "Worker"
  | "Volunteer"
  | "Member"
  | "Attender"
  | "New Comer"
  | "Visitor";

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatusKey, string> = {
  Worker: "Workers",
  Volunteer: "Volunteers",
  Member: "Members",
  Attender: "Attenders",
  "New Comer": "New Comers",
  Visitor: "Visitors",
};

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatusKey, string> = {
  Worker: "#9333ea",
  Volunteer: "#7c3aed",
  Member: "#2563eb",
  Attender: "#16a34a",
  "New Comer": "#0d9488",
  Visitor: "#d97706",
};

export const ATTENDANCE_STATUS_BADGE_CLASSES: Record<AttendanceStatusKey, string> =
  {
    Worker:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800/60",
    Volunteer:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800/60",
    Member:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800/60",
    Attender:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800/60",
    "New Comer":
      "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-800/60",
    Visitor:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800/60",
  };

export const ATTENDANCE_STATUS_ROW_ACCENT: Record<AttendanceStatusKey, string> =
  {
    Worker: "border-l-purple-500",
    Volunteer: "border-l-violet-500",
    Member: "border-l-blue-500",
    Attender: "border-l-green-500",
    "New Comer": "border-l-teal-500",
    Visitor: "border-l-amber-500",
  };

export type SessionAttendeeLike = {
  membershipType: MembershipType | string;
  firstAttendance?: string;
  joinDate?: string;
};

export function classifyAttendeeStatus(
  attendee: SessionAttendeeLike,
): AttendanceStatusKey {
  const visitDate = getPersonVisitDate(attendee);
  const label = getMembershipDisplayLabel(attendee.membershipType, visitDate);

  switch (label) {
    case "Worker":
      return "Worker";
    case "Volunteer":
      return "Volunteer";
    case "Member":
      return "Member";
    case "New Comer":
      return "New Comer";
    case "Attender":
      return "Attender";
    default:
      return "Visitor";
  }
}

export function attendeeMatchesStatusFilter(
  attendee: SessionAttendeeLike,
  filter: AttendanceStatusKey | null,
): boolean {
  if (!filter) return true;
  return classifyAttendeeStatus(attendee) === filter;
}

export function getAttendeeStatusBadgeClass(
  attendee: SessionAttendeeLike,
): string {
  return ATTENDANCE_STATUS_BADGE_CLASSES[classifyAttendeeStatus(attendee)];
}

export function getAttendeeStatusRowAccent(
  attendee: SessionAttendeeLike,
): string {
  return ATTENDANCE_STATUS_ROW_ACCENT[classifyAttendeeStatus(attendee)];
}

export function computeAttendanceBreakdown(attendees: SessionAttendeeLike[]) {
  const counts: Record<AttendanceStatusKey, number> = {
    Worker: 0,
    Volunteer: 0,
    Member: 0,
    Attender: 0,
    "New Comer": 0,
    Visitor: 0,
  };

  for (const attendee of attendees) {
    counts[classifyAttendeeStatus(attendee)]++;
  }

  const order: AttendanceStatusKey[] = [
    "Worker",
    "Volunteer",
    "Member",
    "Attender",
    "New Comer",
    "Visitor",
  ];

  return order
    .filter(key => counts[key] > 0)
    .map(key => ({
      key,
      label: ATTENDANCE_STATUS_LABELS[key],
      count: counts[key],
      color: ATTENDANCE_STATUS_COLORS[key],
    }));
}

export function computeWorkerVsCongregation(attendees: SessionAttendeeLike[]) {
  let workers = 0;
  let attendersAndNewComers = 0;
  let others = 0;

  for (const attendee of attendees) {
    const status = classifyAttendeeStatus(attendee);
    if (status === "Worker" || status === "Volunteer") {
      workers++;
    } else if (status === "Attender" || status === "New Comer") {
      attendersAndNewComers++;
    } else {
      others++;
    }
  }

  return {
    workers,
    attendersAndNewComers,
    others,
    total: attendees.length,
  };
}
