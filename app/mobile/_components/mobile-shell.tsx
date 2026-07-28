"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <button
          type="button"
          onClick={goBack}
          aria-label="Go back"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold leading-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>

      <main className={cn("flex-1 px-4 py-4", withActionBarSpacing && "pb-28")}>
        {children}
      </main>
    </>
  );
}
