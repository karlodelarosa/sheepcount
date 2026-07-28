import { NextResponse } from "next/server";

/**
 * Opts a phone out of the automatic /mobile redirect and hands off to the full
 * desktop app. The "Home" item in the mobile bottom nav links here.
 *
 * Sets `viewMode=desktop` (see shouldRedirectToMobile in
 * lib/supabase/middleware.ts) so the middleware stops forcing this device to
 * /mobile. It's a session cookie, so closing the browser resets the phone back
 * to the mobile experience on next launch.
 */
export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("viewMode", "desktop", {
    path: "/",
    sameSite: "lax",
  });
  return response;
}
