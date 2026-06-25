/**
 * Validates post-auth redirect paths to prevent open redirects.
 * Only same-origin relative paths are allowed.
 */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next) return "/dashboard";
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  if (next.includes("\\") || next.includes("\0")) return "/dashboard";
  return next;
}
