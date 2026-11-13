"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Users, CalendarDays, UserPlus } from "lucide-react";
import type { Person } from "@/lib/people";
import {
  DEFAULT_AGE_BRACKET_FILTER,
  matchesAgeBracketFilter,
  type AgeBracketFilter,
} from "@/lib/person-demographics";
import {
  buildDashboardAttendeeSummaries,
  filterRecordsByDateRange,
  filterRecordsByServiceCategory,
  filterRowsByServiceCategory,
  getAttendanceByServiceType,
  getSundayStats,
  isSundayRecord,
  type DateRangeValue,
  type GroupedAttendanceRecord,
  type ServiceAttendanceRow,
  type ServiceCategoryFilter,
} from "../_lib/group-attendance";
import { DashboardPrimaryPanels } from "./dashboard-primary-panels";
import { StatCard } from "./stat-card";
import { SessionAttendanceBreakdown } from "./session-attendance-breakdown";
import { DashboardAttendeeList } from "./dashboard-attendee-list";
import { DashboardFiltersPanel } from "./dashboard-filters-panel";
import { DashboardDemographicsCharts } from "./dashboard-demographics-charts";
import { DashboardHealthAssessment } from "./dashboard-health-assessment";
import type { AttendanceStatusKey } from "../_lib/attendance-breakdown";

interface AttendanceDashboardTabProps {
  onOpenSession: (record: GroupedAttendanceRecord) => void;
  onViewAll: () => void;
  attendanceRecords: GroupedAttendanceRecord[];
  rawAttendance: ServiceAttendanceRow[];
  people: Person[];
  dateRange: DateRangeValue;
  onDateRangeChange: (range: DateRangeValue) => void;
}

function formatRangeLabel(range: DateRangeValue) {
  const from = new Date(`${range.from}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const to = new Date(`${range.to}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${from} – ${to}`;
}

function filterGroupedByPersonIds(
  records: GroupedAttendanceRecord[],
  allowedIds: Set<string>,
): GroupedAttendanceRecord[] {
  return records
    .map(record => ({
      ...record,
      attendees: record.attendees.filter(id => allowedIds.has(id)),
    }))
    .filter(record => record.attendees.length > 0);
}

export function AttendanceDashboardTab({
  onOpenSession,
  onViewAll,
  attendanceRecords,
  rawAttendance,
  people,
  dateRange,
  onDateRangeChange,
}: AttendanceDashboardTabProps) {
  const [serviceFilter, setServiceFilter] = useState<ServiceCategoryFilter>({
    sunday: true,
    lifeGroup: true,
  });
  const [ageFilter, setAgeFilter] = useState<AgeBracketFilter>(
    DEFAULT_AGE_BRACKET_FILTER,
  );
  const [statusFilter, setStatusFilter] = useState<AttendanceStatusKey | null>(
    null,
  );

  const baseSummaries = useMemo(
    () =>
      buildDashboardAttendeeSummaries(
        rawAttendance,
        people,
        dateRange,
        serviceFilter,
      ),
    [rawAttendance, people, dateRange, serviceFilter],
  );

  const attendeeSummaries = useMemo(
    () =>
      baseSummaries.filter(person =>
        matchesAgeBracketFilter(person.age, person.birthdate, ageFilter),
      ),
    [baseSummaries, ageFilter],
  );

  const allowedPersonIds = useMemo(
    () => new Set(attendeeSummaries.map(person => person.personId)),
    [attendeeSummaries],
  );

  const filteredRows = useMemo(() => {
    const byDate = rawAttendance.filter(
      row => row.date >= dateRange.from && row.date <= dateRange.to,
    );
    const byService = filterRowsByServiceCategory(byDate, serviceFilter);
    return byService.filter(row => allowedPersonIds.has(row.personId));
  }, [rawAttendance, dateRange, serviceFilter, allowedPersonIds]);

  const filteredRecords = useMemo(() => {
    const byDate = filterRecordsByDateRange(attendanceRecords, dateRange);
    const byService = filterRecordsByServiceCategory(byDate, serviceFilter);
    return filterGroupedByPersonIds(byService, allowedPersonIds);
  }, [attendanceRecords, dateRange, serviceFilter, allowedPersonIds]);

  const sundayStats = useMemo(
    () => getSundayStats(filteredRecords),
    [filteredRecords],
  );

  const serviceBreakdown = useMemo(
    () => getAttendanceByServiceType(filteredRecords),
    [filteredRecords],
  );

  const evangelismVisitors = useMemo(() => {
    const visitorIds = new Set<string>();
    for (const row of filteredRows) {
      const person = people.find(p => p.id === row.personId);
      if (person?.membershipType === "For Evangelism") {
        visitorIds.add(row.personId);
      }
    }
    return visitorIds.size;
  }, [filteredRows, people]);

  const totalSessions = filteredRecords.length;
  const totalAttendees = attendeeSummaries.length;

  const serviceFilterLabel = useMemo(() => {
    if (serviceFilter.sunday && serviceFilter.lifeGroup)
      return "All gatherings";
    if (serviceFilter.sunday) return "Sunday services only";
    if (serviceFilter.lifeGroup) return "Life groups only";
    return "No gathering type selected";
  }, [serviceFilter]);

  const handleServiceFilterChange = (next: ServiceCategoryFilter) => {
    setServiceFilter(next);
    setStatusFilter(null);
  };

  const handleAgeFilterChange = (next: AgeBracketFilter) => {
    setAgeFilter(next);
    setStatusFilter(null);
  };

  const hasGatheringFilter = serviceFilter.sunday || serviceFilter.lifeGroup;

  return (
    <div className="space-y-5 [&_.recharts-wrapper]:overflow-hidden">
      <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
        <CardContent className="p-5">
          <DashboardFiltersPanel
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            serviceFilter={serviceFilter}
            onServiceFilterChange={handleServiceFilterChange}
            ageFilter={ageFilter}
            onAgeFilterChange={handleAgeFilterChange}
          />
        </CardContent>
      </Card>

      {!hasGatheringFilter ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Select at least one gathering type to view dashboard data.
          </CardContent>
        </Card>
      ) : attendeeSummaries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            {rawAttendance.length === 0
              ? "No attendance recorded yet. Use Record Attendance to add your first service."
              : "No attendees match the current filters. Adjust your filters or use Reset filters."}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              variant="accent"
              icon={TrendingUp}
              label="Avg. Sunday Attendance"
              value={sundayStats.averageAttendance}
              hint={`${sundayStats.sessionCount} service${sundayStats.sessionCount !== 1 ? "s" : ""}`}
            />
            <StatCard
              variant="blue"
              icon={CalendarDays}
              label="Total Sessions"
              value={totalSessions}
              hint={serviceFilterLabel}
            />
            <StatCard
              variant="emerald"
              icon={Users}
              label="Unique Attendees"
              value={totalAttendees}
              hint="Individuals in selected filters"
            />
            <StatCard
              variant="amber"
              icon={UserPlus}
              label="Visitors"
              value={evangelismVisitors}
              hint="For evangelism"
            />
          </div>

          <DashboardPrimaryPanels
            records={filteredRecords}
            attendees={attendeeSummaries}
            activeFilter={statusFilter}
            onFilterChange={setStatusFilter}
            onOpenSession={onOpenSession}
            onViewAll={onViewAll}
          />
          <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
            <SessionAttendanceBreakdown
              attendees={attendeeSummaries}
              activeFilter={statusFilter}
              onFilterChange={setStatusFilter}
              hideStatus
            />
            <DashboardHealthAssessment attendees={attendeeSummaries} />
          </div>
          <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
            <Card className="min-w-0 rounded-2xl border-border/60 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-base font-bold">
                  <CalendarDays className="size-5 shrink-0 text-[var(--accent-color)]" />
                  By Service
                </CardTitle>
                <CardDescription>In selected range</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {serviceBreakdown.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No records in range
                  </p>
                ) : (
                  serviceBreakdown.map(item => {
                    const maxCount = serviceBreakdown[0]?.totalAttendees ?? 1;
                    const width = (item.totalAttendees / maxCount) * 100;
                    const sunday = isSundayRecord(item);

                    return (
                      <div key={item.serviceId} className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span
                            className={
                              sunday
                                ? "font-medium text-[var(--accent-color-strong)] dark:text-[var(--accent-color)] truncate"
                                : "text-muted-foreground truncate"
                            }
                          >
                            {item.serviceType}
                          </span>
                          <span className="tabular-nums shrink-0">
                            {item.totalAttendees}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sunday
                                ? "bg-[var(--accent-color)]"
                                : "bg-slate-400/60"
                            }`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
            <DashboardDemographicsCharts
              attendees={attendeeSummaries}
              hideAge
            />
          </div>

          <Card className="min-w-0 rounded-2xl border-border/60 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-base font-bold">
                <Users className="size-5 shrink-0 text-[var(--accent-color)]" />
                People in range
              </CardTitle>
              <CardDescription>
                {statusFilter
                  ? `Filtered list · ${formatRangeLabel(dateRange)} · ${serviceFilterLabel}`
                  : `${attendeeSummaries.length} unique people · ${formatRangeLabel(dateRange)} · ${serviceFilterLabel}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardAttendeeList
                attendees={attendeeSummaries}
                statusFilter={statusFilter}
                onClearFilter={() => setStatusFilter(null)}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
