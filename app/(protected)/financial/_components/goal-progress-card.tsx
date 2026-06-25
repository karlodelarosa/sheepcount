"use client";

import { TrendingDown, TrendingUp, Minus, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, type SupportedCurrency } from "@/lib/currency";
import type { FinancialOverview } from "../_lib/financial-overview";

interface GoalProgressCardProps {
  overview: FinancialOverview;
  currency: SupportedCurrency;
}

function TrendBadge({
  direction,
  percent,
}: {
  direction: FinancialOverview["trendDirection"];
  percent: number;
}) {
  if (direction === "up") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="w-3.5 h-3.5" />
        Up {percent}%
      </span>
    );
  }
  if (direction === "down") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
        <TrendingDown className="w-3.5 h-3.5" />
        Down {percent}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
      <Minus className="w-3.5 h-3.5" />
      Stable
    </span>
  );
}

export function GoalProgressCard({ overview, currency }: GoalProgressCardProps) {
  const { goalProgress, trendDirection, trendPercent } = overview;

  return (
    <div className="rounded-xl border border-violet-200/70 bg-gradient-to-br from-violet-50/90 to-violet-100/20 p-4 dark:from-violet-950/40 dark:to-transparent dark:border-violet-800/50">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-lg p-2 bg-violet-100/80 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Savings Goal
            </p>
            <p className="text-lg font-bold text-violet-900 dark:text-violet-100 mt-0.5">
              {formatCurrency(goalProgress.current, currency)}{" "}
              <span className="text-sm font-normal text-slate-500 dark:text-zinc-400">
                of {formatCurrency(goalProgress.target, currency)}
              </span>
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              {formatCurrency(goalProgress.remaining, currency)} remaining
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
          <TrendBadge direction={trendDirection} percent={trendPercent} />
          {goalProgress.monthsAtCurrentPace !== null ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              ~{goalProgress.monthsAtCurrentPace} months at current pace
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Increase net receipts to project a timeline
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Progress value={goalProgress.percent} className="h-2.5" />
        <div className="flex justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span>{goalProgress.percent.toFixed(1)}% of goal</span>
          <span>{formatCurrency(goalProgress.target, currency)} target</span>
        </div>
      </div>
    </div>
  );
}
