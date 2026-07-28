"use client";

import { useMemo, useState } from "react";
import { Check, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface MobileListPerson {
  id: string;
  name: string;
  householdName: string;
}

interface MobilePersonListProps {
  people: MobileListPerson[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  /** Called with all currently-filtered ids when the select-all control is used. */
  onSelectAll?: (filteredIds: string[]) => void;
  onClear?: () => void;
  emptyLabel?: string;
}

export function MobilePersonList({
  people,
  selectedIds,
  onToggle,
  onSelectAll,
  onClear,
  emptyLabel = "No people found",
}: MobilePersonListProps) {
  const [search, setSearch] = useState("");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return people;
    return people.filter(
      person =>
        person.name.toLowerCase().includes(term) ||
        person.householdName.toLowerCase().includes(term),
    );
  }, [people, search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search by name…"
          className="h-11 pl-9"
          inputMode="search"
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {selectedIds.length} selected · {filtered.length} shown
        </span>
        <div className="flex items-center gap-3">
          {onSelectAll ? (
            <button
              type="button"
              className="font-medium text-primary"
              onClick={() => onSelectAll(filtered.map(person => person.id))}
            >
              Select all
            </button>
          ) : null}
          {onClear && selectedIds.length > 0 ? (
            <button
              type="button"
              className="font-medium text-muted-foreground"
              onClick={onClear}
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          <Users className="h-6 w-6" />
          {emptyLabel}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map(person => {
            const isSelected = selectedSet.has(person.id);
            return (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => onToggle(person.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors active:scale-[0.99]",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {person.name}
                    </span>
                    {person.householdName ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {person.householdName}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
