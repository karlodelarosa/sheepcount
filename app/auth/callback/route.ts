import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function ensureOrganization(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  organizationName?: string | null,
) {
  const { data: existingMembership } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (existingMembership || !organizationName) {
    return;
  }

  await supabase.rpc("setup_organization", {
    org_name: organizationName,
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const organizationName = data.user.user_metadata?.organization_name as
        | string
        | undefined;

      await ensureOrganization(supabase, data.user.id, organizationName);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
