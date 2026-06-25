"use client";

import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  currentMonthKey,
  currentYear,
  DEFAULT_OVERVIEW_PERIOD,
  formatOverviewPeriodLabel,
  listAvailableYears,
  normalizeRangeFilter,
  type OverviewPeriodFilter,
  type OverviewPeriodMode,
} from "../_lib/overview-period";
import type { ExpenseLine, IncomeLine } from "../_lib/types";

interface OverviewPeriodFilterProps {
  value: OverviewPeriodFilter;
  onChange: (filter: OverviewPeriodFilter) => void;
  income: IncomeLine[];
  expenses: ExpenseLine[];
}

const MODE_OPTIONS: { value: OverviewPeriodMode; label: string }[] = [
  { value: "year", label: "Year" },
  { value: "single", label: "One month" },
  { value: "range", label: "Month range" },
];

export function OverviewPeriodFilterBar({
  value,
  onChange,
  income,
  expenses,
}: OverviewPeriodFilterProps) {
  const periodLabel = formatOverviewPeriodLabel(value);
  const availableYears = listAvailableYears(income, expenses);

  const setMode = (mode: OverviewPeriodMode) => {
    if (mode === "year") {
      onChange({
        mode: "year",
        year: value.year ?? currentYear(),
      });
      return;
    }
    if (mode === "single") {
      onChange({
        mode: "single",
        month: value.month ?? currentMonthKey(),
      });
      return;
    }
    const month = currentMonthKey();
    const [year, m] = month.split("-").map(Number);
    const fromDate = new Date(year, m - 4, 1);
    const fromMonth = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}`;
    onChange(
      normalizeRangeFilter({
        mode: "range",
        fromMonth: value.fromMonth ?? fromMonth,
        toMonth: value.toMonth ?? month,
      }),
    );
  };

  const isDefaultPeriod =
    value.mode === DEFAULT_OVERVIEW_PERIOD.mode &&
    value.year === DEFAULT_OVERVIEW_PERIOD.year;

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-3 dark:border-zinc-700/60 dark:bg-zinc-900/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
          <div className="space-y-1.5 min-w-[140px]">
            <Label className="text-xs text-slate-500 dark:text-zinc-400">
              Period
            </Label>
            <Select value={value.mode} onValueChange={v => setMode(v as OverviewPeriodMode)}>
              <SelectTrigger className="h-9 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {value.mode === "year" ? (
            <div className="space-y-1.5 min-w-[120px]">
              <Label className="text-xs text-slate-500 dark:text-zinc-400">
                Year
              </Label>
              <Select
                value={String(value.year ?? currentYear())}
                onValueChange={year =>
                  onChange({ mode: "year", year: Number(year) })
                }
              >
                <SelectTrigger className="h-9 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {value.mode === "single" ? (
            <div className="space-y-1.5">
              <Label
                htmlFor="overview-filter-month"
                className="text-xs text-slate-500 dark:text-zinc-400"
              >
                Month
              </Label>
              <Input
                id="overview-filter-month"
                type="month"
                className="h-9 w-[160px] rounded-lg"
                value={value.month ?? currentMonthKey()}
                onChange={e =>
                  onChange({ mode: "single", month: e.target.value })
                }
              />
            </div>
          ) : null}

          {value.mode === "range" ? (
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="overview-filter-from"
                  className="text-xs text-slate-500 dark:text-zinc-400"
                >
                  From
                </Label>
                <Input
                  id="overview-filter-from"
                  type="month"
                  className="h-9 w-[160px] rounded-lg"
                  value={value.fromMonth ?? currentMonthKey()}
                  max={value.toMonth}
                  onChange={e =>
                    onChange(
                      normalizeRangeFilter({
                        mode: "range",
                        fromMonth: e.target.value,
                        toMonth: value.toMonth ?? e.target.value,
                      }),
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="overview-filter-to"
                  className="text-xs text-slate-500 dark:text-zinc-400"
                >
                  To
                </Label>
                <Input
                  id="overview-filter-to"
                  type="month"
                  className="h-9 w-[160px] rounded-lg"
                  value={value.toMonth ?? currentMonthKey()}
                  min={value.fromMonth}
                  onChange={e =>
                    onChange(
                      normalizeRangeFilter({
                        mode: "range",
                        fromMonth: value.fromMonth ?? e.target.value,
                        toMonth: e.target.value,
                      }),
                    )
                  }
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isDefaultPeriod ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onChange(DEFAULT_OVERVIEW_PERIOD)}
            >
              Reset
            </Button>
          ) : null}
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
            <CalendarRange className="h-3.5 w-3.5 opacity-70" />
            {periodLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
