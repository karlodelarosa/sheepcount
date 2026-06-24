import type { SubscriptionPlan } from "@/lib/supabase/subscription";
import { hasFeature } from "@/lib/subscription/entitlements";
import { isGroupEnabled, isItemEnabled } from "@/lib/subscription/entitlements";
import type { ModuleGroupKey, ModuleItemKey } from "@/lib/subscription/plans";

const PLAN_GROUP_LABELS: Record<ModuleGroupKey, string> = {
  dashboard: "Dashboard",
  people_membership: "People & Membership",
  groups_ministry: "Groups & Ministry",
  attendance: "Attendance",
  development: "Development",
  leadership: "Leadership",
  growth_track: "Growth Track",
  operations: "Operations",
  finance_projects: "Finance & Projects",
};

const PLAN_ITEM_LABELS: Partial<Record<ModuleItemKey, string>> = {
  water_baptism: "Water Baptism",
  growth_track: "Growth Track",
  properties: "Properties",
  financial: "Financial",
  goal_projects: "Goal Projects",
  church_goals: "Church Goals",
};

export function getPlanHighlights(plan: SubscriptionPlan): string[] {
  const highlights: string[] = [];

  for (const [key, label] of Object.entries(PLAN_GROUP_LABELS)) {
    if (isGroupEnabled(plan.modules, key as ModuleGroupKey)) {
      highlights.push(label);
    }
  }

  for (const [key, label] of Object.entries(PLAN_ITEM_LABELS)) {
    if (label && isItemEnabled(plan.modules, key as ModuleItemKey)) {
      highlights.push(label);
    }
  }

  if (hasFeature(plan, "audit_trail")) {
    highlights.push("Audit Trail");
  }

  return [...new Set(highlights)];
}

export function formatPlanLimit(value: number, label: string): string {
  return `Up to ${value.toLocaleString()} ${label}`;
}
