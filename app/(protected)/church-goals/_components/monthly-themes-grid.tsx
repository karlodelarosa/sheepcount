"use client";

import {
  matchesThemeCadence,
  getThemePeriods,
  getActiveThemePeriod,
  type ThemeCadence,
} from "@/lib/church-theme-periods";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, CalendarDays } from "lucide-react";
import { type MonthlyTheme } from "@/lib/supabase/church-goals";
import { EditMonthlyThemeDialog } from "./edit-monthly-theme-dialog";
import { cn } from "@/lib/utils";

export function MonthlyThemesGrid({
  cadence = "monthly",
  onCadenceChange,
  year,
  themes,
  currentMonth,
  currentYear,
  isAdmin,
  isSaving,
  onSaveTheme,
}: {
  cadence?: ThemeCadence;
  onCadenceChange?: (cadence: ThemeCadence) => void;
  year: number;
  themes: MonthlyTheme[];
  currentMonth: number;
  currentYear: number;
  isAdmin: boolean;
  isSaving: boolean;
  onSaveTheme: (
    month: number,
    data: { title: string; description: string; content: string },
  ) => Promise<void>;
}) {
  const [editingMonth, setEditingMonth] = useState<number | null>(null);

  const getThemeForMonth = (month: number) =>
    themes.find(
      t =>
        t.year === year && t.month === month && matchesThemeCadence(t, cadence),
    ) ?? null;

  const periods = getThemePeriods(cadence);
  const configuredCount = periods.filter(period => {
    const theme = getThemeForMonth(period.number);
    return Boolean(
      theme?.title.trim() || theme?.description.trim() || theme?.content.trim(),
    );
  }).length;
  const progressPercent = Math.round((configuredCount / periods.length) * 100);

  const editingTheme = editingMonth ? getThemeForMonth(editingMonth) : null;

  return (
    <>
      <Card className="h-full min-w-0 rounded-2xl border-border/70 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[var(--accent-color-soft)] p-2 text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-lg">Micro Themes</CardTitle>
                <CardDescription>
                  Service themes that align with the annual goal.
                </CardDescription>
              </div>
            </div>
            <div className="sm:min-w-[160px] space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {configuredCount} of {periods.length} configured
                </span>
                <span className="font-medium tabular-nums">
                  {progressPercent}%
                </span>
              </div>
              <Progress
                value={progressPercent}
                className="h-1.5 bg-muted [&>[data-slot=progress-indicator]]:bg-[var(--accent-color)]"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div
              className="inline-flex rounded-lg border border-border p-1"
              role="group"
              aria-label="Theme schedule"
            >
              {(["monthly", "quarterly"] as const).map(option => (
                <Button
                  key={option}
                  size="sm"
                  variant="ghost"
                  aria-pressed={cadence === option}
                  className={cn(
                    "capitalize",
                    cadence === option &&
                      "bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]",
                  )}
                  onClick={() => {
                    setEditingMonth(null);
                    onCadenceChange?.(option);
                  }}
                >
                  {option}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {cadence === "quarterly"
                ? "One theme for each quarter"
                : "One theme for each month"}
            </p>
          </div>
          <div
            className={cn(
              "grid gap-2.5 grid-cols-2",
              cadence === "monthly" && "md:grid-cols-4",
            )}
          >
            {periods.map(period => {
              const month = period.number;
              const monthName = period.name;
              const theme = getThemeForMonth(month);
              const isCurrent =
                year === currentYear &&
                month === getActiveThemePeriod(cadence, currentMonth);
              const hasContent = Boolean(
                theme?.title.trim() ||
                  theme?.description.trim() ||
                  theme?.content.trim(),
              );

              return (
                <div
                  key={month}
                  role={isAdmin ? "button" : undefined}
                  tabIndex={isAdmin ? 0 : undefined}
                  onClick={isAdmin ? () => setEditingMonth(month) : undefined}
                  onKeyDown={
                    isAdmin
                      ? e => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setEditingMonth(month);
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    "group relative min-h-20 rounded-xl border p-3 transition-all duration-150",
                    isCurrent
                      ? "border-[var(--accent-color)] bg-[var(--accent-color-soft)]"
                      : hasContent
                        ? "border-border/60 bg-card hover:border-border hover:shadow-sm"
                        : "border-border/70 bg-card",
                    isAdmin &&
                      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]",
                  )}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold",
                          isCurrent
                            ? "bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]"
                            : hasContent
                              ? "bg-muted text-foreground"
                              : "bg-muted/60 text-muted-foreground",
                        )}
                      >
                        {period.short}
                      </span>
                      <span className="text-sm font-semibold text-foreground truncate">
                        {monthName}
                      </span>
                    </div>
                    {isAdmin && (
                      <span
                        aria-hidden="true"
                        className="text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                      >
                        {hasContent ? (
                          <Edit className="size-3" />
                        ) : (
                          <Plus className="size-3" />
                        )}
                      </span>
                    )}
                  </div>

                  {period.range && (
                    <p className="mb-2 text-xs text-muted-foreground">
                      {period.range}
                    </p>
                  )}
                  {hasContent ? (
                    <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                      {theme!.title}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isAdmin ? "Add theme" : "—"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {editingMonth !== null && (
        <EditMonthlyThemeDialog
          open={editingMonth !== null}
          onOpenChange={open => {
            if (!open) setEditingMonth(null);
          }}
          cadence={cadence}
          theme={editingTheme}
          year={year}
          month={editingMonth}
          isSaving={isSaving}
          onSave={async data => {
            await onSaveTheme(editingMonth, data);
            setEditingMonth(null);
          }}
        />
      )}
    </>
  );
}
