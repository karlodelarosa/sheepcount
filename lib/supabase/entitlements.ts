import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BASIC_ENTITLEMENTS_FALLBACK,
  parseEntitlements,
} from "@/lib/subscription/entitlements";
import type { Entitlements } from "@/lib/subscription/plans";

export async function fetchOrgEntitlements(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Entitlements> {
  const { data, error } = await supabase.rpc("get_org_entitlements", {
    p_org_id: organizationId,
  });

  if (error) {
    console.error("Failed to fetch org entitlements:", error);
    return BASIC_ENTITLEMENTS_FALLBACK;
  }

  return parseEntitlements(data) ?? BASIC_ENTITLEMENTS_FALLBACK;
}
