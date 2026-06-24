import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BASIC_ENTITLEMENTS_FALLBACK,
  PRO_ENTITLEMENTS_FALLBACK,
} from "@/lib/subscription/entitlements";
import type {
  ModulesConfig,
  SubscriptionFeatures,
} from "@/lib/subscription/plans";
import { getPlanTier, normalizePlanKey } from "@/lib/subscription/plans";

export type SubscriptionPlan = {
  key: string;
  name: string;
  max_people: number;
  max_attendance_sessions: number;
  max_admin_seats: number;
  max_member_seats: number;
  sort_order: number;
  modules: ModulesConfig;
  features: SubscriptionFeatures;
};

const FALLBACK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    key: "basic",
    name: "Basic",
    max_people: BASIC_ENTITLEMENTS_FALLBACK.limits.max_people,
    max_attendance_sessions:
      BASIC_ENTITLEMENTS_FALLBACK.limits.max_attendance_sessions,
    max_admin_seats: BASIC_ENTITLEMENTS_FALLBACK.limits.max_admin_seats,
    max_member_seats: BASIC_ENTITLEMENTS_FALLBACK.limits.max_member_seats,
    sort_order: getPlanTier("basic"),
    modules: BASIC_ENTITLEMENTS_FALLBACK.modules,
    features: BASIC_ENTITLEMENTS_FALLBACK.features,
  },
  {
    key: "pro",
    name: "Pro",
    max_people: PRO_ENTITLEMENTS_FALLBACK.limits.max_people,
    max_attendance_sessions:
      PRO_ENTITLEMENTS_FALLBACK.limits.max_attendance_sessions,
    max_admin_seats: PRO_ENTITLEMENTS_FALLBACK.limits.max_admin_seats,
    max_member_seats: PRO_ENTITLEMENTS_FALLBACK.limits.max_member_seats,
    sort_order: getPlanTier("pro"),
    modules: PRO_ENTITLEMENTS_FALLBACK.modules,
    features: PRO_ENTITLEMENTS_FALLBACK.features,
  },
];

export async function fetchSubscriptionPlans(
  supabase: SupabaseClient,
): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select(
      "key, name, max_people, max_attendance_sessions, max_admin_seats, max_member_seats, sort_order, modules, features",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    return FALLBACK_SUBSCRIPTION_PLANS;
  }

  return data.map(plan => ({
    ...plan,
    sort_order: getPlanTier(plan.key, plan.sort_order),
  })) as SubscriptionPlan[];
}

export async function upgradeOrganizationSubscription(
  supabase: SupabaseClient,
  organizationId: string,
  planKey: string,
) {
  const { error } = await supabase.rpc("upgrade_organization_subscription", {
    p_organization_id: organizationId,
    p_plan_key: planKey,
  });

  if (error) throw error;
}
