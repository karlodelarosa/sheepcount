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
  Cell,
} from "recharts";
import { PieChart, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ATTENDANCE_STATUS_LABELS,
  computeAttendanceBreakdown,
  computeWorkerVsCongregation,
  type AttendanceStatusKey,
  type SessionAttendeeLike,
} from "../_lib/attendance-breakdown";

interface SessionAttendanceBreakdownProps {
  attendees: SessionAttendeeLike[];
  activeFilter: AttendanceStatusKey | null;
  onFilterChange: (filter: AttendanceStatusKey | null) => void;
}

export function SessionAttendanceBreakdown({
  attendees,
  activeFilter,
  onFilterChange,
}: SessionAttendanceBreakdownProps) {
  const breakdown = useMemo(
    () => computeAttendanceBreakdown(attendees),
    [attendees],
  );

  const contrast = useMemo(
    () => computeWorkerVsCongregation(attendees),
    [attendees],
  );

  if (attendees.length === 0) return null;

  const toggleFilter = (key: AttendanceStatusKey) => {
    onFilterChange(activeFilter === key ? null : key);
  };

  const contrastSegments = [
    {
      key: "workers",
      label: "Workers",
      count: contrast.workers,
      color: "#9333ea",
      hint: "Workers & volunteers serving",
    },
    {
      key: "attenders",
      label: "Attenders & New Comers",
      count: contrast.attendersAndNewComers,
      color: "#16a34a",
      hint: "Regular attenders and first-time visitors",
    },
    ...(contrast.others > 0
      ? [
          {
            key: "others",
            label: "Members & Visitors",
            count: contrast.others,
            color: "#2563eb",
            hint: "Members and evangelism guests",
          },
        ]
      : []),
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-border/60 bg-card/50">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-violet-500" />
            By status
          </CardTitle>
          <CardDescription className="text-xs">
            {activeFilter
              ? `Showing ${ATTENDANCE_STATUS_LABELS[activeFilter].toLowerCase()} — tap again to clear`
              : "Tap a status to filter the attendee list"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          {breakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={breakdown} layout="vertical" margin={{ left: 4 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    horizontal={false}
                  />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={88}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    className="cursor-pointer"
                    onClick={(_data, index) => {
                      const item = breakdown[index];
                      if (item) toggleFilter(item.key);
                    }}
                  >
                    {breakdown.map(entry => (
                      <Cell
                        key={entry.key}
                        fill={entry.color}
                        opacity={
                          activeFilter && activeFilter !== entry.key ? 0.35 : 1
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-2">
                {breakdown.map(item => {
                  const isActive = activeFilter === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleFilter(item.key)}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-xs text-left transition-all",
                        isActive
                          ? "border-violet-400 bg-violet-50 ring-2 ring-violet-400/40 dark:border-violet-600 dark:bg-violet-950/40"
                          : "border-border/50 bg-background/50 hover:border-border hover:bg-muted/40",
                      )}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="font-medium tabular-nums shrink-0">
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">
              No status data available
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-violet-200/60 dark:border-violet-800/40 bg-gradient-to-br from-violet-50/40 to-transparent dark:from-violet-950/20">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Users className="w-4 h-4 text-violet-500" />
            Workers vs congregation
          </CardTitle>
          <CardDescription className="text-xs">
            How serving workers compare to attenders and newcomers
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-4">
          <div className="flex h-8 rounded-lg overflow-hidden border border-border/40">
            {contrastSegments.map(segment => {
              const width = (segment.count / contrast.total) * 100;
              if (width <= 0) return null;
              return (
                <div
                  key={segment.key}
                  className="flex items-center justify-center text-[10px] font-medium text-white transition-all"
                  style={{
                    width: `${width}%`,
                    backgroundColor: segment.color,
                    minWidth: segment.count > 0 ? "2rem" : 0,
                  }}
                  title={`${segment.label}: ${segment.count}`}
                >
                  {width >= 14 ? segment.count : ""}
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            {contrastSegments.map(segment => {
              const pct = Math.round((segment.count / contrast.total) * 100);
              return (
                <div key={segment.key} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="font-medium truncate">{segment.label}</span>
                    </span>
                    <span className="tabular-nums shrink-0 text-muted-foreground">
                      {segment.count}{" "}
                      <span className="text-[10px]">({pct}%)</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground pl-4">
                    {segment.hint}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
