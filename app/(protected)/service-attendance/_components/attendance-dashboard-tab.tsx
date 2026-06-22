"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, CalendarDays, UserPlus } from "lucide-react";
import type { Person } from "@/lib/people";
import {
  DEFAULT_AGE_BRACKET_FILTER,
  matchesAgeBracketFilter,
  type AgeBracketFilter,
} from "@/lib/person-demographics";
import {
  buildDashboardAttendeeSummaries,
  buildDashboardBreakdownAttendees,
  filterRecordsByDateRange,
  filterRecordsByServiceCategory,
  filterRowsByServiceCategory,
  getSundayAttendanceTrend,
  getAttendanceByServiceType,
  getSundayStats,
  isSundayRecord,
  type DateRangeValue,
  type GroupedAttendanceRecord,
  type ServiceAttendanceRow,
  type ServiceCategoryFilter,
} from "../_lib/group-attendance";
import { StatCard } from "./stat-card";
import { SessionAttendanceBreakdown } from "./session-attendance-breakdown";
import { DashboardAttendeeList } from "./dashboard-attendee-list";
import { DashboardFiltersPanel } from "./dashboard-filters-panel";
import { DashboardDemographicsCharts } from "./dashboard-demographics-charts";
import { DashboardHealthAssessment } from "./dashboard-health-assessment";
import type { AttendanceStatusKey } from "../_lib/attendance-breakdown";

interface AttendanceDashboardTabProps {
  attendanceRecords: GroupedAttendanceRecord[];
  rawAttendance: ServiceAttendanceRow[];
  people: Person[];
  dateRange: DateRangeValue;
  onDateRangeChange: (range: DateRangeValue) => void;
}

function formatRangeLabel(range: DateRangeValue) {
  const from = new Date(range.from).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const to = new Date(range.to).toLocaleDateString("en-US", {
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

  const breakdownAttendees = useMemo(
    () =>
      buildDashboardBreakdownAttendees(
        rawAttendance,
        people,
        dateRange,
        serviceFilter,
      ).filter(row => allowedPersonIds.has(row.personId)),
    [rawAttendance, people, dateRange, serviceFilter, allowedPersonIds],
  );

  const sundayStats = useMemo(
    () => getSundayStats(filteredRecords),
    [filteredRecords],
  );

  const trend = useMemo(
    () => getSundayAttendanceTrend(filteredRecords),
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
  const totalAttendees = filteredRows.length;

  const serviceFilterLabel = useMemo(() => {
    if (serviceFilter.sunday && serviceFilter.lifeGroup) return "All gatherings";
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
    <div className="space-y-4">
      <Card className="border-border/60 bg-card/50">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">Filters</CardTitle>
          <CardDescription className="text-xs">
            Date range, gathering types, and age brackets
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
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
            No attendees match the current filters.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <StatCard
              variant="violet"
              icon={TrendingUp}
              label="Avg Sunday"
              value={sundayStats.averageAttendance}
              hint={`${sundayStats.sessionCount} service${sundayStats.sessionCount !== 1 ? "s" : ""}`}
            />
            <StatCard
              variant="blue"
              icon={CalendarDays}
              label="Sessions"
              value={totalSessions}
              hint={serviceFilterLabel}
            />
            <StatCard
              variant="emerald"
              icon={Users}
              label="Attendees"
              value={totalAttendees}
              hint="Headcount total"
            />
            <StatCard
              variant="amber"
              icon={UserPlus}
              label="Visitors"
              value={evangelismVisitors}
              hint="For evangelism"
            />
          </div>

          {breakdownAttendees.length > 0 && (
            <SessionAttendanceBreakdown
              attendees={breakdownAttendees}
              activeFilter={statusFilter}
              onFilterChange={setStatusFilter}
            />
          )}

          <DashboardDemographicsCharts attendees={attendeeSummaries} />

          <DashboardHealthAssessment attendees={attendeeSummaries} />

          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3 border-violet-200/60 dark:border-violet-800/40 bg-gradient-to-br from-violet-50/40 to-transparent dark:from-violet-950/20">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  Sunday attendance
                </CardTitle>
                <CardDescription className="text-xs">
                  {formatRangeLabel(dateRange)}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={trend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#8b5cf6"
                        className="dark:fill-violet-400"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-12">
                    No Sunday records in this range
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-border/60 bg-card/50">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">By service</CardTitle>
                <CardDescription className="text-xs">
                  In selected range
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-2.5">
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
                                ? "font-medium text-violet-700 dark:text-violet-300 truncate"
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
                              sunday ? "bg-violet-500" : "bg-slate-400/60"
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
          </div>

          <Card className="border-border/60 bg-card/50">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                People in range
              </CardTitle>
              <CardDescription className="text-xs">
                {statusFilter
                  ? `Filtered list · ${formatRangeLabel(dateRange)} · ${serviceFilterLabel}`
                  : `${attendeeSummaries.length} unique people · ${formatRangeLabel(dateRange)} · ${serviceFilterLabel}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
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
