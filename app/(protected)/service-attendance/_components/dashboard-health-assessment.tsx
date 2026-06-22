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
  ReferenceLine,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { assessAttendanceHealth } from "../_lib/attendance-health";
import { ATTENDANCE_STATUS_COLORS } from "../_lib/attendance-breakdown";
import type { DashboardAttendeeSummary } from "../_lib/group-attendance";

interface DashboardHealthAssessmentProps {
  attendees: DashboardAttendeeSummary[];
}

const SEVERITY_STYLES = {
  good: {
    icon: CheckCircle2,
    border: "border-emerald-200 dark:border-emerald-800/60",
    bg: "bg-emerald-50/80 dark:bg-emerald-950/30",
    text: "text-emerald-800 dark:text-emerald-300",
    iconColor: "text-emerald-600",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-200 dark:border-amber-800/60",
    bg: "bg-amber-50/80 dark:bg-amber-950/30",
    text: "text-amber-900 dark:text-amber-200",
    iconColor: "text-amber-600",
  },
  action: {
    icon: ClipboardList,
    border: "border-rose-200 dark:border-rose-800/60",
    bg: "bg-rose-50/80 dark:bg-rose-950/30",
    text: "text-rose-900 dark:text-rose-200",
    iconColor: "text-rose-600",
  },
} as const;

export function DashboardHealthAssessment({
  attendees,
}: DashboardHealthAssessmentProps) {
  const health = useMemo(
    () => assessAttendanceHealth(attendees),
    [attendees],
  );

  const compositionChart = useMemo(() => {
    return Object.entries(health.composition)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => ({
        key,
        label: key,
        count,
        color: ATTENDANCE_STATUS_COLORS[key as keyof typeof ATTENDANCE_STATUS_COLORS],
      }));
  }, [health.composition]);

  if (attendees.length === 0) return null;

  const scoreColor =
    health.score >= 80
      ? "text-emerald-600"
      : health.score >= 55
        ? "text-amber-600"
        : "text-rose-600";

  const scoreLabel =
    health.score >= 80 ? "Healthy" : health.score >= 55 ? "Needs attention" : "Take action";

  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="py-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Attendance health check
            </CardTitle>
            <CardDescription className="text-xs">
              Quick read on balance and suggested next steps
            </CardDescription>
          </div>
          <div className="text-right shrink-0">
            <p className={cn("text-2xl font-semibold tabular-nums leading-none", scoreColor)}>
              {health.score}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{scoreLabel}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-4">
        {compositionChart.length > 0 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Unique people by role
            </p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={compositionChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
                <Tooltip />
                <ReferenceLine y={health.totalPeople * 0.25} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "25%", position: "insideTopRight", fontSize: 9, fill: "#94a3b8" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {compositionChart.map(entry => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-2">
          {health.insights.map(insight => {
            const style = SEVERITY_STYLES[insight.severity];
            const Icon = style.icon;
            return (
              <div
                key={insight.id}
                className={cn(
                  "rounded-lg border p-3 space-y-1",
                  style.border,
                  style.bg,
                )}
              >
                <div className="flex items-start gap-2">
                  <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", style.iconColor)} />
                  <div className="min-w-0 space-y-1">
                    <p className={cn("text-xs font-semibold", style.text)}>
                      {insight.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {insight.detail}
                    </p>
                    <p className={cn("text-[11px] font-medium", style.text)}>
                      → {insight.action}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
