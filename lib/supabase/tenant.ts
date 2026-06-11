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
  subscriptions: Subscription | Subscription[] | null;
};

type DbMembership = {
  id: string;
  user_id: string;
  status: string;
  role: ProfileRole;
  organizations: DbOrganization | null;
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
  subscriptions: Subscription | Subscription[] | null,
  org: DbOrganization,
): Subscription {
  const subscription = Array.isArray(subscriptions)
    ? subscriptions[0]
    : subscriptions;

  return {
    provider: subscription?.provider ?? "manual",
    plan: subscription?.plan ?? org.plan,
    status: subscription?.status ?? "active",
    current_period_start:
      subscription?.current_period_start ?? org.created_at,
    current_period_end:
      subscription?.current_period_end ?? org.updated_at,
    cancel_at_period_end: subscription?.cancel_at_period_end ?? false,
  };
}

export async function fetchTenantMembership(
  supabase: SupabaseClient,
  userId: string,
): Promise<TenantMembership | null> {
  const { data: membership, error } = await supabase
    .from("organization_members")
    .select(
      `
      id,
      user_id,
      status,
      role,
      organizations (
        id,
        name,
        slug,
        plan,
        status,
        address,
        phone,
        image,
        created_at,
        updated_at,
        subscriptions (
          provider,
          plan,
          status,
          current_period_start,
          current_period_end,
          cancel_at_period_end
        )
      )
    `,
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !membership?.organizations) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();

  const org = membership.organizations as DbOrganization;
  const organization = toOrganization(org);

  return {
    id: membership.id,
    user_id: membership.user_id,
    status: membership.status,
    tenant: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      status: org.status,
      organizations: [organization],
    },
    profile: {
      id: profile?.id ?? userId,
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      role: membership.role,
      avatar_url: profile?.avatar_url ?? "",
      created_at: profile?.created_at,
    },
    organizations: [organization],
    subscription: toSubscription(org.subscriptions, org),
  };
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
