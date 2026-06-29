"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";
import type { FundraisingCampaign } from "@/lib/supabase/goal-projects";
import { formatCurrency, parseCurrency } from "@/lib/currency";
import {
  campaignThemes,
  categoryAccent,
} from "../_lib/campaign-themes";
import { CampaignProgressRing } from "./campaign-progress-ring";

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
  const goalAmount = campaign.goalAmount;
  const progress =
    goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;
  const remaining = Math.max(goalAmount - raisedAmount, 0);
  const targetDateLabel = campaign.targetDate
    ? new Date(campaign.targetDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No target date";

  const accent = categoryAccent[campaign.category] ?? "blue";
  const theme = campaignThemes[accent];
  const resolvedCurrency = parseCurrency(currency);
  const isCompleted = campaign.status === "completed";

  return (
    <article
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl border border-border/40 bg-card shadow-md transition-all duration-500",
        "hover:-translate-y-1 hover:shadow-2xl",
        "shadow-slate-200/60 dark:shadow-none",
        theme.glow,
        isCompleted && "ring-1 ring-emerald-500/30",
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br px-5 pb-5 pt-5 text-white",
          theme.gradient,
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full blur-3xl",
            theme.orb,
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute -bottom-10 -right-6 h-28 w-28 rounded-full blur-2xl opacity-70",
            theme.orb,
          )}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  theme.badge,
                )}
              >
                {campaign.category}
              </span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-50 backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  Complete
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold leading-snug tracking-tight line-clamp-2">
              {campaign.title.trim() || "Untitled campaign"}
            </h3>
            {campaign.description.trim() && (
              <p className="text-sm text-white/75 line-clamp-2 leading-relaxed">
                {campaign.description}
              </p>
            )}
          </div>

          <CampaignProgressRing
            value={progress}
            progressClass={theme.ring}
            trackClass={theme.ringTrack}
          />
        </div>
      </div>

      <div className="relative space-y-4 px-5 py-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Raised
            </p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
              {formatCurrency(raisedAmount, resolvedCurrency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Goal
            </p>
            <p className="text-sm font-semibold tabular-nums text-muted-foreground">
              {formatCurrency(goalAmount, resolvedCurrency)}
            </p>
          </div>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-muted/80">
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
              accent === "blue" && "from-blue-500 to-indigo-500",
              accent === "emerald" && "from-emerald-500 to-teal-500",
              accent === "purple" && "from-violet-500 to-fuchsia-500",
              accent === "orange" && "from-amber-500 to-orange-500",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 min-w-0">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{targetDateLabel}</span>
          </div>
          <span className="shrink-0 tabular-nums">
            {formatCurrency(remaining, resolvedCurrency)} left
          </span>
        </div>

        <div className="flex items-center justify-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            View campaign
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
