"use client";

/** Keep the route subtree mounted: navigation must never wait for an animation. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="min-h-0">{children}</div>;
}
