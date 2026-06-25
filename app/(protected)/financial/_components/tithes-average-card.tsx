"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { formatCurrency, type SupportedCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { IncomeLine } from "../_lib/types";
import {
  computeTithesAverage,
  formatTithesAverageHint,
  type TithesAverageMode,
} from "../_lib/tithes-average";
import type { OverviewPeriodFilter } from "../_lib/overview-period";

interface TithesAverageCardProps {
  income: IncomeLine[];
  period: OverviewPeriodFilter;
  periodLabel: string;
  currency: SupportedCurrency;
}

export function TithesAverageCard({
  income,
  period,
  periodLabel,
  currency,
}: TithesAverageCardProps) {
  const [mode, setMode] = useState<TithesAverageMode>("week");

  const stats = useMemo(
    () => computeTithesAverage(income, period, mode),
    [income, period, mode],
  );

  const hint = formatTithesAverageHint(stats, periodLabel);

  return (
    <div className="rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-50/90 to-blue-100/20 p-4 dark:from-blue-950/40 dark:to-transparent dark:border-blue-800/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Avg Tithes
            </p>
            <div className="inline-flex rounded-lg border border-blue-200/80 bg-white/70 p-0.5 dark:border-blue-800/60 dark:bg-zinc-900/50">
              <button
                type="button"
                onClick={() => setMode("week")}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                  mode === "week"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white",
                )}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setMode("month")}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                  mode === "month"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white",
                )}
              >
                Month
              </button>
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums mt-1 leading-none text-blue-900 dark:text-blue-100">
            {formatCurrency(stats.average, currency)}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 line-clamp-2">
            {hint}
          </p>
        </div>
        <div className="rounded-lg p-2 shrink-0 text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/40">
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
