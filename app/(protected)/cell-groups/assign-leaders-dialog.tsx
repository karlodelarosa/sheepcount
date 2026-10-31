"use client";

import { useEffect, useState } from "react";
import { Search, UserRoundPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type CellGroupLeaderApprovalResult,
  type CellGroupLeaderCandidate,
} from "@/lib/supabase/cell-group-leaders";

type AssignLeadersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onAssign: (personIds: string[]) => Promise<CellGroupLeaderApprovalResult[]>;
  onSearch: (query: string) => Promise<CellGroupLeaderCandidate[]>;
};

function messageFrom(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Leaders could not be loaded.";
}

export function AssignLeadersDialog({
  open,
  onOpenChange,
  isSaving,
  onAssign,
  onSearch,
}: AssignLeadersDialogProps) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<CellGroupLeaderCandidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    setIsLoading(true);
    setError("");
    const timer = window.setTimeout(() => {
      void onSearch(query)
        .then(people => {
          if (active) setCandidates(people);
        })
        .catch(cause => {
          if (active) setError(messageFrom(cause));
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [onSearch, open, query]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery("");
      setSelectedIds([]);
      setError("");
    }
    onOpenChange(nextOpen);
  };

  const handleAssign = async () => {
    setError("");
    const results = await onAssign(selectedIds);
    const failed = results.filter(result => !result.ok);
    if (!failed.length && results.length) {
      handleOpenChange(false);
      return;
    }
    setError(
      failed
        .map(
          result =>
            `${result.fullName ?? "Person"}: ${result.message ?? "Could not assign leadership"}`,
        )
        .join(" ") || "No leaders were assigned.",
    );
    const succeeded = new Set(
      results.filter(result => result.ok).map(result => result.personId),
    );
    setSelectedIds(ids => ids.filter(id => !succeeded.has(id)));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRoundPlus className="h-5 w-5" /> Assign Cell Group Leaders
          </DialogTitle>
          <DialogDescription>
            Approve people to access leader onboarding in Circles. This does not
            create a Cell Group or account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              aria-label="Search people"
              autoFocus
              className="pl-10"
              placeholder="Search by name, email, or phone"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-zinc-400">
            <span aria-live="polite">{selectedIds.length} selected</span>
            {selectedIds.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                Clear
              </Button>
            )}
          </div>

          <ScrollArea className="h-64 rounded-lg border border-slate-200 p-2 dark:border-zinc-700">
            <div className="space-y-1" aria-busy={isLoading}>
              {isLoading && (
                <p className="py-8 text-center text-sm text-slate-500">
                  Loading people…
                </p>
              )}
              {!isLoading &&
                candidates.map(person => {
                  const checked = selectedIds.includes(person.personId);
                  return (
                    <div
                      key={person.personId}
                      className="rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={nextChecked =>
                          setSelectedIds(ids =>
                            nextChecked
                              ? [...ids, person.personId]
                              : ids.filter(id => id !== person.personId),
                          )
                        }
                        label={
                          <span className="block min-w-0">
                            <span className="block truncate font-medium">
                              {person.fullName}
                            </span>
                            {(person.email || person.phone) && (
                              <span className="block truncate text-xs text-slate-500 dark:text-zinc-400">
                                {[person.email, person.phone]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                            )}
                          </span>
                        }
                      />
                    </div>
                  );
                })}
              {!isLoading && !candidates.length && !error && (
                <p className="py-8 text-center text-sm text-slate-500">
                  No eligible people found.
                </p>
              )}
            </div>
          </ScrollArea>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedIds.length || isSaving}
            onClick={() => void handleAssign()}
          >
            {isSaving
              ? "Assigning…"
              : `Assign ${selectedIds.length || ""} leader${selectedIds.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
