"use client";

import { Search, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CollectionToolbar({
  label,
  search,
  onSearch,
  filter,
  onFilter,
  options,
  count,
  view,
  onView,
}: {
  label: string;
  search: string;
  onSearch: (value: string) => void;
  filter: string;
  onFilter: (value: string) => void;
  options: { value: string; label: string }[];
  count: number;
  view?: "cards" | "list";
  onView?: (value: "cards" | "list") => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-3 text-sm font-medium">
          Filter
          <select
            aria-label={`Filter ${label}`}
            className="h-11 lg:h-9 max-w-full rounded-xl border bg-card px-3 text-sm"
            value={filter}
            onChange={e => onFilter(e.target.value)}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {onView && (
          <div
            role="group"
            aria-label={`${label} display mode`}
            className="flex rounded-xl bg-muted p-1"
          >
            {(
              [
                { value: "cards", label: "Cards", icon: LayoutGrid },
                { value: "list", label: "List", icon: List },
              ] as const
            ).map(item => (
              <Button
                key={item.value}
                variant="ghost"
                size="sm"
                aria-pressed={view === item.value}
                onClick={() => onView(item.value)}
                className={cn(
                  "gap-2 rounded-lg",
                  view === item.value && "bg-card shadow-sm",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 lg:left-3 top-1/2 size-5 lg:size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label={`Search ${label}`}
          placeholder={`Search ${label}...`}
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="h-12 lg:h-9 rounded-xl bg-card pl-12 lg:pl-9"
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span role="status">
          {count} {count === 1 ? "result" : "results"}
        </span>
        {(search || filter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearch("");
              onFilter("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

export function CollectionLoading() {
  return (
    <div role="status" aria-label="Loading page" className="space-y-6">
      <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map(key => (
          <div key={key} className="h-64 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
