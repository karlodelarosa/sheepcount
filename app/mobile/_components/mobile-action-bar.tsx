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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center">
      <div
        className={cn(
          "pointer-events-auto w-full max-w-md border-t bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-background/85",
          className,
        )}
      >
        {hint ? (
          <div className="mb-2 text-center text-xs text-muted-foreground">
            {hint}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
