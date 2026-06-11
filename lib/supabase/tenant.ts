import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AccountStatus,
  AuthUser,
  Organization,
  ProfileRole,
  Subscription,
  TenantMembership,
} from "@/lib/types/tenant";

type DbOrganization = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: AccountStatus;
  address: string | null;
  phone: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
};

type DbMembership = {
  id: string;
  user_id: string;
  status: string;
  role: ProfileRole;
  organization_id: string;
};

function toOrganization(org: DbOrganization): Organization {
  return {
    id: org.id,
    name: org.name,
    address: org.address ?? "",
    phone: org.phone ?? "",
    image: org.image ?? "",
    plan: org.plan,
    created_at: org.created_at,
    updated_at: org.updated_at,
  };
}

function toSubscription(
  subscription: Subscription | null,
  org: DbOrganization,
): Subscription {
  return {
    provider: subscription?.provider ?? "manual",
    plan: subscription?.plan ?? org.plan,
    status: subscription?.status ?? "active",
    current_period_start:
      subscription?.current_period_start ?? org.created_at,
    current_period_end: subscription?.current_period_end ?? org.updated_at,
    cancel_at_period_end: subscription?.cancel_at_period_end ?? false,
  };
}

export async function fetchTenantMembership(
  supabase: SupabaseClient,
  userId: string,
): Promise<TenantMembership | null> {
  const { data: memberships, error: membershipError } = await supabase
    .from("organization_members")
    .select("id, user_id, status, role, organization_id")
    .eq("user_id", userId)
    .eq("status", "active");

  if (membershipError) {
    console.error("Failed to fetch organization membership:", membershipError);
    return null;
  }

  const membership = memberships?.[0];
  if (!membership) return null;

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select(
      "id, name, slug, plan, status, address, phone, image, created_at, updated_at",
    )
    .eq("id", membership.organization_id)
    .single();

  if (orgError || !org) {
    console.error("Failed to fetch organization:", orgError);
    return null;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select(
      "provider, plan, status, current_period_start, current_period_end, cancel_at_period_end",
    )
    .eq("organization_id", org.id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();

  const organization = toOrganization(org as DbOrganization);

  return {
    id: membership.id,
    user_id: membership.user_id,
    status: membership.status,
    tenant: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      status: org.status as AccountStatus,
      organizations: [organization],
    },
    profile: {
      id: profile?.id ?? userId,
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      role: membership.role as ProfileRole,
      avatar_url: profile?.avatar_url ?? "",
      created_at: profile?.created_at,
    },
    organizations: [organization],
    subscription: toSubscription(subscription, org as DbOrganization),
  };
}

export function getOrganizationId(
  tenant: TenantMembership | null,
): string | undefined {
  return tenant?.tenant?.id ?? tenant?.organizations?.[0]?.id;
}

export function toAuthUser(user: {
  id: string;
  email?: string;
  last_sign_in_at?: string | null;
}): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    last_sign_in_at: user.last_sign_in_at ?? null,
  };
}
