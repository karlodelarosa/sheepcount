import type { ServiceCategory } from "@/lib/supabase/service-attendance";

export type ServiceAttendanceRow = {
  id: string;
  serviceId: string;
  date: string;
  personId: string;
  serviceType: string;
  serviceCategory: ServiceCategory;
};

export type GroupedAttendanceRecord = {
  serviceId: string;
  serviceType: string;
  serviceCategory: ServiceCategory;
  date: string;
  attendees: string[];
};

export function isSundayRecord(record: {
  serviceCategory: ServiceCategory;
}): boolean {
  return record.serviceCategory === "sunday";
}

export function groupAttendanceBySession(
  records: ServiceAttendanceRow[],
): GroupedAttendanceRecord[] {
  const grouped = records.reduce<Record<string, GroupedAttendanceRecord>>(
    (acc, record) => {
      const key = `${record.serviceId}-${record.date}`;
      if (!acc[key]) {
        acc[key] = {
          serviceId: record.serviceId,
          serviceType: record.serviceType,
          serviceCategory: record.serviceCategory,
          date: record.date,
          attendees: [],
        };
      }
      acc[key].attendees.push(record.personId);
      return acc;
    },
    {},
  );

  return Object.values(grouped).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getSundayStats(records: GroupedAttendanceRecord[]) {
  const sundayRecords = records.filter(isSundayRecord);
  const totalAttendance = sundayRecords.reduce(
    (sum, r) => sum + r.attendees.length,
    0,
  );
  const lastRecord = sundayRecords[0];

  return {
    sessionCount: sundayRecords.length,
    totalAttendance,
    averageAttendance:
      sundayRecords.length > 0
        ? Math.round(totalAttendance / sundayRecords.length)
        : 0,
    lastSundayDate: lastRecord?.date ?? null,
    lastSundayCount: lastRecord?.attendees.length ?? 0,
  };
}

export type DateRangeValue = { from: string; to: string };

export const MAX_DATE_RANGE_DAYS = 365;

function toDateString(date: Date) {
  return date.toISOString().split("T")[0];
}

export function getCurrentMonthRange(referenceDate = new Date()): DateRangeValue {
  const from = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1,
  );
  return { from: toDateString(from), to: toDateString(referenceDate) };
}

export function clampDateRange(
  range: DateRangeValue,
  changed: "from" | "to" = "to",
): DateRangeValue {
  let from = new Date(`${range.from}T12:00:00`);
  let to = new Date(`${range.to}T12:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return range;

  if (to < from) {
    if (changed === "from") to = new Date(from);
    else from = new Date(to);
  }

  const msPerDay = 86_400_000;
  const days = Math.round((to.getTime() - from.getTime()) / msPerDay);
  if (days > MAX_DATE_RANGE_DAYS) {
    if (changed === "from") {
      to = new Date(from);
      to.setDate(to.getDate() + MAX_DATE_RANGE_DAYS);
    } else {
      from = new Date(to);
      from.setDate(from.getDate() - MAX_DATE_RANGE_DAYS);
    }
  }

  return { from: toDateString(from), to: toDateString(to) };
}

export type ServiceCategoryFilter = {
  sunday: boolean;
  lifeGroup: boolean;
};

export function filterRecordsByServiceCategory(
  records: GroupedAttendanceRecord[],
  filter: ServiceCategoryFilter,
): GroupedAttendanceRecord[] {
  return records.filter(record => {
    if (record.serviceCategory === "sunday") return filter.sunday;
    return filter.lifeGroup;
  });
}

export function filterRowsByServiceCategory(
  rows: ServiceAttendanceRow[],
  filter: ServiceCategoryFilter,
): ServiceAttendanceRow[] {
  return rows.filter(row => {
    if (row.serviceCategory === "sunday") return filter.sunday;
    return filter.lifeGroup;
  });
}

export function isDateInRange(
  date: string,
  from: string,
  to: string,
): boolean {
  return date >= from && date <= to;
}

export function filterRecordsByDateRange(
  records: GroupedAttendanceRecord[],
  range: DateRangeValue,
): GroupedAttendanceRecord[] {
  return records.filter((r) =>
    isDateInRange(r.date, range.from, range.to),
  );
}

export function getDataDateBounds(
  records: GroupedAttendanceRecord[],
): DateRangeValue | null {
  if (records.length === 0) return null;

  const dates = records.map((r) => r.date).sort();
  return { from: dates[0], to: dates[dates.length - 1] };
}

export function getSundayAttendanceTrend(
  records: GroupedAttendanceRecord[],
) {
  return records
    .filter(isSundayRecord)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      count: r.attendees.length,
      rawDate: r.date,
    }));
}

export type ServiceTypeBreakdown = {
  serviceId: string;
  serviceType: string;
  serviceCategory: ServiceCategory;
  sessions: number;
  totalAttendees: number;
};

export function getAttendanceByServiceType(
  records: GroupedAttendanceRecord[],
): ServiceTypeBreakdown[] {
  const byService = records.reduce<
    Record<string, ServiceTypeBreakdown>
  >((acc, record) => {
    if (!acc[record.serviceId]) {
      acc[record.serviceId] = {
        serviceId: record.serviceId,
        serviceType: record.serviceType,
        serviceCategory: record.serviceCategory,
        sessions: 0,
        totalAttendees: 0,
      };
    }
    acc[record.serviceId].sessions += 1;
    acc[record.serviceId].totalAttendees += record.attendees.length;
    return acc;
  }, {});

  return Object.values(byService).sort(
    (a, b) => b.totalAttendees - a.totalAttendees,
  );
}

export function getEvangelismVisitorCount(
  rows: ServiceAttendanceRow[],
  range: DateRangeValue,
  people: { id: string; membershipType: string }[],
): number {
  const visitorIds = new Set<string>();

  for (const row of rows) {
    if (!isDateInRange(row.date, range.from, range.to)) continue;
    const person = people.find((p) => p.id === row.personId);
    if (person?.membershipType === "For Evangelism") {
      visitorIds.add(row.personId);
    }
  }

  return visitorIds.size;
}

export type DashboardAttendeeSummary = {
  personId: string;
  name: string;
  householdName: string;
  attendanceCount: number;
  membershipType: string;
  firstAttendance?: string;
  joinDate?: string;
  birthdate?: string;
  age: number;
  gender: import("@/lib/people").PersonGender | null;
};

export function buildDashboardAttendeeSummaries(
  rows: ServiceAttendanceRow[],
  people: {
    id: string;
    name: string;
    householdName: string;
    membershipType: string;
    firstAttendance?: string;
    joinDate?: string;
    birthdate?: string;
    age: number;
    gender: import("@/lib/people").PersonGender | null;
  }[],
  range: DateRangeValue,
  serviceFilter: ServiceCategoryFilter,
): DashboardAttendeeSummary[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    if (!isDateInRange(row.date, range.from, range.to)) continue;
    if (row.serviceCategory === "sunday" && !serviceFilter.sunday) continue;
    if (row.serviceCategory === "life_group" && !serviceFilter.lifeGroup) continue;
    counts.set(row.personId, (counts.get(row.personId) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([personId, attendanceCount]) => {
      const person = people.find(p => p.id === personId);
      return {
        personId,
        name: person?.name ?? "Unknown",
        householdName: person?.householdName ?? "",
        attendanceCount,
        membershipType: person?.membershipType ?? "Attender",
        firstAttendance: person?.firstAttendance,
        joinDate: person?.joinDate,
        birthdate: person?.birthdate,
        age: person?.age ?? 0,
        gender: person?.gender ?? null,
      };
    })
    .sort((a, b) => b.attendanceCount - a.attendanceCount || a.name.localeCompare(b.name));
}

export function buildDashboardBreakdownAttendees(
  rows: ServiceAttendanceRow[],
  people: {
    id: string;
    membershipType: string;
    firstAttendance?: string;
    joinDate?: string;
    birthdate?: string;
    age: number;
    gender: import("@/lib/people").PersonGender | null;
  }[],
  range: DateRangeValue,
  serviceFilter: ServiceCategoryFilter,
) {
  return rows
    .filter(row => {
      if (!isDateInRange(row.date, range.from, range.to)) return false;
      if (row.serviceCategory === "sunday" && !serviceFilter.sunday) return false;
      if (row.serviceCategory === "life_group" && !serviceFilter.lifeGroup) return false;
      return true;
    })
    .map(row => {
      const person = people.find(p => p.id === row.personId);
      return {
        personId: row.personId,
        membershipType: person?.membershipType ?? "Attender",
        firstAttendance: person?.firstAttendance,
        joinDate: person?.joinDate,
        birthdate: person?.birthdate,
        age: person?.age ?? 0,
        gender: person?.gender ?? null,
      };
    });
}
