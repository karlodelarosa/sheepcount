"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isItemEnabled } from "@/lib/subscription/entitlements";
import { useTenant } from "@/app/providers/tenant-provider";
import { useChurchGoals } from "@/lib/church-goals";
import { YearSelector } from "./_components/year-selector";
import { PriorYearActionPointsBanner } from "./_components/prior-year-action-points-banner";
import { YearlyGoalSection } from "./_components/yearly-goal-section";
import {
  EditYearlyGoalDialog,
  type YearlyGoalFormData,
} from "./_components/edit-yearly-goal-dialog";
import { MonthlyThemesGrid } from "./_components/monthly-themes-grid";
import { ChurchGoalsLoading } from "./_components/church-goals-loading";
import {
  ChurchGoalsPageHeader,
  ChurchGoalsStats,
} from "./_components/church-goals-stats";
import { SectionLabel } from "./_components/section-label";
import { EditMonthlyThemeDialog } from "./_components/edit-monthly-theme-dialog";

export function ChurchGoalsView() {
  const { entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const { tenant } = useTenant();
  const churchGoalsEnabled = isItemEnabled(entitlements.modules, "church_goals");
  const isAdmin = tenant?.profile?.role === "admin";

  const {
    hydrated,
    isSaving,
    availableYears,
    getYearlyGoal,
    getMonthlyTheme,
    getPriorYearActionPoints,
    monthlyThemes,
    saveYearlyGoal,
    toggleObjective,
    saveMonthlyTheme,
    saveRetrospective,
  } = useChurchGoals();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [editActiveMonthOpen, setEditActiveMonthOpen] = useState(false);

  const selectedGoal = getYearlyGoal(selectedYear);
  const priorYearActionPoints = getPriorYearActionPoints(selectedYear);
  const activeMonthTheme = getMonthlyTheme(currentYear, currentMonth);
  const themesForYear = useMemo(
    () => monthlyThemes.filter(t => t.year === selectedYear),
    [monthlyThemes, selectedYear],
  );
  const configuredMonthsCount = themesForYear.filter(
    t => t.title.trim() || t.description.trim() || t.content.trim(),
  ).length;

  if (entitlementsLoading || !hydrated) {
    return <ChurchGoalsLoading />;
  }

  if (!churchGoalsEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Church Goals & Themes
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">
            Annual vision and monthly service themes
          </p>
        </div>

        <Card className="border-slate-200/70 dark:border-zinc-700/70">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Finance & Projects is not enabled
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
              Church goals and themes are available on the Pro plan. Contact
              support to upgrade your subscription.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveGoal = async (data: YearlyGoalFormData) => {
    await saveYearlyGoal({
      year: data.year,
      theme: data.theme,
      title: data.title,
      description: data.description,
      vision: data.vision,
      objectives: data.objectives
        .filter(o => o.text.trim())
        .map(o => ({ text: o.text, isCompleted: o.isCompleted })),
    });
  };

  const handleSaveRetrospective = async (data: {
    wentWell: string[];
    couldBeBetter: string[];
    actionPoints: string[];
  }) => {
    await saveRetrospective({
      year: selectedYear,
      wentWell: data.wentWell,
      couldBeBetter: data.couldBeBetter,
      actionPoints: data.actionPoints,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <ChurchGoalsPageHeader
          selectedYear={selectedYear}
          isCurrentYear={selectedYear === currentYear}
        />
        <YearSelector
          selectedYear={selectedYear}
          availableYears={availableYears}
          hasGoalForYear={Boolean(selectedGoal)}
          isAdmin={isAdmin}
          currentYear={currentYear}
          onYearChange={setSelectedYear}
          onSetupYear={() => setEditGoalOpen(true)}
        />
      </div>

      <section className="space-y-3">
        <YearlyGoalSection
          goal={selectedGoal}
          year={selectedYear}
          isAdmin={isAdmin}
          isSaving={isSaving}
          onEdit={() => setEditGoalOpen(true)}
          onToggleObjective={(id, completed) =>
            void toggleObjective(id, completed)
          }
          onSaveRetrospective={handleSaveRetrospective}
        />
      </section>

      <ChurchGoalsStats
        goal={selectedGoal}
        year={selectedYear}
        monthlyThemesCount={configuredMonthsCount}
        activeMonthTheme={activeMonthTheme}
        currentMonth={currentMonth}
        currentYear={currentYear}
        isAdmin={isAdmin}
        onEditActiveMonth={() => setEditActiveMonthOpen(true)}
      />

      {priorYearActionPoints && (
        <section className="space-y-3">
          <SectionLabel>Planning context</SectionLabel>
          <PriorYearActionPointsBanner
            priorYear={selectedYear - 1}
            actionPoints={priorYearActionPoints}
          />
        </section>
      )}

      <section className="space-y-3">
        <SectionLabel>Monthly themes</SectionLabel>
        <MonthlyThemesGrid
          year={selectedYear}
          themes={themesForYear}
          currentMonth={currentMonth}
          currentYear={currentYear}
          isAdmin={isAdmin}
          isSaving={isSaving}
          onSaveTheme={async (month, data) => {
            await saveMonthlyTheme({
              year: selectedYear,
              month,
              ...data,
            });
          }}
        />
      </section>

      <EditYearlyGoalDialog
        open={editGoalOpen}
        onOpenChange={setEditGoalOpen}
        goal={selectedGoal}
        year={selectedYear}
        isSaving={isSaving}
        onSave={handleSaveGoal}
      />

      <EditMonthlyThemeDialog
        open={editActiveMonthOpen}
        onOpenChange={setEditActiveMonthOpen}
        theme={activeMonthTheme}
        year={currentYear}
        month={currentMonth}
        isSaving={isSaving}
        onSave={async data => {
          await saveMonthlyTheme({
            year: currentYear,
            month: currentMonth,
            ...data,
          });
        }}
      />
    </div>
  );
}
