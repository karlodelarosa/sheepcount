import type { IncomeLine } from "./types";
import {
  enumerateMonthKeys,
  filterLinesByOverviewPeriod,
  type OverviewPeriodFilter,
} from "./overview-period";

export type TithesAverageMode = "week" | "month";

export type TithesAverageStats = {
  average: number;
  total: number;
  divisor: number;
  entryCount: number;
  mode: TithesAverageMode;
};

function getPeriodBounds(filter: OverviewPeriodFilter): {
  start: Date;
  end: Date;
} {
  if (filter.mode === "year" && filter.year) {
    return {
      start: new Date(filter.year, 0, 1),
      end: new Date(filter.year, 11, 31),
    };
  }

  if (filter.mode === "single" && filter.month) {
    const [year, month] = filter.month.split("-").map(Number);
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0),
    };
  }

  if (filter.mode === "range" && filter.fromMonth && filter.toMonth) {
    const [fromYear, fromMonth] = filter.fromMonth.split("-").map(Number);
    const [toYear, toMonth] = filter.toMonth.split("-").map(Number);
    return {
      start: new Date(fromYear, fromMonth - 1, 1),
      end: new Date(toYear, toMonth, 0),
    };
  }

  const year = new Date().getFullYear();
  return {
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31),
  };
}

function getPeriodMonthCount(filter: OverviewPeriodFilter): number {
  if (filter.mode === "year" && filter.year) {
    return 12;
  }
  if (filter.mode === "single" && filter.month) {
    return 1;
  }
  if (filter.mode === "range" && filter.fromMonth && filter.toMonth) {
    return enumerateMonthKeys(filter.fromMonth, filter.toMonth).length;
  }
  return 12;
}

function getPeriodWeekCount(filter: OverviewPeriodFilter): number {
  const { start, end } = getPeriodBounds(filter);
  const days =
    Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.max(1, days / 7);
}

export function computeTithesAverage(
  income: IncomeLine[],
  period: OverviewPeriodFilter,
  mode: TithesAverageMode,
): TithesAverageStats {
  const titheLines = filterLinesByOverviewPeriod(
    income.filter(line => line.type === "Tithes"),
    period,
  );
  const total = titheLines.reduce((sum, line) => sum + line.amount, 0);
  const divisor =
    mode === "month"
      ? getPeriodMonthCount(period)
      : getPeriodWeekCount(period);

  return {
    average: divisor > 0 ? total / divisor : 0,
    total,
    divisor,
    entryCount: titheLines.length,
    mode,
  };
}

export function formatTithesAverageHint(
  stats: TithesAverageStats,
  periodLabel: string,
): string {
  const unit = stats.mode === "month" ? "month" : "week";
  const unitPlural = stats.divisor === 1 ? unit : `${unit}s`;

  if (stats.entryCount === 0) {
    return `No tithe entries for ${periodLabel}`;
  }

  return `${stats.entryCount} entr${stats.entryCount === 1 ? "y" : "ies"} · avg over ${stats.divisor.toFixed(stats.mode === "week" ? 1 : 0)} ${unitPlural}`;
}
