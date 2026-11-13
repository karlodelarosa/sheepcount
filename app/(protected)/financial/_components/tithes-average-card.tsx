"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { formatCurrency, type SupportedCurrency } from "@/lib/currency";
import { FinancialStatCard } from "./financial-stat-card";
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
    <FinancialStatCard
      label="Average Tithes"
      value={formatCurrency(stats.average, currency)}
      hint={hint}
      icon={TrendingUp}
      tone="giving"
      action={
        <div
          className="flex gap-4"
          role="group"
          aria-label="Tithes averaging period"
        >
          {(["week", "month"] as const).map(option => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
              className="relative min-h-10 px-1 text-xs font-medium capitalize text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-transparent aria-pressed:text-[var(--accent-color-strong)] aria-pressed:after:bg-[var(--accent-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] dark:aria-pressed:text-[var(--accent-color)]"
            >
              {option}
            </button>
          ))}
        </div>
      }
    />
  );
}
