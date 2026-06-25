"use client";

import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, Lightbulb, Target, Edit, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { MONTH_NAMES, type MonthlyTheme, type YearlyGoal } from "@/lib/supabase/church-goals";

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  accent,
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
  const accentStyles = {
    purple: {
      icon: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
      border: "border-purple-200/60 dark:border-purple-800/40",
      bg: "from-purple-50/80 to-white dark:from-purple-950/20 dark:to-card",
    },
    blue: {
      icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
      border: "border-blue-200/60 dark:border-blue-800/40",
      bg: "from-blue-50/80 to-white dark:from-blue-950/20 dark:to-card",
    },
    emerald: {
      icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
      border: "border-emerald-200/60 dark:border-emerald-800/40",
      bg: "from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-card",
    },
  }[accent];

  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br p-4 transition-shadow hover:shadow-sm",
        accentStyles.border,
        accentStyles.bg,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("rounded-lg p-2 shrink-0", accentStyles.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            {isAdmin && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mt-1 -mr-1 shrink-0"
                onClick={onEdit}
                aria-label={`Edit ${label.toLowerCase()}`}
              >
                {hasEdit ? (
                  <Edit className="w-3 h-3" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
              </Button>
            )}
          </div>
          <p className="text-lg font-semibold text-foreground mt-0.5 line-clamp-2 leading-snug">
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {subtext}
            </p>
          )}
          {progress !== undefined && (
            <Progress value={progress} className="h-1.5 mt-2.5" />
          )}
        </div>
      </div>
    </div>
  );
}

export function ChurchGoalsStats({
  goal,
  year,
  monthlyThemesCount,
  activeMonthTheme,
  currentMonth,
  currentYear,
  isAdmin,
  onEditActiveMonth,
}: {
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
  const monthlyPercent = Math.round((monthlyThemesCount / 12) * 100);

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
        showActiveMonth
          ? "sm:grid-cols-2 xl:grid-cols-4"
          : "sm:grid-cols-3",
      )}
    >
      <StatCard
        icon={Lightbulb}
        label={`${year} goal`}
        value={goal?.title?.trim() || goal?.theme?.trim() || "Not set"}
        subtext={
          goal?.title?.trim() && goal?.theme?.trim()
            ? goal.theme
            : undefined
        }
        accent="purple"
      />

      {showActiveMonth && (
        <StatCard
          icon={CalendarDays}
          label="Active this month"
          value={activeHasContent ? activeMonthTheme!.title : "Not set"}
          subtext={
            activeHasContent
              ? activeMonthTheme!.description.trim() ||
                `${monthName} ${currentYear}`
              : `${monthName} ${currentYear}`
          }
          accent="blue"
          isAdmin={isAdmin}
          onEdit={onEditActiveMonth}
          hasEdit={activeHasContent}
        />
      )}

      <StatCard
        icon={CheckCircle2}
        label="Objectives"
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
        label="Monthly themes"
        value={`${monthlyThemesCount} of 12`}
        subtext={`${monthlyPercent}% configured for ${year}`}
        accent="blue"
        progress={monthlyPercent}
      />
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
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            <Target className="w-3 h-3" />
            Current year
          </span>
        )}
      </div>
      <p className="text-slate-600 dark:text-zinc-400 mt-1">
        Plan the annual vision, track objectives, and shape monthly service
        themes for {selectedYear}.
      </p>
    </div>
  );
}
