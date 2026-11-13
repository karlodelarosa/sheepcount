import { HousePlus, Plus, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HouseholdDirectorySkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading households"
      className="space-y-5"
    >
      <div className="h-36 animate-pulse rounded-xl bg-muted" />
      <div className="h-14 animate-pulse rounded-xl bg-muted" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

export function EmptyHouseholdDirectory({
  onAddHousehold,
}: {
  onAddHousehold: () => void;
}) {
  return (
    <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
        <HousePlus className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        No households yet
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Create the first household, then add or assign people from the
        directory.
      </p>
      <Button
        onClick={onAddHousehold}
        className="mt-5 min-h-11 gap-2 rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)] focus-visible:ring-[var(--accent-color)]"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add Household
      </Button>
    </section>
  );
}

export function NoMatchingHouseholds({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
      <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        No matching households
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Try a different search or clear the current household filter.
      </p>
      <Button
        variant="outline"
        onClick={onClearFilters}
        className="mt-5 min-h-11 rounded-xl focus-visible:ring-[var(--accent-color)]"
      >
        Clear filters
      </Button>
    </div>
  );
}
