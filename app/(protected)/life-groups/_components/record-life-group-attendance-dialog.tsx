"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckSquare, Search } from "lucide-react";
import type { Person } from "@/lib/people";

interface RecordLifeGroupAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  members: Person[];
  isSaving?: boolean;
  onRecord: (date: string, personIds: string[]) => void | Promise<void>;
}

export function RecordLifeGroupAttendanceDialog({
  open,
  onOpenChange,
  groupName,
  members,
  isSaving = false,
  onRecord,
}: RecordLifeGroupAttendanceDialogProps) {
  const [date, setDate] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open && !date) {
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [open, date]);

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      setSearch("");
    }
  }, [open]);

  const togglePerson = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelectedIds(members.map(m => m.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || selectedIds.length === 0) return;

    await onRecord(date, selectedIds);
    setSelectedIds([]);
    setSearch("");
    onOpenChange(false);
  };

  const filtered = members.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.householdName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Record Attendance</DialogTitle>
          <DialogDescription className="text-xs">
            Mark who attended {groupName} on the selected date.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attendance-date">Date</Label>
            <Input
              id="attendance-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Members Present</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="text-xs h-7"
              >
                Select all
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-48 rounded-lg border border-slate-200 dark:border-zinc-700">
              {filtered.length === 0 ? (
                <p className="p-4 text-sm text-slate-500 text-center">
                  {members.length === 0
                    ? "No members in this group yet."
                    : "No members match your search."}
                </p>
              ) : (
                <div className="p-1">
                  {filtered.map(person => {
                    const selected = selectedIds.includes(person.id);
                    return (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => togglePerson(person.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                          selected
                            ? "bg-slate-100 dark:bg-zinc-700"
                            : "hover:bg-slate-50 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <CheckSquare
                          className={`w-4 h-4 shrink-0 ${
                            selected
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-300 dark:text-zinc-600"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {person.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {person.householdName}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            {selectedIds.length > 0 && (
              <p className="text-xs text-slate-500">
                {selectedIds.length} member
                {selectedIds.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!date || selectedIds.length === 0 || isSaving}
            >
              {isSaving ? "Saving..." : "Record Attendance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
