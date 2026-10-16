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
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.8}
        />
        <Input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search by name…"
          className="h-[52px] border-0 bg-card pl-11 text-[16px] shadow-none ring-1 ring-black/[0.04] dark:ring-white/[0.08]"
          inputMode="search"
        />
      </div>

      <div className="flex items-center justify-between px-1 text-[13px]">
        <span className="text-muted-foreground">
          {selectedIds.length} selected · {filtered.length} shown
        </span>
        <div className="flex items-center gap-3">
          {onSelectAll ? (
            <button
              type="button"
              className="min-h-11 px-1 font-medium text-foreground"
              onClick={() => onSelectAll(filtered.map(person => person.id))}
            >
              Select all
            </button>
          ) : null}
          {onClear && selectedIds.length > 0 ? (
            <button
              type="button"
              className="min-h-11 px-1 font-medium text-muted-foreground"
              onClick={onClear}
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[20px] bg-card py-12 text-center text-[15px] text-muted-foreground">
          <Users className="size-6" strokeWidth={1.8} />
          {emptyLabel}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-[20px] bg-card ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
          {filtered.map(person => {
            const isSelected = selectedSet.has(person.id);
            return (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => onToggle(person.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex min-h-[60px] w-full items-center gap-3 border-b px-4 text-left transition-colors duration-200 last:border-b-0 hover:bg-muted/50 active:bg-muted motion-reduce:transition-none",
                    isSelected && "bg-muted/70",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200 motion-reduce:transition-none",
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {isSelected ? (
                      <Check className="size-4" strokeWidth={2.3} />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-medium leading-5">
                      {person.name}
                    </span>
                    {person.householdName ? (
                      <span className="mt-0.5 block truncate text-[13px] leading-4 text-muted-foreground">
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
