"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function YearSelector({
  selectedYear,
  availableYears,
  hasGoalForYear,
  isAdmin,
  currentYear,
  onYearChange,
  onSetupYear,
}: {
  selectedYear: number;
  availableYears: number[];
  hasGoalForYear: boolean;
  isAdmin: boolean;
  currentYear: number;
  onYearChange: (year: number) => void;
  onSetupYear: () => void;
}) {
  const sortedYears = [...availableYears].sort((a, b) => b - a);
  const currentIndex = sortedYears.indexOf(selectedYear);
  const canGoNewer = currentIndex > 0;
  const canGoOlder =
    currentIndex >= 0 && currentIndex < sortedYears.length - 1;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center rounded-lg border border-border/60 bg-card/80 p-1 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={!canGoOlder}
          onClick={() => onYearChange(sortedYears[currentIndex + 1])}
          aria-label="Previous year"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Select
          value={String(selectedYear)}
          onValueChange={value => onYearChange(Number(value))}
        >
          <SelectTrigger
            className={cn(
              "w-[120px] border-0 shadow-none focus:ring-0 gap-2 font-semibold",
            )}
          >
            <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {sortedYears.map(year => (
              <SelectItem key={year} value={String(year)}>
                {year}
                {year === currentYear ? " (current)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={!canGoNewer}
          onClick={() => onYearChange(sortedYears[currentIndex - 1])}
          aria-label="Next year"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {isAdmin && !hasGoalForYear && (
        <Button className="gap-2 shadow-sm" onClick={onSetupYear}>
          <Plus className="w-4 h-4" />
          Set up {selectedYear}
        </Button>
      )}
    </div>
  );
}
