import type { SupportedCurrency } from "@/lib/currency";
import { DEFAULT_CURRENCY, parseCurrency } from "@/lib/currency";
import type { ModuleItemKey } from "@/lib/subscription/plans";

export type OrganizationSettings = {
  waterBaptismEnabled?: boolean;
  /** Menu item keys hidden from navigation for all org members. */
  hiddenMenuItems?: ModuleItemKey[];
  /** Display currency for financial modules. Defaults to PHP. */
  currency?: SupportedCurrency;
  /** Target savings amount for the financial overview goal. */
  financialSavingsGoal?: number | null;
  /** Target date (YYYY-MM-DD) to reach the savings goal. */
  financialGoalTargetDate?: string | null;
};

export const DEFAULT_ORGANIZATION_SETTINGS: OrganizationSettings = {
  waterBaptismEnabled: false,
  hiddenMenuItems: [],
  currency: DEFAULT_CURRENCY,
};

const MODULE_ITEM_KEYS = new Set<ModuleItemKey>([
  "dashboard",
  "people",
  "workers",
  "households",
  "water_baptism",
  "life_groups",
  "cell_groups",
  "work_ministry",
  "service_attendance",
  "event_attendance",
  "training",
  "discipleship",
  "bible_study",
  "programs",
  "leadership",
  "growth_track",
  "properties",
  "financial",
  "goal_projects",
  "church_goals",
]);

function parseHiddenMenuItems(raw: unknown): ModuleItemKey[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter(
    (item): item is ModuleItemKey =>
      typeof item === "string" && MODULE_ITEM_KEYS.has(item as ModuleItemKey),
  );
}

export function isMenuItemVisibleInNav(
  itemKey: ModuleItemKey,
  hiddenMenuItems: ModuleItemKey[] | undefined,
): boolean {
  return !hiddenMenuItems?.includes(itemKey);
}

export function parseOrganizationSettings(
  raw: unknown,
): OrganizationSettings {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_ORGANIZATION_SETTINGS };
  }

  const value = raw as Record<string, unknown>;
  return {
    waterBaptismEnabled:
      typeof value.waterBaptismEnabled === "boolean"
        ? value.waterBaptismEnabled
        : DEFAULT_ORGANIZATION_SETTINGS.waterBaptismEnabled,
    hiddenMenuItems: parseHiddenMenuItems(value.hiddenMenuItems),
    currency: parseCurrency(value.currency),
    financialSavingsGoal:
      typeof value.financialSavingsGoal === "number" &&
      Number.isFinite(value.financialSavingsGoal) &&
      value.financialSavingsGoal > 0
        ? value.financialSavingsGoal
        : null,
    financialGoalTargetDate:
      typeof value.financialGoalTargetDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value.financialGoalTargetDate)
        ? value.financialGoalTargetDate
        : null,
  };
}
