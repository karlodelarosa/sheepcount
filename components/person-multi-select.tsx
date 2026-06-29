"use client";

import { useMemo, useState } from "react";
import { Search, CheckSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  defaultPersonLabel,
  personSearchKeywords,
  type PersonSelectPerson,
} from "@/components/person-select";

export type PersonMultiSelectProps = {
  people: PersonSelectPerson[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  label?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  inputClassName?: string;
  listClassName?: string;
  formatLabel?: (person: PersonSelectPerson) => string;
};

export function PersonMultiSelect({
  people,
  selectedIds,
  onSelectedIdsChange,
  label = "Select People",
  searchPlaceholder = "Search people...",
  emptyMessage = "No people found",
  inputClassName,
  listClassName,
  formatLabel = defaultPersonLabel,
}: PersonMultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const sortedPeople = useMemo(
    () => [...people].sort((a, b) => a.name.localeCompare(b.name)),
    [people],
  );

  const filteredPeople = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return sortedPeople;

    return sortedPeople.filter(person =>
      personSearchKeywords(person).toLowerCase().includes(query),
    );
  }, [searchTerm, sortedPeople]);

  const togglePerson = (personId: string) => {
    onSelectedIdsChange(
      selectedIds.includes(personId)
        ? selectedIds.filter(id => id !== personId)
        : [...selectedIds, personId],
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>
          {label}
          {selectedIds.length > 0 && ` (${selectedIds.length} selected)`}
        </Label>
        {selectedIds.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onSelectedIdsChange([])}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className={cn("pl-10", inputClassName)}
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
        />
      </div>

      <ScrollArea
        className={cn(
          "h-48 rounded-lg border p-2",
          listClassName,
        )}
      >
        <div className="space-y-1">
          {filteredPeople.map(person => {
            const isSelected = selectedIds.includes(person.id);

            return (
              <div
                key={person.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg p-2 transition",
                  isSelected
                    ? "border border-primary/40 bg-primary/10"
                    : "border border-transparent hover:bg-accent/50",
                )}
                onClick={() => togglePerson(person.id)}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="truncate text-sm font-medium">
                    {formatLabel(person)}
                  </p>
                </div>
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded border" />
                )}
              </div>
            );
          })}

          {filteredPeople.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
