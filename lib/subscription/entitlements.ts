import type {
  Entitlements,
  ModuleGroupKey,
  ModuleItemKey,
  ModulesConfig,
  SubscriptionFeatures,
  SubscriptionLimits,
  SubscriptionUsage,
} from "@/lib/subscription/plans";
import { MODULE_ITEM_TO_GROUP } from "@/lib/subscription/plans";

const DEFAULT_LIMITS: SubscriptionLimits = {
  max_people: 2500,
  max_attendance_sessions: 2500,
  max_admin_seats: 1,
  max_member_seats: 2,
};

const DEFAULT_USAGE: SubscriptionUsage = {
  people: 0,
  attendance_sessions: 0,
  admin_seats: 0,
  member_seats: 0,
};

function isEnabled(map: Record<string, { enabled?: boolean }>, key: string) {
  return map[key]?.enabled === true;
}

export function mergeModuleConfig(
  base: ModulesConfig,
  overrides: Partial<ModulesConfig>,
): ModulesConfig {
  const groups = { ...base.groups };
  const items = { ...base.items };

  for (const [key, value] of Object.entries(overrides.groups ?? {})) {
    groups[key] = { ...groups[key], ...value };
  }

  for (const [key, value] of Object.entries(overrides.items ?? {})) {
    items[key] = { ...items[key], ...value };
  }

  return { groups, items };
}

export function isGroupEnabled(
  modules: ModulesConfig,
  groupKey: ModuleGroupKey,
): boolean {
  return isEnabled(modules.groups, groupKey);
}

export function isItemEnabled(
  modules: ModulesConfig,
  itemKey: ModuleItemKey,
): boolean {
  if (!isEnabled(modules.items, itemKey)) {
    return false;
  }

  const groupKey = MODULE_ITEM_TO_GROUP[itemKey];
  if (!groupKey) {
    return false;
  }

  return isGroupEnabled(modules, groupKey);
}

export function hasFeature(
  entitlements: Pick<Entitlements, "features">,
  featureKey: keyof SubscriptionFeatures,
): boolean {
  return entitlements.features[featureKey] === true;
}

export function parseEntitlements(raw: unknown): Entitlements | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const value = raw as Record<string, unknown>;
  const limits = value.limits as Record<string, unknown> | undefined;
  const usage = value.usage as Record<string, unknown> | undefined;
  const modules = value.modules as ModulesConfig | undefined;
  const features = value.features as SubscriptionFeatures | undefined;

  if (!modules?.groups || !modules?.items) {
    return null;
  }

  return {
    plan_key: typeof value.plan_key === "string" ? value.plan_key : "basic",
    limits: {
      max_people:
        typeof limits?.max_people === "number"
          ? limits.max_people
          : DEFAULT_LIMITS.max_people,
      max_attendance_sessions:
        typeof limits?.max_attendance_sessions === "number"
          ? limits.max_attendance_sessions
          : DEFAULT_LIMITS.max_attendance_sessions,
      max_admin_seats:
        typeof limits?.max_admin_seats === "number"
          ? limits.max_admin_seats
          : DEFAULT_LIMITS.max_admin_seats,
      max_member_seats:
        typeof limits?.max_member_seats === "number"
          ? limits.max_member_seats
          : DEFAULT_LIMITS.max_member_seats,
    },
    usage: {
      people:
        typeof usage?.people === "number" ? usage.people : DEFAULT_USAGE.people,
      attendance_sessions:
        typeof usage?.attendance_sessions === "number"
          ? usage.attendance_sessions
          : DEFAULT_USAGE.attendance_sessions,
      admin_seats:
        typeof usage?.admin_seats === "number"
          ? usage.admin_seats
          : DEFAULT_USAGE.admin_seats,
      member_seats:
        typeof usage?.member_seats === "number"
          ? usage.member_seats
          : DEFAULT_USAGE.member_seats,
    },
    modules,
    features: features ?? {},
  };
}

export const BASIC_ENTITLEMENTS_FALLBACK: Entitlements = {
  plan_key: "basic",
  limits: DEFAULT_LIMITS,
  usage: DEFAULT_USAGE,
  modules: {
    groups: {
      dashboard: { enabled: true },
      people_membership: { enabled: true },
      groups_ministry: { enabled: true },
      attendance: { enabled: true },
      development: { enabled: true },
      leadership: { enabled: true },
      growth_track: { enabled: false },
      operations: { enabled: false },
      finance_projects: { enabled: false },
    },
    items: {
      dashboard: { enabled: true },
      people: { enabled: true },
      workers: { enabled: true },
      households: { enabled: true },
      water_baptism: { enabled: false },
      life_groups: { enabled: true },
      cell_groups: { enabled: true },
      work_ministry: { enabled: true },
      service_attendance: { enabled: true },
      event_attendance: { enabled: true },
      training: { enabled: true },
      discipleship: { enabled: true },
      bible_study: { enabled: true },
      programs: { enabled: true },
      leadership: { enabled: true },
      growth_track: { enabled: false },
      properties: { enabled: false },
      financial: { enabled: false },
      goal_projects: { enabled: false },
      church_goals: { enabled: false },
    },
  },
  features: { audit_trail: false },
};

export const PRO_ENTITLEMENTS_FALLBACK: Entitlements = {
  ...BASIC_ENTITLEMENTS_FALLBACK,
  plan_key: "pro",
  modules: {
    groups: {
      dashboard: { enabled: true },
      people_membership: { enabled: true },
      groups_ministry: { enabled: true },
      attendance: { enabled: true },
      development: { enabled: true },
      leadership: { enabled: true },
      growth_track: { enabled: true },
      operations: { enabled: true },
      finance_projects: { enabled: true },
    },
    items: {
      dashboard: { enabled: true },
      people: { enabled: true },
      workers: { enabled: true },
      households: { enabled: true },
      water_baptism: { enabled: true },
      life_groups: { enabled: true },
      cell_groups: { enabled: true },
      work_ministry: { enabled: true },
      service_attendance: { enabled: true },
      event_attendance: { enabled: true },
      training: { enabled: true },
      discipleship: { enabled: true },
      bible_study: { enabled: true },
      programs: { enabled: true },
      leadership: { enabled: true },
      growth_track: { enabled: true },
      properties: { enabled: true },
      financial: { enabled: true },
      goal_projects: { enabled: true },
      church_goals: { enabled: true },
    },
  },
  features: { audit_trail: true },
};
