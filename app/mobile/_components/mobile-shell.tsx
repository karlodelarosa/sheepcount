"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileThemeToggle } from "./mobile-theme-toggle";

interface MobileShellProps {
  title: string;
  subtitle?: string;
  /** Where the back button navigates. Defaults to browser back. */
  backHref?: string;
  /** Custom back handler. Takes precedence over backHref. */
  onBack?: () => void;
  /** Optional element rendered on the right of the header. */
  action?: React.ReactNode;
  /** Extra padding at the bottom so a sticky action bar never overlaps content. */
  withActionBarSpacing?: boolean;
  children: React.ReactNode;
}

export function MobileShell({
  title,
  subtitle,
  backHref,
  onBack,
  action,
  withActionBarSpacing = false,
  children,
}: MobileShellProps) {
  const router = useRouter();

  const goBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backHref) {
      router.push(backHref);
      return;
    }
    router.back();
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-background/88 px-3 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
        <div className="flex min-h-11 items-center gap-1">
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-muted active:bg-muted motion-reduce:transition-none"
          >
            <ArrowLeft className="size-5" strokeWidth={1.9} />
          </button>
          <div className="min-w-0 flex-1 px-1">
            <h1 className="truncate text-[17px] font-semibold leading-tight tracking-[-0.015em]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 truncate text-[13px] leading-4 text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
          <MobileThemeToggle />
        </div>
        {action ? (
          <div className="mt-1 flex min-h-6 items-center justify-end px-2">
            {action}
          </div>
        ) : null}
      </header>

      <main
        className={cn("flex-1 px-4 pb-8 pt-3", withActionBarSpacing && "pb-32")}
      >
        {children}
      </main>
    </>
  );
}
