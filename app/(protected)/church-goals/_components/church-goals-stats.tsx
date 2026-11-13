"use client";

import {
  getActiveThemePeriod,
  type ThemeCadence,
} from "@/lib/church-theme-periods";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CheckCircle2,
  Lightbulb,
  Target,
  Edit,
  Plus,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DashboardMetricCard } from "@/components/dashboard-metric-card";
import {
  MONTH_NAMES,
  type MonthlyTheme,
  type YearlyGoal,
} from "@/lib/supabase/church-goals";

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  progress,
  onEdit,
  isAdmin,
  hasEdit,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  accent: "purple" | "blue" | "emerald";
  progress?: number;
  onEdit?: () => void;
  isAdmin?: boolean;
  hasEdit?: boolean;
}) {
  return (
    <DashboardMetricCard
      icon={Icon}
      label={label}
      value={value}
      hint={subtext}
      action={
        isAdmin && onEdit ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={`Edit ${label.toLowerCase()}`}
          >
            {hasEdit ? (
              <Edit className="size-3" />
            ) : (
              <Plus className="size-3" />
            )}
          </Button>
        ) : undefined
      }
    >
      {progress !== undefined && (
        <Progress
          value={progress}
          className="mt-3 h-1.5 bg-muted [&>[data-slot=progress-indicator]]:bg-[var(--accent-color)]"
        />
      )}
    </DashboardMetricCard>
  );
}

export function ChurchGoalsStats({
  cadence = "monthly",
  goal,
  year,
  monthlyThemesCount,
  activeMonthTheme,
  currentMonth,
  currentYear,
  isAdmin,
  onEditActiveMonth,
}: {
  cadence?: ThemeCadence;
  goal: YearlyGoal | null;
  year: number;
  monthlyThemesCount: number;
  activeMonthTheme?: MonthlyTheme | null;
  currentMonth?: number;
  currentYear?: number;
  isAdmin?: boolean;
  onEditActiveMonth?: () => void;
}) {
  const completedObjectives =
    goal?.objectives.filter(o => o.isCompleted).length ?? 0;
  const totalObjectives = goal?.objectives.length ?? 0;
  const objectivePercent =
    totalObjectives > 0
      ? Math.round((completedObjectives / totalObjectives) * 100)
      : 0;
  const periodCount = cadence === "quarterly" ? 4 : 12;
  const monthlyPercent = Math.round((monthlyThemesCount / periodCount) * 100);

  const showActiveMonth = year === currentYear && currentMonth && currentYear;
  const monthName = showActiveMonth ? MONTH_NAMES[currentMonth - 1] : "";
  const activeHasContent = Boolean(
    activeMonthTheme?.title.trim() ||
      activeMonthTheme?.description.trim() ||
      activeMonthTheme?.content.trim(),
  );

  return (
    <div
      className={cn(
        "grid gap-3",
        showActiveMonth ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-3",
      )}
    >
      <StatCard
        icon={CheckCircle2}
        label="Objectives complete"
        value={
          totalObjectives > 0
            ? `${completedObjectives} of ${totalObjectives}`
            : "None yet"
        }
        subtext={
          totalObjectives > 0 ? `${objectivePercent}% complete` : undefined
        }
        accent="emerald"
        progress={totalObjectives > 0 ? objectivePercent : undefined}
      />

      <StatCard
        icon={CalendarDays}
        label={`${cadence === "quarterly" ? "Quarterly" : "Monthly"} themes configured`}
        value={`${monthlyThemesCount} of ${periodCount}`}
        subtext={`${monthlyPercent}% configured for ${year}`}
        accent="blue"
        progress={monthlyPercent}
      />
      <StatCard
        icon={Lightbulb}
        label={`${year} goal`}
        value={goal?.title?.trim() || goal?.theme?.trim() || "Not set"}
        subtext={
          goal?.title?.trim() && goal?.theme?.trim() ? goal.theme : undefined
        }
        accent="purple"
      />

      {showActiveMonth && (
        <StatCard
          icon={CalendarDays}
          label={
            cadence === "quarterly"
              ? "Active this quarter"
              : "Active this month"
          }
          value={`${cadence === "quarterly" ? `Q${getActiveThemePeriod(cadence, currentMonth!)}` : monthName} ${currentYear}`}
          subtext={
            activeHasContent
              ? activeMonthTheme!.description.trim() || activeMonthTheme!.title
              : "Add a theme for this period"
          }
          accent="blue"
          isAdmin={isAdmin}
          onEdit={onEditActiveMonth}
          hasEdit={activeHasContent}
        />
      )}
    </div>
  );
}

export function ChurchGoalsPageHeader({
  selectedYear,
  isCurrentYear,
}: {
  selectedYear: number;
  isCurrentYear: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Vision & Themes
        </h1>
        {isCurrentYear && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-color-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
            <Target className="w-3 h-3" />
            Current year
          </span>
        )}
      </div>
      <p className="text-slate-600 dark:text-zinc-400 mt-1">
        Plan the annual vision, track objectives, and shape service themes for{" "}
        {selectedYear}.
      </p>
    </div>
  );
}
