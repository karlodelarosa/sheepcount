"use client";

import { useMemo } from "react";
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
import {
  filterRecordsByDateRange,
  getSundayAttendanceTrend,
  getAttendanceByServiceType,
  getEvangelismVisitorCount,
  getSundayStats,
  isSundayRecord,
  type DateRangeValue,
  type GroupedAttendanceRecord,
  type ServiceAttendanceRow,
} from "../_lib/group-attendance";
import { DateRangeFilter } from "./date-range-filter";
import { StatCard } from "./stat-card";

interface AttendanceDashboardTabProps {
  attendanceRecords: GroupedAttendanceRecord[];
  rawAttendance: ServiceAttendanceRow[];
  people: { id: string; membershipType: string }[];
  dateRange: DateRangeValue;
  onDateRangeChange: (range: DateRangeValue) => void;
  dataBounds: DateRangeValue | null;
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

export function AttendanceDashboardTab({
  attendanceRecords,
  rawAttendance,
  people,
  dateRange,
  onDateRangeChange,
  dataBounds,
}: AttendanceDashboardTabProps) {
  const filteredRecords = useMemo(
    () => filterRecordsByDateRange(attendanceRecords, dateRange),
    [attendanceRecords, dateRange],
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

  const evangelismVisitors = useMemo(
    () => getEvangelismVisitorCount(rawAttendance, dateRange, people),
    [rawAttendance, dateRange, people],
  );

  const totalSessions = filteredRecords.length;
  const totalAttendees = filteredRecords.reduce(
    (sum, r) => sum + r.attendees.length,
    0,
  );

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card/50">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">Date range</CardTitle>
          <CardDescription className="text-xs">
            Filter metrics and charts
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <DateRangeFilter
            value={dateRange}
            onChange={onDateRangeChange}
            dataBounds={dataBounds}
          />
        </CardContent>
      </Card>

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
          hint="All types"
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
            <CardDescription className="text-xs">In selected range</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-2.5">
            {serviceBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No records in range
              </p>
            ) : (
              serviceBreakdown.map((item) => {
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
    </div>
  );
}
