"use client";

import { useId, useState, type ReactNode } from "react";
import {
  Calendar,
  ClipboardList,
  FileText,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  LifeEventDateFilters,
  LifeEventQuickFilter,
} from "@/lib/life-event-registry";

const accent =
  "bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]";

type RegistryProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  recordLabel: string;
  hydrated: boolean;
  isSaving: boolean;
  onRecord: () => void;
  filters: LifeEventDateFilters;
  onFiltersChange: (filters: LifeEventDateFilters) => void;
  quick: LifeEventQuickFilter;
  onQuickChange: (quick: LifeEventQuickFilter) => void;
  counts: Record<LifeEventQuickFilter, number>;
  resultCount: number;
  searchPlaceholder: string;
  dateHelp: string;
  children: (view: "cards" | "table") => ReactNode;
};
export function LifeEventRegistryLayout({
  title,
  description,
  icon: Icon,
  recordLabel,
  hydrated,
  isSaving,
  onRecord,
  filters,
  onFiltersChange,
  quick,
  onQuickChange,
  counts,
  resultCount,
  searchPlaceholder,
  dateHelp,
  children,
}: RegistryProps) {
  const id = useId();
  const [view, setView] = useState<"cards" | "table">("cards");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const active = Boolean(
    filters.search.trim() ||
      filters.dateFrom ||
      filters.dateTo ||
      quick !== "all",
  );
  const invalidRange = Boolean(
    filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo,
  );
  function reset() {
    onFiltersChange({ search: "", dateFrom: "", dateTo: "" });
    onQuickChange("all");
  }
  return (
    <div className="space-y-6">
      <DirectoryTitleCard
        title={title}
        description={description}
        icon={Icon}
        action={{
          label: recordLabel,
          icon: Plus,
          onClick: onRecord,
          disabled: !hydrated || isSaving,
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label={`Filter ${title.toLowerCase()}`}
          className="flex flex-wrap gap-2"
        >
          {(
            [
              { key: "all", label: "All Records", icon: Icon },
              { key: "year", label: "This Year", icon: Calendar },
              { key: "missing", label: "Details Missing", icon: ClipboardList },
            ] as const
          ).map(({ key, label, icon: FilterIcon }) => (
            <Button
              key={key}
              variant="outline"
              aria-pressed={quick === key}
              onClick={() => onQuickChange(key)}
              className={cn(
                "min-h-11 gap-2 rounded-xl px-4",
                quick === key && accent,
              )}
            >
              <FilterIcon className="size-4" />
              {label}
              <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs text-foreground">
                {hydrated ? counts[key] : "—"}
              </span>
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            aria-expanded={filtersOpen}
            aria-controls={`${id}-filters`}
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="min-h-11 gap-2 rounded-xl"
          >
            <SlidersHorizontal className="size-4" />
            Filters{filters.dateFrom || filters.dateTo ? " (1)" : ""}
          </Button>
          <div
            role="group"
            aria-label="Display mode"
            className="flex rounded-xl bg-[var(--accent-color-soft)] p-1"
          >
            {(
              [
                { key: "cards", label: "Cards", icon: LayoutGrid },
                { key: "table", label: "Table", icon: List },
              ] as const
            ).map(({ key, label, icon: ViewIcon }) => (
              <Button
                key={key}
                size="sm"
                variant="ghost"
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={cn(
                  "gap-2 rounded-lg",
                  view === key && "bg-card text-foreground shadow-sm",
                )}
              >
                <ViewIcon className="size-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {filtersOpen && (
        <div
          id={`${id}-filters`}
          className="space-y-3 rounded-xl border bg-card p-4"
        >
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full space-y-2 sm:w-48">
              <Label htmlFor={`${id}-from`}>From date</Label>
              <Input
                id={`${id}-from`}
                type="date"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onChange={e =>
                  onFiltersChange({ ...filters, dateFrom: e.target.value })
                }
              />
            </div>
            <div className="w-full space-y-2 sm:w-48">
              <Label htmlFor={`${id}-to`}>To date</Label>
              <Input
                id={`${id}-to`}
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={e =>
                  onFiltersChange({ ...filters, dateTo: e.target.value })
                }
              />
            </div>
            <Button variant="ghost" onClick={reset}>
              Reset filters
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {dateHelp} Missing details means the location or officiant has not
            been recorded.
          </p>
          {invalidRange && (
            <p role="alert" className="text-sm text-destructive">
              From date must be on or before To date.
            </p>
          )}
        </div>
      )}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label={`Search ${title.toLowerCase()}`}
          value={filters.search}
          onChange={e =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          placeholder={searchPlaceholder}
          className="h-12 rounded-xl bg-muted/40 pl-12"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span role="status">
          {hydrated
            ? `${resultCount} records shown · ${counts.all} total records`
            : "Loading records..."}
        </span>
        {active && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear all
          </Button>
        )}
      </div>
      {!hydrated ? (
        <div
          role="status"
          aria-label="Loading records"
          aria-busy="true"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {[0, 1, 2].map(i => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : resultCount === 0 ? (
        <div
          role="status"
          className="rounded-2xl border bg-card p-8 text-center"
        >
          <Icon className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            {counts.all === 0
              ? "No records yet"
              : "No records match your filters"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {counts.all === 0
              ? "Add the first record to start this registry."
              : "Try adjusting your search or date range."}
          </p>
          <Button
            className={cn("mt-4", accent)}
            onClick={counts.all === 0 ? onRecord : reset}
            disabled={isSaving}
          >
            {counts.all === 0 ? recordLabel : "Clear all"}
          </Button>
        </div>
      ) : (
        children(view)
      )}
    </div>
  );
}

export function LifeEventRecordCard({
  title,
  subtitle,
  icon: Icon,
  date,
  dateLabel,
  location,
  officiant,
  notes,
  children,
  onCertificate,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  date: string;
  dateLabel: string;
  location: string;
  officiant: string;
  notes: string;
  children?: ReactNode;
  onCertificate: () => void;
}) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
          <Icon className="size-7" />
        </span>
        <div className="min-w-0">
          <h2 className="break-words text-lg font-bold tracking-tight">
            {title}
          </h2>
          <p className="mt-1 break-words text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="my-4 space-y-3 border-t pt-4 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <Calendar className="size-4 shrink-0" />
          <span>
            {dateLabel}: {date}
          </span>
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="size-4 shrink-0" />
          <span className="min-w-0 break-words">
            {location.trim() || "Location not recorded"}
          </span>
        </p>
        <p className="flex items-start gap-2">
          <UserRound className="size-4 shrink-0" />
          <span className="min-w-0 break-words">
            Officiant: {officiant.trim() || "Not recorded"}
          </span>
        </p>
        {children}
      </div>
      {notes && (
        <p className="mb-4 line-clamp-2 break-words text-sm text-muted-foreground">
          {notes}
        </p>
      )}
      <div className="mt-auto pt-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl border-[var(--accent-color-border)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]"
          onClick={onCertificate}
        >
          <FileText className="size-4" />
          Certificate
        </Button>
      </div>
    </article>
  );
}
