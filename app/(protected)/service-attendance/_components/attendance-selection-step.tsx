"use client";

import { useMemo } from "react";
import { Search, CheckSquare, UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  formatGuestName,
  type GuestName,
} from "../_lib/attendance-workflow";

interface PersonOption {
  id: string;
  name: string;
  householdName: string;
}

interface AttendanceSelectionStepProps {
  people: PersonOption[];
  selectedKeys: string[];
  guestNames: Map<string, GuestName>;
  guestInput: string;
  searchTerm: string;
  onGuestInputChange: (value: string) => void;
  onAddGuest: () => void;
  onSearchTermChange: (value: string) => void;
  onTogglePerson: (personId: string) => void;
  onRemoveGuest: (guestKey: string) => void;
  onClearSelection: () => void;
}

export function AttendanceSelectionStep({
  people,
  selectedKeys,
  guestNames,
  guestInput,
  searchTerm,
  onGuestInputChange,
  onAddGuest,
  onSearchTermChange,
  onTogglePerson,
  onRemoveGuest,
  onClearSelection,
}: AttendanceSelectionStepProps) {
  const selectedGuestKeys = useMemo(
    () => selectedKeys.filter((key) => key.startsWith("guest-")),
    [selectedKeys],
  );

  const sortedPeople = useMemo(
    () => [...people].sort((a, b) => a.name.localeCompare(b.name)),
    [people],
  );

  const filteredPeople = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sortedPeople;

    return sortedPeople.filter(
      (person) =>
        person.name.toLowerCase().includes(term) ||
        person.householdName.toLowerCase().includes(term),
    );
  }, [searchTerm, sortedPeople]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quick-add-guest">Quick Add Guest</Label>
        <div className="flex gap-2">
          <Input
            id="quick-add-guest"
            placeholder="First and last name, then press Enter"
            value={guestInput}
            onChange={(e) => onGuestInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddGuest();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0 gap-1.5"
            onClick={onAddGuest}
          >
            <UserPlus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      {selectedGuestKeys.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGuestKeys.map((guestKey) => {
            const guest = guestNames.get(guestKey);
            if (!guest) return null;

            return (
              <Badge
                key={guestKey}
                variant="secondary"
                className="gap-1.5 pr-1.5"
              >
                {formatGuestName(guest)}
                <span className="text-[10px] uppercase tracking-wide opacity-70">
                  New
                </span>
                <button
                  type="button"
                  className="ml-0.5 rounded-sm px-1 text-xs hover:bg-background/60"
                  onClick={() => onRemoveGuest(guestKey)}
                  aria-label={`Remove ${formatGuestName(guest)}`}
                >
                  ×
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between gap-2">
          <Label>Members ({selectedKeys.length} selected)</Label>
          {selectedKeys.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onClearSelection}
            >
              Clear
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search roster..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>

        <ScrollArea className="h-64 rounded-xl border p-3">
          <div className="space-y-1">
            {filteredPeople.map((person) => {
              const isSelected = selectedKeys.includes(person.id);

              return (
                <div
                  key={person.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-lg p-2 transition",
                    isSelected
                      ? "border border-primary/40 bg-primary/10"
                      : "border border-transparent hover:bg-accent/50",
                  )}
                  onClick={() => onTogglePerson(person.id)}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-sm text-white shadow-sm">
                      {person.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{person.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {person.householdName || "No household"}
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <CheckSquare className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <div className="h-5 w-5 shrink-0 rounded-md border" />
                  )}
                </div>
              );
            })}

            {filteredPeople.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No people match your search
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
