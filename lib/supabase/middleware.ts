import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATH_PREFIXES = ["/auth"];
// Files a browser/OS must be able to fetch without a session to install the
// PWA (manifest discovery and service worker registration happen outside any
// authenticated fetch context) — not covered by the middleware matcher's
// static-asset exclusions since those only skip _next/static and images.
const PUBLIC_FILES = ["/manifest.json", "/sw.js"];
const ONBOARDING_PATH = "/onboarding";
const MOBILE_UA =
  /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

function isPublicPath(pathname: string) {
  if (PUBLIC_FILES.includes(pathname)) return true;
  return PUBLIC_PATH_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Whether an authenticated phone request should be sent to the /mobile app.
 * Only top-level document navigations are redirected (never API/fetch/asset
 * requests), and a `viewMode=desktop` cookie — set by /mobile/desktop — opts a
 * user out so they can use the full desktop app on their phone.
 */
function shouldRedirectToMobile(
  request: NextRequest,
  pathname: string,
): boolean {
  if (request.headers.get("sec-fetch-dest") !== "document") return false;
  if (request.cookies.get("viewMode")?.value === "desktop") return false;
  if (pathname.startsWith("/mobile")) return false;
  if (isPublicPath(pathname)) return false;
  if (pathname === ONBOARDING_PATH) return false;
  return MOBILE_UA.test(request.headers.get("user-agent") ?? "");
}

async function userHasActiveMembership(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to check organization membership:", error);
    return false;
  }

  return Boolean(data);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (pathname === "/auth/login" || pathname === "/auth/sign-up-success")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user) {
    const hasMembership = await userHasActiveMembership(supabase, user.id);

    if (
      !hasMembership &&
      pathname !== ONBOARDING_PATH &&
      !isPublicPath(pathname)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = ONBOARDING_PATH;
      return NextResponse.redirect(url);
    }

    if (hasMembership && pathname === ONBOARDING_PATH) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (hasMembership && shouldRedirectToMobile(request, pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/mobile";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
