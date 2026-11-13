"use client";

import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DashboardMetricCardProps {
  label: string;
  value: string | number;
  icon?: ElementType;
  hint?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Shared summary-card treatment for dashboards; semantic colors belong in trends. */
export function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  hint,
  action,
  children,
  onClick,
  className,
}: DashboardMetricCardProps) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "min-w-0 rounded-2xl border border-border/70 bg-card p-4 lg:p-3 text-left text-foreground shadow-sm",
        onClick &&
          "transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex size-11 lg:size-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
            <Icon className="size-5 lg:size-4" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="break-words text-2xl lg:text-xl font-bold leading-tight tracking-tight tabular-nums">
            {value}
          </p>
          <p className="mt-0.5 break-words text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <div className="mt-1 min-h-4 text-xs text-muted-foreground">
            {hint ?? "—"}
          </div>
        </div>
        {action}
      </div>
      {children}
    </Wrapper>
  );
}
