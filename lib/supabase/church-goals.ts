import type { SupabaseClient } from "@supabase/supabase-js";

export type RetrospectiveCategory =
  | "went_well"
  | "could_be_better"
  | "action_point";

export type YearlyGoalObjective = {
  id: string;
  yearlyGoalId: string;
  text: string;
  sortOrder: number;
  isCompleted: boolean;
  completedAt: string | null;
};

export type RetrospectiveItem = {
  id: string;
  yearlyGoalId: string;
  category: RetrospectiveCategory;
  text: string;
  sortOrder: number;
};

export type YearlyGoal = {
  id: string;
  organizationId: string;
  year: number;
  theme: string;
  title: string;
  description: string;
  vision: string;
  objectives: YearlyGoalObjective[];
  retrospective: RetrospectiveItem[];
  createdAt: string;
  updatedAt: string;
};

export type MonthlyTheme = {
  id: string;
  organizationId: string;
  year: number;
  month: number;
  title: string;
  description: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type SaveYearlyGoalInput = {
  year: number;
  theme: string;
  title: string;
  description: string;
  vision: string;
  objectives: { text: string; isCompleted?: boolean }[];
};

export type SaveRetrospectiveInput = {
  year: number;
  wentWell: string[];
  couldBeBetter: string[];
  actionPoints: string[];
};

export type SaveMonthlyThemeInput = {
  year: number;
  month: number;
  title: string;
  description: string;
  content: string;
};

type DbYearlyGoal = {
  id: string;
  organization_id: string;
  year: number;
  theme: string;
  title: string;
  description: string;
  vision: string;
  created_at: string;
  updated_at: string;
};

type DbObjective = {
  id: string;
  yearly_goal_id: string;
  text: string;
  sort_order: number;
  is_completed: boolean;
  completed_at: string | null;
};

type DbRetrospectiveItem = {
  id: string;
  yearly_goal_id: string;
  category: RetrospectiveCategory;
  text: string;
  sort_order: number;
};

type DbMonthlyTheme = {
  id: string;
  organization_id: string;
  year: number;
  month: number;
  title: string;
  description: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const GOAL_SELECT =
  "id, organization_id, year, theme, title, description, vision, created_at, updated_at";

function toObjective(row: DbObjective): YearlyGoalObjective {
  return {
    id: row.id,
    yearlyGoalId: row.yearly_goal_id,
    text: row.text,
    sortOrder: row.sort_order,
    isCompleted: row.is_completed,
    completedAt: row.completed_at,
  };
}

function toRetrospectiveItem(row: DbRetrospectiveItem): RetrospectiveItem {
  return {
    id: row.id,
    yearlyGoalId: row.yearly_goal_id,
    category: row.category,
    text: row.text,
    sortOrder: row.sort_order,
  };
}

function toYearlyGoal(
  row: DbYearlyGoal,
  objectives: YearlyGoalObjective[],
  retrospective: RetrospectiveItem[],
): YearlyGoal {
  return {
    id: row.id,
    organizationId: row.organization_id,
    year: row.year,
    theme: row.theme,
    title: row.title,
    description: row.description,
    vision: row.vision,
    objectives,
    retrospective,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toMonthlyTheme(row: DbMonthlyTheme): MonthlyTheme {
  return {
    id: row.id,
    organizationId: row.organization_id,
    year: row.year,
    month: row.month,
    title: row.title,
    description: row.description,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getRetrospectiveItems(
  goal: YearlyGoal,
  category: RetrospectiveCategory,
): RetrospectiveItem[] {
  return goal.retrospective
    .filter(item => item.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function formatActionPointsForCarryForward(goal: YearlyGoal): string | null {
  const items = getRetrospectiveItems(goal, "action_point");
  if (items.length === 0) return null;
  return items.map(item => `• ${item.text}`).join("\n");
}

async function loadGoalChildren(
  supabase: SupabaseClient,
  goalIds: string[],
): Promise<{
  objectivesByGoal: Map<string, YearlyGoalObjective[]>;
  retrospectiveByGoal: Map<string, RetrospectiveItem[]>;
}> {
  const objectivesByGoal = new Map<string, YearlyGoalObjective[]>();
  const retrospectiveByGoal = new Map<string, RetrospectiveItem[]>();

  if (goalIds.length === 0) {
    return { objectivesByGoal, retrospectiveByGoal };
  }

  const [objectivesResult, retrospectiveResult] = await Promise.all([
    supabase
      .from("church_yearly_goal_objectives")
      .select(
        "id, yearly_goal_id, text, sort_order, is_completed, completed_at",
      )
      .in("yearly_goal_id", goalIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("church_yearly_goal_retrospective_items")
      .select("id, yearly_goal_id, category, text, sort_order")
      .in("yearly_goal_id", goalIds)
      .order("sort_order", { ascending: true }),
  ]);

  if (objectivesResult.error) throw objectivesResult.error;
  if (retrospectiveResult.error) throw retrospectiveResult.error;

  for (const row of (objectivesResult.data ?? []) as DbObjective[]) {
    const objective = toObjective(row);
    const list = objectivesByGoal.get(objective.yearlyGoalId) ?? [];
    list.push(objective);
    objectivesByGoal.set(objective.yearlyGoalId, list);
  }

  for (const row of (retrospectiveResult.data ?? []) as DbRetrospectiveItem[]) {
    const item = toRetrospectiveItem(row);
    const list = retrospectiveByGoal.get(item.yearlyGoalId) ?? [];
    list.push(item);
    retrospectiveByGoal.set(item.yearlyGoalId, list);
  }

  return { objectivesByGoal, retrospectiveByGoal };
}

async function fetchYearlyGoalById(
  supabase: SupabaseClient,
  goalId: string,
): Promise<YearlyGoal> {
  const { data: goalRow, error: goalError } = await supabase
    .from("church_yearly_goals")
    .select(GOAL_SELECT)
    .eq("id", goalId)
    .single();

  if (goalError || !goalRow) {
    throw goalError ?? new Error("Failed to fetch yearly goal");
  }

  const { objectivesByGoal, retrospectiveByGoal } = await loadGoalChildren(
    supabase,
    [goalId],
  );

  return toYearlyGoal(
    goalRow as DbYearlyGoal,
    objectivesByGoal.get(goalId) ?? [],
    retrospectiveByGoal.get(goalId) ?? [],
  );
}

export async function fetchChurchGoalsForOrg(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<{ yearlyGoals: YearlyGoal[]; monthlyThemes: MonthlyTheme[] }> {
  const [goalsResult, themesResult] = await Promise.all([
    supabase
      .from("church_yearly_goals")
      .select(GOAL_SELECT)
      .eq("organization_id", organizationId)
      .order("year", { ascending: false }),
    supabase
      .from("church_monthly_themes")
      .select(
        "id, organization_id, year, month, title, description, content, created_at, updated_at",
      )
      .eq("organization_id", organizationId)
      .order("year", { ascending: false })
      .order("month", { ascending: true }),
  ]);

  if (goalsResult.error) throw goalsResult.error;
  if (themesResult.error) throw themesResult.error;

  const goalRows = (goalsResult.data ?? []) as DbYearlyGoal[];
  const goalIds = goalRows.map(g => g.id);
  const { objectivesByGoal, retrospectiveByGoal } = await loadGoalChildren(
    supabase,
    goalIds,
  );

  const yearlyGoals = goalRows.map(row =>
    toYearlyGoal(
      row,
      objectivesByGoal.get(row.id) ?? [],
      retrospectiveByGoal.get(row.id) ?? [],
    ),
  );

  const monthlyThemes = ((themesResult.data ?? []) as DbMonthlyTheme[]).map(
    toMonthlyTheme,
  );

  return { yearlyGoals, monthlyThemes };
}

export async function upsertYearlyGoal(
  supabase: SupabaseClient,
  organizationId: string,
  input: SaveYearlyGoalInput,
): Promise<YearlyGoal> {
  const { data: existing } = await supabase
    .from("church_yearly_goals")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("year", input.year)
    .maybeSingle();

  const payload = {
    organization_id: organizationId,
    year: input.year,
    theme: input.theme,
    title: input.title,
    description: input.description,
    vision: input.vision,
    updated_at: new Date().toISOString(),
  };

  let goalId: string;

  if (existing?.id) {
    const { data, error } = await supabase
      .from("church_yearly_goals")
      .update(payload)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("Failed to update yearly goal");
    }

    goalId = data.id;
  } else {
    const { data, error } = await supabase
      .from("church_yearly_goals")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("Failed to create yearly goal");
    }

    goalId = data.id;
  }

  await upsertObjectives(supabase, goalId, input.objectives);
  return fetchYearlyGoalById(supabase, goalId);
}

export async function upsertRetrospective(
  supabase: SupabaseClient,
  organizationId: string,
  input: SaveRetrospectiveInput,
): Promise<YearlyGoal> {
  const { data: goal, error: goalError } = await supabase
    .from("church_yearly_goals")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("year", input.year)
    .maybeSingle();

  if (goalError) throw goalError;
  if (!goal?.id) {
    throw new Error(`No church goal found for ${input.year}`);
  }

  const { error: deleteError } = await supabase
    .from("church_yearly_goal_retrospective_items")
    .delete()
    .eq("yearly_goal_id", goal.id);

  if (deleteError) throw deleteError;

  const rows = [
    ...input.wentWell
      .map(text => text.trim())
      .filter(Boolean)
      .map((text, index) => ({
        yearly_goal_id: goal.id,
        category: "went_well" as const,
        text,
        sort_order: index,
      })),
    ...input.couldBeBetter
      .map(text => text.trim())
      .filter(Boolean)
      .map((text, index) => ({
        yearly_goal_id: goal.id,
        category: "could_be_better" as const,
        text,
        sort_order: index,
      })),
    ...input.actionPoints
      .map(text => text.trim())
      .filter(Boolean)
      .map((text, index) => ({
        yearly_goal_id: goal.id,
        category: "action_point" as const,
        text,
        sort_order: index,
      })),
  ];

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("church_yearly_goal_retrospective_items")
      .insert(rows);

    if (insertError) throw insertError;
  }

  await supabase
    .from("church_yearly_goals")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", goal.id);

  return fetchYearlyGoalById(supabase, goal.id);
}

export async function upsertObjectives(
  supabase: SupabaseClient,
  yearlyGoalId: string,
  objectives: { text: string; isCompleted?: boolean }[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("church_yearly_goal_objectives")
    .delete()
    .eq("yearly_goal_id", yearlyGoalId);

  if (deleteError) throw deleteError;

  const filtered = objectives
    .filter(o => o.text.trim())
    .map((objective, index) => ({
      yearly_goal_id: yearlyGoalId,
      text: objective.text.trim(),
      sort_order: index,
      is_completed: objective.isCompleted ?? false,
      completed_at: objective.isCompleted
        ? new Date().toISOString()
        : null,
    }));

  if (filtered.length === 0) return;

  const { error: insertError } = await supabase
    .from("church_yearly_goal_objectives")
    .insert(filtered);

  if (insertError) throw insertError;
}

export async function toggleObjectiveCompleted(
  supabase: SupabaseClient,
  objectiveId: string,
  completed: boolean,
): Promise<YearlyGoalObjective> {
  const { data, error } = await supabase
    .from("church_yearly_goal_objectives")
    .update({
      is_completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", objectiveId)
    .select(
      "id, yearly_goal_id, text, sort_order, is_completed, completed_at",
    )
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to update objective");
  }

  return toObjective(data as DbObjective);
}

export async function upsertMonthlyTheme(
  supabase: SupabaseClient,
  organizationId: string,
  input: SaveMonthlyThemeInput,
): Promise<MonthlyTheme> {
  const { data: existing } = await supabase
    .from("church_monthly_themes")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("year", input.year)
    .eq("month", input.month)
    .maybeSingle();

  const payload = {
    organization_id: organizationId,
    year: input.year,
    month: input.month,
    title: input.title,
    description: input.description,
    content: input.content,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("church_monthly_themes")
      .update(payload)
      .eq("id", existing.id)
      .select(
        "id, organization_id, year, month, title, description, content, created_at, updated_at",
      )
      .single();

    if (error || !data) {
      throw error ?? new Error("Failed to update monthly theme");
    }

    return toMonthlyTheme(data as DbMonthlyTheme);
  }

  const { data, error } = await supabase
    .from("church_monthly_themes")
    .insert(payload)
    .select(
      "id, organization_id, year, month, title, description, content, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to create monthly theme");
  }

  return toMonthlyTheme(data as DbMonthlyTheme);
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
