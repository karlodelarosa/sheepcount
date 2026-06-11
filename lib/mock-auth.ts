import type { TenantMembership } from "@/lib/types/tenant";
import { DEMO_EMAIL, DEMO_ORG_NAME, DEMO_TENANT_SLUG } from "@/lib/branding";

export const mockUser = {
  id: "mock-user-id",
  email: DEMO_EMAIL,
  last_sign_in_at: new Date().toISOString(),
};

const mockOrganization = {
  id: "mock-org-id",
  name: DEMO_ORG_NAME,
  address: "123 Main St, Demo City",
  phone: "(555) 000-0000",
  image: "",
  plan: "Standard",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockSubscription = {
  provider: "mock",
  plan: "Standard",
  status: "active",
  current_period_start: "2024-01-01T00:00:00Z",
  current_period_end: "2025-01-01T00:00:00Z",
  cancel_at_period_end: false,
};

const mockThemeSettings = {
  mode: "system" as const,
  accentColor: "#030213",
  organizationName: DEMO_ORG_NAME,
  organizationLogo: null,
};

export const mockTenantMembership: TenantMembership & {
  organizations: typeof mockOrganization[];
  status: string;
} = {
  id: "mock-member-id",
  user_id: mockUser.id,
  status: "active",
  profile: {
    id: "mock-profile-id",
    first_name: "Demo",
    last_name: "User",
    role: "admin" as const,
    avatar_url: "",
    created_at: "2024-01-01T00:00:00Z",
  },
  tenant: {
    id: "mock-tenant-id",
    name: DEMO_ORG_NAME,
    slug: DEMO_TENANT_SLUG,
    plan: "standard",
    status: "active" as const,
    organizations: [mockOrganization],
  },
  organizations: [mockOrganization],
  subscription: mockSubscription,
  status: "Active",
};

export function seedLocalSession(email?: string) {
  const user = email ? { ...mockUser, email } : mockUser;

  localStorage.setItem("tenant-data", JSON.stringify(mockTenantMembership));
  localStorage.setItem("mock-user", JSON.stringify(user));
  localStorage.setItem("theme-settings", JSON.stringify(mockThemeSettings));

  return { user, tenant: mockTenantMembership };
}

export function clearLocalSession() {
  localStorage.removeItem("tenant-data");
  localStorage.removeItem("mock-user");
}
