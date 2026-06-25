"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useTenant } from "@/app/providers/tenant-provider";
import { createClient } from "@/lib/supabase/client";
import {
  fetchChurchGoalsForOrg,
  formatActionPointsForCarryForward,
  toggleObjectiveCompleted,
  upsertMonthlyTheme,
  upsertRetrospective,
  upsertYearlyGoal,
  type MonthlyTheme,
  type SaveMonthlyThemeInput,
  type SaveRetrospectiveInput,
  type SaveYearlyGoalInput,
  type YearlyGoal,
} from "@/lib/supabase/church-goals";
import { getOrganizationId } from "@/lib/supabase/tenant";

type ChurchGoalsContextValue = {
  yearlyGoals: YearlyGoal[];
  monthlyThemes: MonthlyTheme[];
  hydrated: boolean;
  isSaving: boolean;
  refreshChurchGoals: () => Promise<void>;
  saveYearlyGoal: (input: SaveYearlyGoalInput) => Promise<YearlyGoal | null>;
  saveRetrospective: (input: SaveRetrospectiveInput) => Promise<YearlyGoal | null>;
  toggleObjective: (
    objectiveId: string,
    completed: boolean,
  ) => Promise<boolean>;
  saveMonthlyTheme: (
    input: SaveMonthlyThemeInput,
  ) => Promise<MonthlyTheme | null>;
  getYearlyGoal: (year: number) => YearlyGoal | null;
  getMonthlyTheme: (year: number, month: number) => MonthlyTheme | null;
  getPriorYearActionPoints: (year: number) => string | null;
  availableYears: number[];
};

const ChurchGoalsContext = createContext<ChurchGoalsContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function ChurchGoalsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [yearlyGoals, setYearlyGoals] = useState<YearlyGoal[]>([]);
  const [monthlyThemes, setMonthlyThemes] = useState<MonthlyTheme[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshChurchGoals = useCallback(async () => {
    if (!organizationId) {
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const data = await fetchChurchGoalsForOrg(supabase, organizationId);
      setYearlyGoals(data.yearlyGoals);
      setMonthlyThemes(data.monthlyThemes);
    } catch (error) {
      console.error("Failed to load church goals:", error);
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    void refreshChurchGoals();
  }, [refreshChurchGoals]);

  const getYearlyGoal = useCallback(
    (year: number) => yearlyGoals.find(g => g.year === year) ?? null,
    [yearlyGoals],
  );

  const getMonthlyTheme = useCallback(
    (year: number, month: number) =>
      monthlyThemes.find(t => t.year === year && t.month === month) ?? null,
    [monthlyThemes],
  );

  const getPriorYearActionPoints = useCallback(
    (year: number) => {
      const prior = yearlyGoals.find(g => g.year === year - 1);
      if (!prior) return null;
      return formatActionPointsForCarryForward(prior);
    },
    [yearlyGoals],
  );

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set<number>([currentYear]);
    for (const goal of yearlyGoals) years.add(goal.year);
    for (const theme of monthlyThemes) years.add(theme.year);
    return Array.from(years).sort((a, b) => b - a);
  }, [yearlyGoals, monthlyThemes]);

  const saveYearlyGoal = useCallback(
    async (input: SaveYearlyGoalInput): Promise<YearlyGoal | null> => {
      if (!organizationId) return null;

      setIsSaving(true);
      try {
        const saved = await upsertYearlyGoal(supabase, organizationId, input);
        setYearlyGoals(prev => {
          const next = prev.filter(g => g.year !== saved.year);
          return [saved, ...next].sort((a, b) => b.year - a.year);
        });
        toast.success(`Saved ${input.year} church goal`);
        return saved;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase],
  );

  const saveRetrospective = useCallback(
    async (input: SaveRetrospectiveInput): Promise<YearlyGoal | null> => {
      if (!organizationId) return null;

      setIsSaving(true);
      try {
        const saved = await upsertRetrospective(
          supabase,
          organizationId,
          input,
        );
        setYearlyGoals(prev => {
          const next = prev.filter(g => g.year !== saved.year);
          return [saved, ...next].sort((a, b) => b.year - a.year);
        });
        toast.success(`Saved ${input.year} retrospective`);
        return saved;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase],
  );

  const toggleObjective = useCallback(
    async (objectiveId: string, completed: boolean): Promise<boolean> => {
      setIsSaving(true);
      try {
        const updated = await toggleObjectiveCompleted(
          supabase,
          objectiveId,
          completed,
        );
        setYearlyGoals(prev =>
          prev.map(goal => ({
            ...goal,
            objectives: goal.objectives.map(objective =>
              objective.id === objectiveId ? updated : objective,
            ),
          })),
        );
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase],
  );

  const saveMonthlyTheme = useCallback(
    async (input: SaveMonthlyThemeInput): Promise<MonthlyTheme | null> => {
      if (!organizationId) return null;

      setIsSaving(true);
      try {
        const saved = await upsertMonthlyTheme(supabase, organizationId, input);
        setMonthlyThemes(prev => {
          const next = prev.filter(
            t => !(t.year === saved.year && t.month === saved.month),
          );
          return [...next, saved].sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return a.month - b.month;
          });
        });
        toast.success("Monthly theme saved");
        return saved;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase],
  );

  const value = useMemo(
    () => ({
      yearlyGoals,
      monthlyThemes,
      hydrated,
      isSaving,
      refreshChurchGoals,
      saveYearlyGoal,
      saveRetrospective,
      toggleObjective,
      saveMonthlyTheme,
      getYearlyGoal,
      getMonthlyTheme,
      getPriorYearActionPoints,
      availableYears,
    }),
    [
      yearlyGoals,
      monthlyThemes,
      hydrated,
      isSaving,
      refreshChurchGoals,
      saveYearlyGoal,
      saveRetrospective,
      toggleObjective,
      saveMonthlyTheme,
      getYearlyGoal,
      getMonthlyTheme,
      getPriorYearActionPoints,
      availableYears,
    ],
  );

  return (
    <ChurchGoalsContext.Provider value={value}>
      {children}
    </ChurchGoalsContext.Provider>
  );
}

export function useChurchGoals() {
  const context = useContext(ChurchGoalsContext);
  if (!context) {
    throw new Error("useChurchGoals must be used within ChurchGoalsProvider");
  }
  return context;
}

export function useChurchGoalsOptional() {
  return useContext(ChurchGoalsContext);
}
