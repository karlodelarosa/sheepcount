"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  violet: {
    card: "border-violet-200/70 bg-gradient-to-br from-violet-50/90 to-violet-100/20 dark:from-violet-950/40 dark:to-transparent dark:border-violet-800/50",
    icon: "text-violet-600 dark:text-violet-400 bg-violet-100/80 dark:bg-violet-900/40",
    value: "text-violet-900 dark:text-violet-100",
  },
  blue: {
    card: "border-blue-200/70 bg-gradient-to-br from-blue-50/90 to-blue-100/20 dark:from-blue-950/40 dark:to-transparent dark:border-blue-800/50",
    icon: "text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/40",
    value: "text-blue-900 dark:text-blue-100",
  },
  emerald: {
    card: "border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 to-emerald-100/20 dark:from-emerald-950/40 dark:to-transparent dark:border-emerald-800/50",
    icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/40",
    value: "text-emerald-900 dark:text-emerald-100",
  },
  amber: {
    card: "border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-amber-100/20 dark:from-amber-950/40 dark:to-transparent dark:border-amber-800/50",
    icon: "text-amber-600 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/40",
    value: "text-amber-900 dark:text-amber-100",
  },
  rose: {
    card: "border-rose-200/70 bg-gradient-to-br from-rose-50/90 to-rose-100/20 dark:from-rose-950/40 dark:to-transparent dark:border-rose-800/50",
    icon: "text-rose-600 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-900/40",
    value: "text-rose-900 dark:text-rose-100",
  },
  orange: {
    card: "border-orange-200/70 bg-gradient-to-br from-orange-50/90 to-orange-100/20 dark:from-orange-950/40 dark:to-transparent dark:border-orange-800/50",
    icon: "text-orange-600 dark:text-orange-400 bg-orange-100/80 dark:bg-orange-900/40",
    value: "text-orange-900 dark:text-orange-100",
  },
  slate: {
    card: "border-slate-200/70 bg-gradient-to-br from-slate-50/90 to-white dark:from-zinc-900/60 dark:to-zinc-900/30 dark:border-zinc-700/60",
    icon: "text-slate-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-800/80",
    value: "text-slate-900 dark:text-white",
  },
} as const;

export type OverviewStatVariant = keyof typeof variants;

interface OverviewStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  variant?: OverviewStatVariant;
  onClick?: () => void;
  className?: string;
}

export function OverviewStatCard({
  label,
  value,
  hint,
  icon: Icon,
  variant = "slate",
  onClick,
  className,
}: OverviewStatCardProps) {
  const styles = variants[variant];
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 text-left transition-all",
        styles.card,
        onClick &&
          "hover:shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer group",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            {label}
          </p>
          <p
            className={cn(
              "text-2xl font-bold tabular-nums mt-1 leading-none",
              styles.value,
            )}
          >
            {value}
          </p>
          {hint ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 line-clamp-2">
              {hint}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className={cn("rounded-lg p-2", styles.icon)}>
            <Icon className="w-4 h-4" />
          </div>
          {onClick ? (
            <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          ) : null}
        </div>
      </div>
    </Wrapper>
  );
}
