"use client";

import { useId, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Church, UsersRound } from "lucide-react";
import {
  AGE_BRACKET_LABELS,
  DEFAULT_AGE_BRACKET_FILTER,
  type AgeBracketFilter,
  type AgeBracketKey,
} from "@/lib/person-demographics";
import {
  clampDateRange,
  getCurrentMonthRange,
  MAX_DATE_RANGE_DAYS,
  type DateRangeValue,
  type ServiceCategoryFilter,
} from "../_lib/group-attendance";

type Preset = {
  label: string;
  getRange: () => DateRangeValue;
};

function toDateString(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function subtractDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() - days);
  return next;
}

const PRESETS: Preset[] = [
  {
    label: "1 week",
    getRange: () => ({
      from: toDateString(subtractDays(new Date(), 7)),
      to: toDateString(new Date()),
    }),
  },
  {
    label: "2 weeks",
    getRange: () => ({
      from: toDateString(subtractDays(new Date(), 14)),
      to: toDateString(new Date()),
    }),
  },
  {
    label: "3 weeks",
    getRange: () => ({
      from: toDateString(subtractDays(new Date(), 21)),
      to: toDateString(new Date()),
    }),
  },
  { label: "This month", getRange: () => getCurrentMonthRange() },
  {
    label: "30 days",
    getRange: () => ({
      from: toDateString(subtractDays(new Date(), 30)),
      to: toDateString(new Date()),
    }),
  },
  {
    label: "90 days",
    getRange: () => ({
      from: toDateString(subtractDays(new Date(), 90)),
      to: toDateString(new Date()),
    }),
  },
  {
    label: "6 months",
    getRange: () => {
      const to = new Date();
      const from = new Date();
      from.setMonth(from.getMonth() - 6);
      return clampDateRange({ from: toDateString(from), to: toDateString(to) });
    },
  },
  {
    label: "1 year",
    getRange: () => {
      const to = new Date();
      const from = new Date();
      from.setFullYear(from.getFullYear() - 1);
      return { from: toDateString(from), to: toDateString(to) };
    },
  },
];

interface DashboardFiltersPanelProps {
  dateRange: DateRangeValue;
  onDateRangeChange: (range: DateRangeValue) => void;
  serviceFilter: ServiceCategoryFilter;
  onServiceFilterChange: (filter: ServiceCategoryFilter) => void;
  ageFilter: AgeBracketFilter;
  onAgeFilterChange: (filter: AgeBracketFilter) => void;
}

export function DashboardFiltersPanel({
  dateRange,
  onDateRangeChange,
  serviceFilter,
  onServiceFilterChange,
  ageFilter,
  onAgeFilterChange,
}: DashboardFiltersPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const activePreset = PRESETS.find(preset => {
    const range = preset.getRange();
    return range.from === dateRange.from && range.to === dateRange.to;
  })?.label;

  const handleDateChange = (range: DateRangeValue, changed: "from" | "to") => {
    onDateRangeChange(clampDateRange(range, changed));
  };

  const toggleService = (
    key: keyof ServiceCategoryFilter,
    checked: boolean,
  ) => {
    const next = { ...serviceFilter, [key]: checked };
    if (!next.sunday && !next.lifeGroup) return;
    onServiceFilterChange(next);
  };

  const toggleAge = (key: AgeBracketKey, checked: boolean) => {
    const next = { ...ageFilter, [key]: checked };
    if (!Object.values(next).some(Boolean)) return;
    onAgeFilterChange(next);
  };

  const resetAge = () => onAgeFilterChange({ ...DEFAULT_AGE_BRACKET_FILTER });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="space-y-2 text-sm font-medium">
          Date Range
          <select
            aria-label="Date Range"
            className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
            value={activePreset ?? "custom"}
            onChange={e => {
              const preset = PRESETS.find(p => p.label === e.target.value);
              if (preset) onDateRangeChange(preset.getRange());
              else setExpanded(true);
            }}
          >
            {PRESETS.map(p => (
              <option key={p.label}>{p.label}</option>
            ))}
            <option value="custom">Custom range</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Gathering Type
          <select
            aria-label="Gathering Type"
            className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
            value={
              serviceFilter.sunday && serviceFilter.lifeGroup
                ? "all"
                : serviceFilter.sunday
                  ? "sunday"
                  : "lifeGroup"
            }
            onChange={e =>
              onServiceFilterChange({
                sunday: e.target.value !== "lifeGroup",
                lifeGroup: e.target.value !== "sunday",
              })
            }
          >
            <option value="all">All gatherings</option>
            <option value="sunday">Sunday services</option>
            <option value="lifeGroup">Life groups</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Age Group
          <select
            aria-label="Age Group"
            className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
            value={
              Object.values(ageFilter).every(Boolean)
                ? "all"
                : Object.values(ageFilter).filter(Boolean).length === 1
                  ? Object.keys(ageFilter).find(
                      key => ageFilter[key as AgeBracketKey],
                    )
                  : "custom"
            }
            onChange={e => {
              if (e.target.value === "custom") {
                setExpanded(true);
                return;
              }
              onAgeFilterChange(
                Object.fromEntries(
                  Object.keys(ageFilter).map(key => [
                    key,
                    e.target.value === "all" || key === e.target.value,
                  ]),
                ) as AgeBracketFilter,
              );
            }}
          >
            <option value="all">All age groups</option>
            {(Object.keys(AGE_BRACKET_LABELS) as AgeBracketKey[]).map(key => (
              <option key={key} value={key}>
                {AGE_BRACKET_LABELS[key]}
              </option>
            ))}
            <option value="custom">Multiple age groups</option>
          </select>
        </label>
        <Button
          variant="outline"
          className="min-h-11 gap-2 rounded-xl"
          aria-expanded={expanded}
          aria-controls={`${id}-details`}
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal className="size-4" />
          More Filters
        </Button>
      </div>
      {expanded && (
        <div
          id={`${id}-details`}
          className="grid gap-6 border-t pt-4 lg:grid-cols-2"
        >
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Date range
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map(preset => (
                  <Button
                    key={preset.label}
                    type="button"
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    variant={
                      activePreset === preset.label ? "default" : "outline"
                    }
                    onClick={() => onDateRangeChange(preset.getRange())}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="dashboard-date-from" className="text-xs">
                  From
                </Label>
                <Input
                  id="dashboard-date-from"
                  type="date"
                  className="h-8 text-sm"
                  value={dateRange.from}
                  max={dateRange.to}
                  onChange={e =>
                    handleDateChange(
                      { ...dateRange, from: e.target.value },
                      "from",
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dashboard-date-to" className="text-xs">
                  To
                </Label>
                <Input
                  id="dashboard-date-to"
                  type="date"
                  className="h-8 text-sm"
                  value={dateRange.to}
                  min={dateRange.from}
                  onChange={e =>
                    handleDateChange({ ...dateRange, to: e.target.value }, "to")
                  }
                />
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground">
              Maximum range: {MAX_DATE_RANGE_DAYS} days (1 year)
            </p>
          </div>

          <div className="space-y-4 lg:border-l lg:border-border/50 lg:pl-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Gathering type
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Checkbox
                  checked={serviceFilter.sunday}
                  onCheckedChange={checked =>
                    toggleService("sunday", checked === true)
                  }
                  label={
                    <span className="text-xs flex items-center gap-1.5">
                      <Church className="w-3.5 h-3.5 text-violet-500" />
                      Sunday service
                    </span>
                  }
                />
                <Checkbox
                  checked={serviceFilter.lifeGroup}
                  onCheckedChange={checked =>
                    toggleService("lifeGroup", checked === true)
                  }
                  label={
                    <span className="text-xs flex items-center gap-1.5">
                      <UsersRound className="w-3.5 h-3.5 text-blue-500" />
                      Life groups
                    </span>
                  }
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Age bracket
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  onClick={resetAge}
                >
                  Select all
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {(Object.keys(AGE_BRACKET_LABELS) as AgeBracketKey[]).map(
                  key => (
                    <Checkbox
                      key={key}
                      checked={ageFilter[key]}
                      onCheckedChange={checked =>
                        toggleAge(key, checked === true)
                      }
                      label={
                        <span className="text-xs">
                          {AGE_BRACKET_LABELS[key]}
                        </span>
                      }
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          onDateRangeChange(getCurrentMonthRange());
          onServiceFilterChange({ sunday: true, lifeGroup: true });
          resetAge();
        }}
      >
        Reset filters
      </Button>
    </div>
  );
}
