"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartPanelProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartPanel({
  title,
  description,
  action,
  children,
  className,
}: ChartPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white dark:border-zinc-700/80 dark:bg-zinc-900/60",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          {description ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

export function ChartEmpty({ message }: { message: string }) {
  return (
    <p className="text-sm text-slate-500 dark:text-zinc-400 py-12 text-center">
      {message}
    </p>
  );
}
