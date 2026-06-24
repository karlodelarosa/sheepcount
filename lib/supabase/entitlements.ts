import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BASIC_ENTITLEMENTS_FALLBACK,
  mergeModuleConfig,
  parseEntitlements,
} from "@/lib/subscription/entitlements";
import type {
  Entitlements,
  ModulesConfig,
  SubscriptionFeatures,
} from "@/lib/subscription/plans";

function normalizePlanKey(plan: string) {
  return plan.toLowerCase() === "pro" ? "pro" : "basic";
}

function parseModulesConfig(raw: unknown): ModulesConfig {
  if (!raw || typeof raw !== "object") {
    return { groups: {}, items: {} };
  }

  const value = raw as ModulesConfig;
  return {
    groups: value.groups ?? {},
    items: value.items ?? {},
  };
}

function parseFeatures(raw: unknown): SubscriptionFeatures {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  return raw as SubscriptionFeatures;
}

function mergeJsonObjects(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
) {
  return { ...base, ...patch };
}

async function fetchUsageCounts(
  supabase: SupabaseClient,
  organizationId: string,
) {
  const [
    { count: people },
    { count: serviceSessions },
    { count: lifeGroupSessions },
    { count: adminSeats },
    { count: memberSeats },
  ] = await Promise.all([
    supabase
      .from("people")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("service_sessions")
      .select("id, service_types!inner(category)", {
        count: "exact",
        head: true,
      })
      .eq("organization_id", organizationId)
      .eq("service_types.category", "sunday"),
    supabase
      .from("life_group_sessions")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .eq("role", "admin"),
    supabase
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .eq("role", "member"),
  ]);

  return {
    people: people ?? 0,
    attendance_sessions: (serviceSessions ?? 0) + (lifeGroupSessions ?? 0),
    admin_seats: adminSeats ?? 0,
    member_seats: memberSeats ?? 0,
  };
}

async function fetchEntitlementsFromTables(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Entitlements | null> {
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select(
      "plan_key, plan, override_max_people, override_max_attendance_sessions, override_max_admin_seats, override_max_member_seats, module_overrides, features_override",
    )
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (subError) {
    console.error("Failed to fetch subscription for entitlements:", subError);
    return null;
  }

  if (!subscription) return null;

  const planKey = normalizePlanKey(
    subscription.plan_key ?? subscription.plan ?? "basic",
  );

  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .select(
      "key, max_people, max_attendance_sessions, max_admin_seats, max_member_seats, modules, features",
    )
    .eq("key", planKey)
    .maybeSingle();

  if (planError) {
    console.error("Failed to fetch subscription plan:", planError);
    return null;
  }

  if (!plan) return null;

  const moduleOverrides = parseModulesConfig(subscription.module_overrides);
  const featuresOverride = parseFeatures(subscription.features_override);
  const planModules = parseModulesConfig(plan.modules);
  const planFeatures = parseFeatures(plan.features);
  const modules = mergeModuleConfig(planModules, moduleOverrides);
  const features = mergeJsonObjects(
    planFeatures as Record<string, unknown>,
    featuresOverride as Record<string, unknown>,
  ) as SubscriptionFeatures;
  const usage = await fetchUsageCounts(supabase, organizationId);

  return {
    plan_key: plan.key,
    limits: {
      max_people: subscription.override_max_people ?? plan.max_people,
      max_attendance_sessions:
        subscription.override_max_attendance_sessions ??
        plan.max_attendance_sessions,
      max_admin_seats:
        subscription.override_max_admin_seats ?? plan.max_admin_seats,
      max_member_seats:
        subscription.override_max_member_seats ?? plan.max_member_seats,
    },
    usage,
    modules,
    features,
  };
}

export async function fetchOrgEntitlements(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Entitlements> {
  const { data, error } = await supabase.rpc("get_org_entitlements", {
    p_org_id: organizationId,
  });

  if (!error) {
    return parseEntitlements(data) ?? BASIC_ENTITLEMENTS_FALLBACK;
  }

  const fromTables = await fetchEntitlementsFromTables(supabase, organizationId);
  if (fromTables) {
    return fromTables;
  }

  console.error("Failed to fetch org entitlements:", error);
  return BASIC_ENTITLEMENTS_FALLBACK;
}
