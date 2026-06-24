import type { Entitlements } from "@/lib/subscription/plans";

export type ProfileRole = "admin" | "member";
export type AccountStatus = "active" | "inactive";

export type Organization = {
  id: string;
  name: string;
  address: string;
  phone: string;
  image: string;
  plan?: string;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  provider: string;
  plan: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
};

export type TenantMembership = {
  id: string;
  user_id: string;
  status: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: AccountStatus;
    organizations: Organization[];
  };
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    role: ProfileRole;
    avatar_url: string;
    created_at?: string;
  };
  subscription: Subscription;
  entitlements: Entitlements;
  organizations?: Organization[];
};

export type AuthUser = {
  id: string;
  email: string;
  last_sign_in_at: string | null;
};
