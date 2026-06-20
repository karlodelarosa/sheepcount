"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  CalendarCheck,
  CalendarDays,
  Flame,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  SectionHeader,
  StatTile,
  panelCard,
} from "./person-detail-ui";
import { cn } from "@/lib/utils";
import {
  buildPersonAttendanceStats,
  getAttendanceRateTone,
  getPersonRecentAttendance,
  getPersonServiceBreakdown,
  getPersonSundayTrend,
  type PersonAttendanceRow,
} from "../_lib/person-attendance";
import { isSundayRecord } from "@/app/(protected)/service-attendance/_lib/group-attendance";

interface PersonAttendanceSectionProps {
  personId: string;
  lastAttendance?: string;
  attendanceRows: PersonAttendanceRow[];
  hydrated: boolean;
}

const RATE_TONE_STYLES = {
  good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  fair: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  low: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  none: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400",
} as const;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PersonAttendanceSection({
  personId,
  lastAttendance,
  attendanceRows,
  hydrated,
}: PersonAttendanceSectionProps) {
  const stats = useMemo(
    () =>
      buildPersonAttendanceStats(attendanceRows, personId, lastAttendance),
    [attendanceRows, personId, lastAttendance],
  );

  const trend = useMemo(
    () => getPersonSundayTrend(attendanceRows, personId),
    [attendanceRows, personId],
  );

  const personRows = useMemo(
    () => attendanceRows.filter((row) => row.personId === personId),
    [attendanceRows, personId],
  );

  const serviceBreakdown = useMemo(
    () => getPersonServiceBreakdown(personRows),
    [personRows],
  );

  const recentAttendance = useMemo(
    () => getPersonRecentAttendance(personRows),
    [personRows],
  );

  const rateTone = getAttendanceRateTone(stats.sundayRate);

  if (!hydrated) return null;

  return (
    <div className={cn(panelCard, "p-5 overflow-hidden")}>
      <SectionHeader
        icon={CalendarCheck}
        iconClassName="border-violet-200/80 bg-violet-50 dark:border-violet-800/60 dark:bg-violet-950/40"
        title="Service Attendance"
        description={
          stats.totalAttended > 0
            ? `${stats.sundayRate}% Sunday rate over last ${stats.sundaySessionsInPeriod} services`
            : "No service attendance recorded yet"
        }
        action={
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg shrink-0"
            asChild
          >
            <Link href="/service-attendance">
              <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
              Record
            </Link>
          </Button>
        }
      />

      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <StatTile
            label="Total services"
            value={stats.totalAttended}
            hint={`${stats.sundayAttended} Sundays`}
          />
          <StatTile
            label="Sunday rate"
            value={`${stats.sundayRate}%`}
            hint={
              stats.sundaySessionsInPeriod > 0
                ? `${stats.sundayAttended} of ${stats.sundaySessionsInPeriod}`
                : "No Sunday data"
            }
          />
          <StatTile
            label="Last attended"
            value={
              stats.lastAttendanceDate
                ? formatDate(stats.lastAttendanceDate)
                : "—"
            }
          />
          <StatTile
            label="Current streak"
            value={stats.currentStreak}
            hint={
              stats.currentStreak === 1
                ? "Sunday in a row"
                : "Sundays in a row"
            }
          />
        </div>

        {stats.sundaySessionsInPeriod > 0 && (
          <div className="flex items-center gap-2">
            <Badge className={cn("rounded-lg border-0", RATE_TONE_STYLES[rateTone])}>
              {rateTone === "good" && (
                <>
                  <TrendingUp className="w-3 h-3 mr-1 inline" />
                  Regular attendee
                </>
              )}
              {rateTone === "fair" && "Moderate attendance"}
              {rateTone === "low" && "Needs follow-up"}
              {rateTone === "none" && "No recent Sundays"}
            </Badge>
            {stats.currentStreak >= 3 && (
              <Badge
                variant="secondary"
                className="rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0"
              >
                <Flame className="w-3 h-3 mr-1 inline" />
                {stats.currentStreak}-week streak
              </Badge>
            )}
          </div>
        )}

        {stats.totalAttended === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No attendance history"
            description="Record this person at a Sunday service or life group to start tracking."
            action={
              <Button variant="outline" size="sm" className="rounded-xl" asChild>
                <Link href="/service-attendance">Go to attendance</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50/40 to-transparent p-4 dark:border-violet-800/40 dark:from-violet-950/20">
              <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-3">
                Sunday presence — last {trend.length} services
              </p>
              {trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={trend} barCategoryGap="20%">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      allowDecimals={false}
                      ticks={[0, 1]}
                      tick={{ fontSize: 10 }}
                      width={24}
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        value === 1 ? "Present" : "Absent"
                      }
                      labelFormatter={(_, payload) => {
                        const item = payload?.[0]?.payload as
                          | { date: string }
                          | undefined;
                        return item ? formatDate(item.date) : "";
                      }}
                    />
                    <Bar dataKey="attended" radius={[4, 4, 0, 0]}>
                      {trend.map((entry, index) => (
                        <Cell
                          key={`${entry.date}-${index}`}
                          fill={entry.attended === 1 ? "#8b5cf6" : "#e2e8f0"}
                          className={
                            entry.attended === 1
                              ? "dark:fill-violet-400"
                              : "dark:fill-zinc-700"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No Sunday sessions recorded in this period
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500 mb-2">
                  By service type
                </p>
                {serviceBreakdown.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No breakdown</p>
                ) : (
                  <div className="space-y-2">
                    {serviceBreakdown.map((item) => {
                      const maxCount = serviceBreakdown[0]?.count ?? 1;
                      const width = (item.count / maxCount) * 100;
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
                              {item.count}
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
                    })}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500 mb-2">
                  Recent visits
                </p>
                {recentAttendance.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No visits yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentAttendance.map((visit, i) => (
                      <div
                        key={`${visit.date}-${visit.serviceType}-${i}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/70 bg-slate-50/40 px-2.5 py-2 dark:border-zinc-700/70 dark:bg-zinc-800/30"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                            {visit.serviceType}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                            {formatDate(visit.date)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-md text-[10px] shrink-0",
                            visit.serviceCategory === "sunday"
                              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                              : "",
                          )}
                        >
                          {visit.serviceCategory === "sunday"
                            ? "Sunday"
                            : "Life group"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
