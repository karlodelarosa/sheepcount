"use client";

import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartPanelProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartPanel({
  title,
  icon: Icon,
  description,
  action,
  children,
  className,
}: ChartPanelProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <Icon
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-[var(--accent-color)]"
            />
          )}
          <div className="min-w-0">
            <h3 id={headingId} className="text-base font-bold tracking-tight">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="min-w-0 p-5">{children}</div>
    </section>
  );
}

export function ChartEmpty({ message }: { message: string }) {
  return (
    <p className="flex min-h-52 items-center justify-center text-center text-sm text-muted-foreground">
      {message}
    </p>
  );
}
