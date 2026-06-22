import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_ORGANIZATION_SETTINGS,
  parseOrganizationSettings,
  type OrganizationSettings,
} from "@/lib/types/organization-settings";

type DbOrganizationSettings = {
  settings: unknown;
};

export async function fetchOrganizationSettings(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<OrganizationSettings> {
  const { data, error } = await supabase
    .from("organizations")
    .select("settings")
    .eq("id", organizationId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch organization settings:", error);
    return { ...DEFAULT_ORGANIZATION_SETTINGS };
  }

  return parseOrganizationSettings((data as DbOrganizationSettings).settings);
}

export async function updateOrganizationSettings(
  supabase: SupabaseClient,
  organizationId: string,
  updates: Partial<OrganizationSettings>,
): Promise<OrganizationSettings> {
  const current = await fetchOrganizationSettings(supabase, organizationId);
  const next = { ...current, ...updates };

  const { error } = await supabase
    .from("organizations")
    .update({ settings: next })
    .eq("id", organizationId);

  if (error) {
    throw error;
  }

  return next;
}
