"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function parseBirthdate(iso?: string) {
  if (!iso) return { month: "", day: "", year: "" };
  const [year, month, day] = iso.split("-");
  return {
    month: month ? String(parseInt(month, 10)) : "",
    day: day ? String(parseInt(day, 10)) : "",
    year: year ?? "",
  };
}

function toIsoDate(month: string, day: string, year: string) {
  if (!month || !day || year.length !== 4) return "";
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return "";
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return "";
  }
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function daysInMonth(month: string, year: string) {
  const m = parseInt(month, 10);
  if (!m) return 31;
  const y = year.length === 4 ? parseInt(year, 10) : 2000;
  return new Date(y, m, 0).getDate();
}

export interface BirthdateFieldProps {
  name?: string;
  id?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
  selectClassName?: string;
}

export function BirthdateField({
  name = "birthdate",
  id,
  label = "Birthdate",
  value,
  defaultValue,
  onChange,
  required = false,
  disabled = false,
  className,
  showLabel = true,
  selectClassName = "rounded-xl",
}: BirthdateFieldProps) {
  const baseId = useId();
  const fieldId = id ?? baseId;

  const isControlled = value !== undefined;
  const initial = parseBirthdate(value ?? defaultValue);

  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const [year, setYear] = useState(initial.year);

  useEffect(() => {
    if (!isControlled) return;
    const parsed = parseBirthdate(value);
    setMonth(parsed.month);
    setDay(parsed.day);
    setYear(parsed.year);
  }, [isControlled, value]);

  const maxDays = useMemo(() => daysInMonth(month, year), [month, year]);

  const dayOptions = useMemo(
    () => Array.from({ length: maxDays }, (_, i) => String(i + 1)),
    [maxDays],
  );

  const isoValue = toIsoDate(month, day, year);

  useEffect(() => {
    if (day && parseInt(day, 10) > maxDays) {
      setDay(String(maxDays));
    }
  }, [day, maxDays]);

  const emitChange = (m: string, d: string, y: string) => {
    onChange?.(toIsoDate(m, d, y));
  };

  const handleMonthChange = (next: string) => {
    const nextDay =
      day && parseInt(day, 10) > daysInMonth(next, year)
        ? String(daysInMonth(next, year))
        : day;
    setMonth(next);
    if (nextDay !== day) setDay(nextDay);
    emitChange(next, nextDay, year);
  };

  const handleDayChange = (next: string) => {
    setDay(next);
    emitChange(month, next, year);
  };

  const handleYearChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    let nextDay = day;
    if (day && month && digits.length === 4) {
      const max = daysInMonth(month, digits);
      if (parseInt(day, 10) > max) nextDay = String(max);
    }
    setYear(digits);
    if (nextDay !== day) setDay(nextDay);
    emitChange(month, nextDay, digits);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      {showLabel && (
        <Label htmlFor={`${fieldId}-month`}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="grid gap-1.5">
          <Label
            htmlFor={`${fieldId}-month`}
            className="text-xs text-muted-foreground"
          >
            Month
          </Label>
          <Select
            value={month}
            onValueChange={handleMonthChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${fieldId}-month`}
              className={selectClassName}
              aria-label="Birth month"
            >
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="max-h-60" position="popper">
              {MONTHS.map(m => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label
            htmlFor={`${fieldId}-day`}
            className="text-xs text-muted-foreground"
          >
            Day
          </Label>
          <Select
            value={day}
            onValueChange={handleDayChange}
            disabled={disabled || !month}
          >
            <SelectTrigger
              id={`${fieldId}-day`}
              className={selectClassName}
              aria-label="Birth day"
            >
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent className="max-h-60" position="popper">
              {dayOptions.map(d => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label
            htmlFor={`${fieldId}-year`}
            className="text-xs text-muted-foreground"
          >
            Year
          </Label>
          <Input
            id={`${fieldId}-year`}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="YYYY"
            value={year}
            onChange={e => handleYearChange(e.target.value)}
            disabled={disabled}
            maxLength={4}
            className={selectClassName}
            aria-label="Birth year"
          />
        </div>
      </div>

      <input
        type="hidden"
        name={name}
        value={isoValue}
        required={required}
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}
