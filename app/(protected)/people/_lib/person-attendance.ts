import type { ServiceCategory } from "@/lib/supabase/service-attendance";
import {
  groupAttendanceBySession,
  isSundayRecord,
  type GroupedAttendanceRecord,
} from "@/app/(protected)/service-attendance/_lib/group-attendance";

export type PersonAttendanceRow = {
  id: string;
  personId: string;
  date: string;
  serviceId: string;
  serviceType: string;
  serviceCategory: ServiceCategory;
};

export type PersonAttendanceStats = {
  totalAttended: number;
  sundayAttended: number;
  sundayRate: number;
  sundaySessionsInPeriod: number;
  lastAttendanceDate: string | null;
  currentStreak: number;
};

export type PersonAttendanceTrendPoint = {
  date: string;
  label: string;
  attended: number;
};

export type PersonServiceBreakdown = {
  serviceId: string;
  serviceType: string;
  serviceCategory: ServiceCategory;
  count: number;
};

export type PersonRecentAttendance = {
  date: string;
  serviceType: string;
  serviceCategory: ServiceCategory;
};

const DEFAULT_LOOKBACK_WEEKS = 13;

export function getPersonAttendanceRows(
  rows: PersonAttendanceRow[],
  personId: string,
): PersonAttendanceRow[] {
  return rows
    .filter((row) => row.personId === personId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getSundaySessions(
  groupedRecords: GroupedAttendanceRecord[],
): GroupedAttendanceRecord[] {
  return groupedRecords
    .filter(isSundayRecord)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getLookbackSundaySessions(
  groupedRecords: GroupedAttendanceRecord[],
  weeks = DEFAULT_LOOKBACK_WEEKS,
): GroupedAttendanceRecord[] {
  const sundaySessions = getSundaySessions(groupedRecords);
  if (sundaySessions.length === 0) return [];

  const latestDate = sundaySessions[sundaySessions.length - 1].date;
  const cutoff = new Date(latestDate);
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return sundaySessions.filter((session) => session.date >= cutoffStr);
}

function computeStreak(
  sundaySessions: GroupedAttendanceRecord[],
  personId: string,
): number {
  const sorted = [...sundaySessions].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  let streak = 0;
  for (const session of sorted) {
    if (session.attendees.includes(personId)) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export function buildPersonAttendanceStats(
  allRows: PersonAttendanceRow[],
  personId: string,
  lastAttendanceFromProfile?: string,
): PersonAttendanceStats {
  const personRows = getPersonAttendanceRows(allRows, personId);
  const grouped = groupAttendanceBySession(allRows);
  const lookbackSessions = getLookbackSundaySessions(grouped);
  const sundayAttended = lookbackSessions.filter((session) =>
    session.attendees.includes(personId),
  ).length;

  const lastFromRecords = personRows[0]?.date ?? null;
  const lastAttendanceDate =
    lastFromRecords ||
    (lastAttendanceFromProfile ? lastAttendanceFromProfile : null);

  return {
    totalAttended: personRows.length,
    sundayAttended,
    sundayRate:
      lookbackSessions.length > 0
        ? Math.round((sundayAttended / lookbackSessions.length) * 100)
        : 0,
    sundaySessionsInPeriod: lookbackSessions.length,
    lastAttendanceDate,
    currentStreak: computeStreak(getSundaySessions(grouped), personId),
  };
}

export function getPersonSundayTrend(
  allRows: PersonAttendanceRow[],
  personId: string,
  weeks = DEFAULT_LOOKBACK_WEEKS,
): PersonAttendanceTrendPoint[] {
  const grouped = groupAttendanceBySession(allRows);
  const lookbackSessions = getLookbackSundaySessions(grouped, weeks);

  return lookbackSessions.map((session) => ({
    date: session.date,
    label: new Date(session.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    attended: session.attendees.includes(personId) ? 1 : 0,
  }));
}

export function getPersonServiceBreakdown(
  personRows: PersonAttendanceRow[],
): PersonServiceBreakdown[] {
  const byService = personRows.reduce<
    Record<string, PersonServiceBreakdown>
  >((acc, row) => {
    if (!acc[row.serviceId]) {
      acc[row.serviceId] = {
        serviceId: row.serviceId,
        serviceType: row.serviceType,
        serviceCategory: row.serviceCategory,
        count: 0,
      };
    }
    acc[row.serviceId].count += 1;
    return acc;
  }, {});

  return Object.values(byService).sort((a, b) => b.count - a.count);
}

export function getPersonRecentAttendance(
  personRows: PersonAttendanceRow[],
  limit = 8,
): PersonRecentAttendance[] {
  return personRows.slice(0, limit).map((row) => ({
    date: row.date,
    serviceType: row.serviceType,
    serviceCategory: row.serviceCategory,
  }));
}

export function getAttendanceRateTone(
  rate: number,
): "good" | "fair" | "low" | "none" {
  if (rate === 0) return "none";
  if (rate >= 75) return "good";
  if (rate >= 50) return "fair";
  return "low";
}
