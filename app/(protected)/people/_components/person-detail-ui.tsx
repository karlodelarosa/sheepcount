"use client";

import type { ReactNode } from "react";
import { accentSurfaceVariants } from "@/components/ui/accent-surface";
import { cn } from "@/lib/utils";

export const panelCard =
  "rounded-xl border border-border/70 bg-card shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)]";

export function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
  iconClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  iconClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={cn(
            "shrink-0 rounded-xl border border-[var(--accent-color-border)] bg-[var(--accent-color-soft)] p-2.5",
            iconClassName,
          )}
        >
          <Icon className="size-4 text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function DetailRow({
  icon: Icon,
  label,
  children,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "grid min-h-11 w-full grid-cols-[1.25rem_minmax(7rem,0.8fr)_minmax(0,1.2fr)] items-center gap-2 border-b border-border/60 px-1 py-2.5 text-left text-sm last:border-b-0",
        onClick &&
          "rounded-lg outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] motion-reduce:transition-none",
      )}
    >
      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words font-medium text-foreground">
        {children}
      </span>
    </Wrapper>
  );
}

export function InfoTile({
  icon: Icon,
  label,
  children,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 text-left dark:border-zinc-700/70 dark:bg-zinc-800/40",
        onClick &&
          "hover:bg-slate-100/80 hover:border-slate-300/80 dark:hover:bg-zinc-800/70 transition-colors w-full",
      )}
    >
      <div className="shrink-0 rounded-lg bg-white border border-slate-200/80 p-2 dark:bg-zinc-900 dark:border-zinc-600/80">
        <Icon className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-500">
          {label}
        </p>
        <div className="text-sm font-medium text-slate-900 dark:text-white mt-0.5 break-words">
          {children}
        </div>
      </div>
    </Wrapper>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 dark:border-zinc-700/70 dark:bg-zinc-800/40">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-500">
        {label}
      </p>
      <p className="text-xl font-semibold tabular-nums text-slate-900 dark:text-white mt-0.5">
        {value}
      </p>
      {hint && (
        <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
          {hint}
        </p>
      )}
    </div>
  );
}

export type PersonAchievementKind = "discipleship" | "training" | "both" | null;

export function PersonAvatar({
  name,
  size = "md",
  achievement = null,
}: {
  name: string;
  size?: "sm" | "md" | "profile" | "lg";
  achievement?: PersonAchievementKind;
}) {
  const sizes = {
    sm: "w-8 h-8 rounded-lg text-sm",
    md: "w-10 h-10 rounded-xl text-sm",
    profile: "w-12 h-12 rounded-xl text-lg",
    lg: "w-20 h-20 rounded-2xl text-3xl",
  };

  const ringStyles: Record<NonNullable<PersonAchievementKind>, string> = {
    discipleship:
      "ring-2 ring-amber-400 ring-offset-2 ring-offset-white shadow-[0_0_10px_rgba(251,191,36,0.35)] dark:ring-amber-500 dark:ring-offset-zinc-900",
    training:
      "ring-2 ring-emerald-400 ring-offset-2 ring-offset-white shadow-[0_0_10px_rgba(52,211,153,0.35)] dark:ring-emerald-500 dark:ring-offset-zinc-900",
    both: "ring-2 ring-amber-400 ring-offset-2 ring-offset-white shadow-[0_0_14px_rgba(251,191,36,0.45)] dark:ring-amber-500 dark:ring-offset-zinc-900",
  };

  const achievementTitle =
    achievement === "both"
      ? "Completed discipleship and training"
      : achievement === "discipleship"
        ? "Completed discipleship track"
        : achievement === "training"
          ? "Completed training course"
          : undefined;

  return (
    <div className="relative shrink-0" title={achievementTitle}>
      <div
        className={cn(
          accentSurfaceVariants({ tone: "solid" }),
          "flex items-center justify-center font-semibold",
          sizes[size],
          achievement && ringStyles[achievement],
        )}
      >
        {name.charAt(0)}
      </div>
      {achievement && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 text-[9px] leading-none",
            size === "lg" ? "w-5 h-5" : "w-4 h-4",
            achievement === "training"
              ? "bg-emerald-500 text-white"
              : "bg-amber-500 text-white",
          )}
          aria-hidden
        >
          ★
        </span>
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-8 px-4 rounded-xl border border-dashed border-slate-300/80 bg-slate-50/30 dark:border-zinc-600/80 dark:bg-zinc-800/20">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
      </div>
      <p className="font-medium text-slate-700 dark:text-zinc-300">{title}</p>
      {description && (
        <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1 max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
