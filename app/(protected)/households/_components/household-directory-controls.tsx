import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  HouseholdDirectoryFilter,
  HouseholdDirectorySummary,
} from "../_lib/directory";

type HouseholdDirectoryControlsProps = {
  search: string;
  activeFilter: HouseholdDirectoryFilter;
  summary: HouseholdDirectorySummary;
  missingAddressCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: HouseholdDirectoryFilter) => void;
};

export function HouseholdDirectoryControls({
  search,
  activeFilter,
  summary,
  missingAddressCount,
  onSearchChange,
  onFilterChange,
}: HouseholdDirectoryControlsProps) {
  const filters: Array<{
    value: HouseholdDirectoryFilter;
    label: string;
    count: number;
  }> = [
    { value: "all", label: "All", count: summary.totalHouseholds },
    {
      value: "with-members",
      label: "With members",
      count: summary.totalHouseholds - summary.emptyHouseholds,
    },
    {
      value: "empty",
      label: "Empty",
      count: summary.emptyHouseholds,
    },
    {
      value: "missing-address",
      label: "Missing address",
      count: missingAddressCount,
    },
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-border/80 bg-background px-3 shadow-sm focus-within:ring-2 focus-within:ring-[var(--accent-color)]">
        <Search
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          aria-label="Search households"
          placeholder="Search households, addresses, or members..."
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          className="h-10 border-0 bg-transparent px-0 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="overflow-x-auto pb-1 lg:pb-0">
        <div
          role="group"
          aria-label="Filter households"
          className="flex min-w-max items-center gap-2"
        >
          {filters.map(filter => {
            const selected = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={selected}
                onClick={() => onFilterChange(filter.value)}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] motion-reduce:transition-none",
                  selected
                    ? "border-transparent bg-[var(--accent-color)] text-[var(--accent-color-foreground)] shadow-sm"
                    : "border-border/80 bg-background text-foreground hover:bg-muted/70",
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    "flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                    selected
                      ? "bg-background/20 text-[var(--accent-color-foreground)]"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
