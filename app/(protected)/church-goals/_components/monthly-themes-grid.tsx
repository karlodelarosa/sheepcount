"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, CalendarDays } from "lucide-react";
import { MONTH_NAMES, type MonthlyTheme } from "@/lib/supabase/church-goals";
import { EditMonthlyThemeDialog } from "./edit-monthly-theme-dialog";
import { cn } from "@/lib/utils";

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export function MonthlyThemesGrid({
  year,
  themes,
  currentMonth,
  currentYear,
  isAdmin,
  isSaving,
  onSaveTheme,
}: {
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
    themes.find(t => t.year === year && t.month === month) ?? null;

  const configuredCount = MONTH_NAMES.filter((_, i) => {
    const theme = getThemeForMonth(i + 1);
    return Boolean(
      theme?.title.trim() || theme?.description.trim() || theme?.content.trim(),
    );
  }).length;
  const progressPercent = Math.round((configuredCount / 12) * 100);

  const editingTheme = editingMonth
    ? getThemeForMonth(editingMonth)
    : null;

  return (
    <>
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2 text-blue-600 dark:text-blue-400">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-lg">Monthly service themes</CardTitle>
                <CardDescription>
                  {configuredCount} of 12 configured · {year}
                </CardDescription>
              </div>
            </div>
            <div className="sm:min-w-[160px] space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-medium tabular-nums">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-2.5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {MONTH_NAMES.map((monthName, index) => {
              const month = index + 1;
              const theme = getThemeForMonth(month);
              const isCurrent =
                year === currentYear && month === currentMonth;
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
                  onClick={
                    isAdmin ? () => setEditingMonth(month) : undefined
                  }
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
                    "group relative rounded-lg border p-3 transition-all duration-150",
                    isCurrent
                      ? "border-blue-400/80 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/25"
                      : hasContent
                        ? "border-border/60 bg-card hover:border-border hover:shadow-sm"
                        : "border-dashed border-border/70 bg-muted/15",
                    isAdmin &&
                      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold",
                          isCurrent
                            ? "bg-blue-600 text-white"
                            : hasContent
                              ? "bg-muted text-foreground"
                              : "bg-muted/60 text-muted-foreground",
                        )}
                      >
                        {MONTH_ABBR[index]}
                      </span>
                      <span className="text-xs font-medium text-foreground truncate">
                        {monthName}
                      </span>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => {
                          e.stopPropagation();
                          setEditingMonth(month);
                        }}
                      >
                        {hasContent ? (
                          <Edit className="w-3 h-3" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>

                  {hasContent ? (
                    <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                      {theme!.title}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
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
