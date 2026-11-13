"use client";

import { ArrowUpRight, CalendarDays, CheckCircle2, Target } from "lucide-react";
import type { FundraisingCampaign } from "@/lib/supabase/goal-projects";
import { formatCurrency, parseCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function CampaignCard({
  campaign,
  raisedAmount,
  currency,
  onClick,
}: {
  campaign: FundraisingCampaign;
  raisedAmount: number;
  currency: string;
  onClick: () => void;
}) {
  const goal = campaign.goalAmount;
  const progress = goal > 0 ? Math.min((raisedAmount / goal) * 100, 100) : 0;
  const completed = campaign.status === "completed";
  const resolvedCurrency = parseCurrency(currency);
  const target = campaign.targetDate
    ? new Date(
        `${campaign.targetDate.slice(0, 10)}T00:00:00`,
      ).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No target date";
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4 border-b border-border/60 p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--accent-color-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
              {campaign.category}
            </span>
            {completed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                Completed
              </span>
            )}
          </div>
          <h3 className="mt-3 text-xl font-bold tracking-tight">
            <button
              onClick={onClick}
              className="rounded-sm text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
            >
              {campaign.title.trim() || "Untitled campaign"}
            </button>
          </h3>
          {campaign.description.trim() && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {campaign.description}
            </p>
          )}
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
          <Target aria-hidden="true" className="size-5" />
        </span>
      </div>
      <div className="mt-auto space-y-4 p-5">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-muted-foreground">Raised</dt>
            <dd className="mt-1 break-words text-2xl font-bold tracking-tight tabular-nums">
              {formatCurrency(raisedAmount, resolvedCurrency)}
            </dd>
          </div>
          <div className="text-right">
            <dt className="text-xs text-muted-foreground">Goal</dt>
            <dd className="mt-1 break-words font-semibold tabular-nums">
              {formatCurrency(goal, resolvedCurrency)}
            </dd>
          </div>
        </dl>
        <div>
          <div className="mb-2 flex justify-between gap-3 text-xs text-muted-foreground">
            <span>
              {formatCurrency(
                Math.max(goal - raisedAmount, 0),
                resolvedCurrency,
              )}{" "}
              remaining
            </span>
            <span className="font-semibold tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={`${campaign.title} funding progress`}
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full rounded-full",
                completed ? "bg-emerald-500" : "bg-[var(--accent-color)]",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays aria-hidden="true" className="size-4" />
            {target}
          </span>
          <button
            onClick={onClick}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-[var(--accent-color-strong)] hover:bg-[var(--accent-color-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] dark:text-[var(--accent-color)]"
          >
            View campaign
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
