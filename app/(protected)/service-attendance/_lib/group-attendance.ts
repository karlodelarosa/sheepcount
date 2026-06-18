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
