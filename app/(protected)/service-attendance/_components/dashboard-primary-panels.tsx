"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  CalendarDays,
  TrendingUp,
  Users,
  ChartPie,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AGE_BRACKET_LABELS,
  getAgeBracket,
  type AgeBracketKey,
} from "@/lib/person-demographics";
import {
  getSundayAttendanceTrend,
  type DashboardAttendeeSummary,
  type GroupedAttendanceRecord,
} from "../_lib/group-attendance";
import {
  getDashboardCategories,
  getRecentSundaySessions,
} from "../_lib/dashboard-summary";
import type { AttendanceStatusKey } from "../_lib/attendance-breakdown";

interface Props {
  records: GroupedAttendanceRecord[];
  attendees: DashboardAttendeeSummary[];
  activeFilter: AttendanceStatusKey | null;
  onFilterChange: (filter: AttendanceStatusKey | null) => void;
  onOpenSession: (record: GroupedAttendanceRecord) => void;
  onViewAll: () => void;
}
const panel = "min-w-0 rounded-2xl border-border/60 bg-card shadow-sm";
const heading =
  "flex items-center gap-3 text-base font-bold [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-[var(--accent-color)]";
function dateLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardPrimaryPanels({
  records,
  attendees,
  activeFilter,
  onFilterChange,
  onOpenSession,
  onViewAll,
}: Props) {
  const trend = getSundayAttendanceTrend(records);
  const categories = getDashboardCategories(attendees);
  const recent = getRecentSundaySessions(records);
  const ageCounts = attendees.reduce(
    (counts, person) => {
      const key = getAgeBracket(person.age, person.birthdate);
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    },
    {} as Partial<Record<AgeBracketKey, number>>,
  );
  const maxAgeCount = Math.max(1, ...Object.values(ageCounts));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className={panel}>
          <CardHeader>
            <CardTitle className={heading}>
              <TrendingUp aria-hidden="true" />
              Attendance Trend
            </CardTitle>
            <CardDescription>
              Sunday service attendance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trend.length ? (
              <>
                <div aria-hidden="true" className="h-56 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend}>
                      <CartesianGrid
                        vertical={false}
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "currentColor" }}
                      />
                      <YAxis
                        allowDecimals={false}
                        width={32}
                        tick={{ fontSize: 11, fill: "currentColor" }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          color: "hsl(var(--foreground))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: 12,
                        }}
                      />
                      <Bar
                        dataKey="count"
                        name="Attendance"
                        fill="var(--accent-color)"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="sr-only">
                  {trend
                    .map(item => `${item.date}: ${item.count} attendees`)
                    .join("; ")}
                </p>
              </>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No Sunday records in this range
              </p>
            )}
          </CardContent>
        </Card>
        <Card className={panel}>
          <CardHeader>
            <CardTitle className={heading}>
              <ChartPie aria-hidden="true" />
              Attendance by Category
            </CardTitle>
            <CardDescription>
              Unique people · select a category to filter the attendee list
            </CardDescription>
          </CardHeader>
          <CardContent className="grid items-center gap-4 sm:grid-cols-2">
            <div className="relative h-52 min-w-0" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={62}
                    outerRadius={88}
                    stroke="hsl(var(--card))"
                  >
                    {categories.map(item => (
                      <Cell
                        key={item.key}
                        fill={item.color}
                        opacity={
                          activeFilter && activeFilter !== item.key ? 0.35 : 1
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-3xl tabular-nums">
                  {attendees.length}
                </strong>
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
            </div>
            <div className="space-y-1">
              {categories.map(item => (
                <button
                  type="button"
                  key={item.key}
                  aria-pressed={activeFilter === item.key}
                  onClick={() =>
                    onFilterChange(activeFilter === item.key ? null : item.key)
                  }
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-2 text-left text-sm hover:bg-muted aria-pressed:bg-[var(--accent-color-soft)]"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {item.count}{" "}
                    <span className="text-muted-foreground">
                      ({item.percentage}%)
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[.85fr_1.15fr]">
        <Card className={panel}>
          <CardHeader>
            <CardTitle className={heading}>
              <Users aria-hidden="true" />
              By Age Group
            </CardTitle>
            <CardDescription>
              Unique people; missing ages are grouped as Unknown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(AGE_BRACKET_LABELS) as AgeBracketKey[]).map(key => (
              <div
                key={key}
                className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-xs sm:text-sm"
              >
                <span>{AGE_BRACKET_LABELS[key]}</span>
                <div className="h-5 overflow-hidden rounded-md bg-muted">
                  <div
                    className="h-full rounded-md bg-[var(--accent-color)]"
                    style={{
                      width: `${((ageCounts[key] ?? 0) / maxAgeCount) * 100}%`,
                    }}
                  />
                </div>
                <strong className="tabular-nums">{ageCounts[key] ?? 0}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className={panel}>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle className={heading}>
                <CalendarDays aria-hidden="true" />
                Recent Services
              </CardTitle>
              <CardDescription>
                Latest Sunday sessions in selected filters
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              onClick={onViewAll}
              className="gap-2 rounded-xl text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]"
            >
              View All
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recent.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Three latest filtered Sunday sessions
                  </caption>
                  <thead className="bg-muted/50 text-xs">
                    <tr>
                      {["Date", "Type", "Attendance", "Actions"].map(label => (
                        <th key={label} scope="col" className="p-3">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(record => (
                      <tr
                        key={`${record.serviceId}-${record.date}`}
                        className="border-b border-border/50"
                      >
                        <td className="whitespace-nowrap p-3">
                          {dateLabel(record.date)}
                        </td>
                        <td className="min-w-32 p-3">
                          <span className="rounded-lg bg-[var(--accent-color-soft)] px-2 py-1 text-xs text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
                            {record.serviceType}
                          </span>
                        </td>
                        <td className="p-3 tabular-nums">
                          {record.attendees.length}
                        </td>
                        <td className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Open ${record.serviceType} on ${dateLabel(record.date)}`}
                            onClick={() => onOpenSession(record)}
                          >
                            Open
                            <ArrowRight className="ml-1 size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No Sunday services match these filters.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
