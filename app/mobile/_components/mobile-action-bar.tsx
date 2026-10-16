"use client";

import { cn } from "@/lib/utils";

interface MobileActionBarProps {
  children: React.ReactNode;
  /** Optional summary text shown above the action (e.g. "3 selected"). */
  hint?: React.ReactNode;
  className?: string;
}

/**
 * Sticky footer pinned to the bottom of the phone viewport. Pair with
 * `withActionBarSpacing` on MobileShell so page content never hides behind it.
 */
export function MobileActionBar({
  children,
  hint,
  className,
}: MobileActionBarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div
        className={cn(
          "pointer-events-auto w-full max-w-[26.5rem] rounded-[22px] border border-black/[0.06] bg-card/92 p-3 shadow-[0_10px_35px_rgba(0,0,0,0.14)] backdrop-blur-xl dark:border-white/[0.1] supports-[backdrop-filter]:bg-card/84 [&_button]:min-h-[3.25rem] [&_button]:rounded-xl",
          className,
        )}
      >
        {hint ? (
          <div className="mb-2 text-center text-[13px] text-muted-foreground">
            {hint}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
