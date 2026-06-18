"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { DateRangeValue } from "../_lib/group-attendance";

type Preset = {
  label: string;
  getRange: (dataBounds: DateRangeValue | null) => DateRangeValue;
};

function toDateString(date: Date) {
  return date.toISOString().split("T")[0];
}

function subtractDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() - days);
  return next;
}

const PRESETS: Preset[] = [
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
      return { from: toDateString(from), to: toDateString(to) };
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
  {
    label: "All time",
    getRange: (dataBounds) =>
      dataBounds ?? {
        from: toDateString(subtractDays(new Date(), 90)),
        to: toDateString(new Date()),
      },
  },
];

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  dataBounds: DateRangeValue | null;
}

export function DateRangeFilter({
  value,
  onChange,
  dataBounds,
}: DateRangeFilterProps) {
  const activePreset = PRESETS.find(
    (preset) => {
      const range = preset.getRange(dataBounds);
      return range.from === value.from && range.to === value.to;
    },
  )?.label;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => {
          const isActive = activePreset === preset.label;

          return (
            <Button
              key={preset.label}
              type="button"
              size="sm"
              className="h-7 text-xs px-2.5"
              variant={isActive ? "default" : "outline"}
              onClick={() => onChange(preset.getRange(dataBounds))}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 max-w-sm">
        <div className="space-y-1">
          <Label htmlFor="date-from" className="text-xs">
            From
          </Label>
          <Input
            id="date-from"
            type="date"
            className="h-8 text-sm"
            value={value.from}
            max={value.to}
            onChange={(e) =>
              onChange({ ...value, from: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="date-to" className="text-xs">
            To
          </Label>
          <Input
            id="date-to"
            type="date"
            className="h-8 text-sm"
            value={value.to}
            min={value.from}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
