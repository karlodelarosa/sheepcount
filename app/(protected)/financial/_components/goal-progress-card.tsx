"use client";

import { useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Target,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatCurrency, type SupportedCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { GoalProgress } from "../_lib/goal-analysis";
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

function formatScenarioIncrease(
  scenario: GoalProgress["scenarios"][number],
  currency: SupportedCurrency,
): string {
  if (scenario.additionalMonthlyReceipts <= 0) {
    return "On pace — no extra receipts needed";
  }

  const amount = formatCurrency(scenario.additionalMonthlyReceipts, currency);
  if (scenario.receiptIncreasePercent !== null) {
    return `+${amount}/mo (+${scenario.receiptIncreasePercent}% receipts)`;
  }
  return `+${amount}/mo more receipts`;
}

function GoalAnalysisDetails({
  goalProgress,
  currency,
}: {
  goalProgress: GoalProgress;
  currency: SupportedCurrency;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-violet-200/60 dark:border-violet-800/40 space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
          Current averages (last 3 months)
        </p>
        <div className="grid gap-2 sm:grid-cols-3 text-sm">
          <div className="rounded-lg bg-white/60 dark:bg-zinc-900/40 px-3 py-2">
            <p className="text-slate-500 dark:text-zinc-400 text-xs">Receipts</p>
            <p className="font-semibold tabular-nums">
              {formatCurrency(goalProgress.avgMonthlyIncome, currency)}/mo
            </p>
          </div>
          <div className="rounded-lg bg-white/60 dark:bg-zinc-900/40 px-3 py-2">
            <p className="text-slate-500 dark:text-zinc-400 text-xs">Expenses</p>
            <p className="font-semibold tabular-nums">
              {formatCurrency(goalProgress.avgMonthlyExpenses, currency)}/mo
            </p>
          </div>
          <div className="rounded-lg bg-white/60 dark:bg-zinc-900/40 px-3 py-2">
            <p className="text-slate-500 dark:text-zinc-400 text-xs">Net savings</p>
            <p className="font-semibold tabular-nums">
              {formatCurrency(goalProgress.avgMonthlyNet, currency)}/mo
            </p>
          </div>
        </div>
      </div>

      {goalProgress.targetDate && goalProgress.requiredMonthlyNet !== null && (
        <div className="rounded-lg bg-white/70 dark:bg-zinc-900/50 px-3 py-3 space-y-1">
          <div className="flex items-start gap-2">
            {goalProgress.onTrack ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {goalProgress.onTrack
                  ? "On track for your target date"
                  : "Behind pace for your target date"}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Need {formatCurrency(goalProgress.requiredMonthlyNet, currency)}
                /mo net savings
                {goalProgress.daysUntilTarget !== null &&
                  goalProgress.daysUntilTarget > 0 &&
                  ` over the next ${goalProgress.daysUntilTarget} days`}
                {goalProgress.additionalMonthlyReceipts !== null &&
                  goalProgress.additionalMonthlyReceipts > 0 && (
                    <>
                      {" "}
                      — about{" "}
                      {formatCurrency(
                        goalProgress.additionalMonthlyReceipts,
                        currency,
                      )}
                      /mo more in receipts
                      {goalProgress.receiptIncreasePercent !== null &&
                        ` (+${goalProgress.receiptIncreasePercent}%)`}
                    </>
                  )}
              </p>
            </div>
          </div>
        </div>
      )}

      {goalProgress.scenarios.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
            Receipt increase needed by timeline
          </p>
          <div className="space-y-2">
            {goalProgress.scenarios.map(scenario => (
              <div
                key={`${scenario.label}-${scenario.months}`}
                className="flex items-center justify-between gap-3 rounded-lg bg-white/60 dark:bg-zinc-900/40 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-800 dark:text-zinc-200">
                  {scenario.label}
                </span>
                <span className="text-xs text-slate-600 dark:text-zinc-400 text-right tabular-nums">
                  {formatScenarioIncrease(scenario, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {goalProgress.projectedReachDate && goalProgress.remaining > 0 && (
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          At current net pace, projected to reach the goal around{" "}
          {new Date(goalProgress.projectedReachDate).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          .
        </p>
      )}
    </div>
  );
}

export function GoalProgressCard({ overview, currency }: GoalProgressCardProps) {
  const { goalProgress, trendDirection, trendPercent } = overview;
  const [open, setOpen] = useState(true);

  if (!goalProgress.isConfigured) {
    return (
      <div className="rounded-xl border border-dashed border-violet-200/80 bg-violet-50/40 p-4 dark:border-violet-800/50 dark:bg-violet-950/20">
        <div className="flex items-start gap-3">
          <div className="rounded-lg p-2 bg-violet-100/80 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              No savings goal set
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Go to the Manage tab to set a savings target and projected date.
              Analysis will show how much extra receipts you need each month.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <div className="rounded-xl border border-violet-200/70 bg-gradient-to-br from-violet-50/90 to-violet-100/20 dark:from-violet-950/40 dark:to-transparent dark:border-violet-800/50">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full p-4 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
          >
            <div className="flex items-start justify-between gap-3">
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
                    {goalProgress.targetDate && (
                      <>
                        {" "}
                        · Target{" "}
                        {new Date(goalProgress.targetDate).toLocaleDateString(
                          "en-PH",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
                <TrendBadge direction={trendDirection} percent={trendPercent} />
                {!open && (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                    {goalProgress.percent.toFixed(1)}% complete
                  </p>
                )}
              </div>
            </div>
            {!open && (
              <div className="mt-3 space-y-1.5">
                <Progress value={goalProgress.percent} className="h-1.5" />
              </div>
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 pb-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-end gap-1 -mt-1 mb-3 sm:pr-1">
            {goalProgress.monthsAtCurrentPace !== null ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 sm:text-right">
                ~{goalProgress.monthsAtCurrentPace} months at current pace
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-zinc-400 sm:text-right">
                Increase net receipts to project a timeline
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Progress value={goalProgress.percent} className="h-2.5" />
            <div className="flex justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>{goalProgress.percent.toFixed(1)}% of goal</span>
              <span>{formatCurrency(goalProgress.target, currency)} target</span>
            </div>
          </div>

          <GoalAnalysisDetails goalProgress={goalProgress} currency={currency} />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
