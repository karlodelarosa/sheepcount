import {
  computeAttendanceBreakdown,
  type SessionAttendeeLike,
} from "./attendance-breakdown";
import {
  isSundayRecord,
  type GroupedAttendanceRecord,
} from "./group-attendance";

export function getDashboardCategories(
  attendees: (SessionAttendeeLike & { personId: string })[],
) {
  const unique = [
    ...new Map(attendees.map(person => [person.personId, person])).values(),
  ];
  return computeAttendanceBreakdown(unique).map(item => ({
    ...item,
    percentage: unique.length
      ? Math.round((item.count / unique.length) * 100)
      : 0,
  }));
}
export function getRecentSundaySessions(records: GroupedAttendanceRecord[]) {
  return records
    .filter(isSundayRecord)
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        a.serviceType.localeCompare(b.serviceType),
    )
    .slice(0, 3);
}
