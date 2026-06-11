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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckSquare, Search } from "lucide-react";
import { mockPeople } from "@/components/mock-data";
import type { ChurchEvent } from "@/lib/event-attendance";

const sessionPresets = [
  "Check-in",
  "Day 1 - Morning",
  "Day 1 - Evening",
  "Day 2 - Morning",
  "Day 2 - Afternoon",
  "Day 2 - Evening",
  "Day 3 - Closing",
  "Main Session",
  "Workshop",
  "Closing Service",
];

interface RecordEventAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: ChurchEvent[];
  defaultEventId?: string;
  onRecord: (
    eventId: string,
    date: string,
    sessionLabel: string,
    personIds: string[],
  ) => void;
}

export function RecordEventAttendanceDialog({
  open,
  onOpenChange,
  events,
  defaultEventId,
  onRecord,
}: RecordEventAttendanceDialogProps) {
  const [eventId, setEventId] = useState(defaultEventId ?? "");
  const [date, setDate] = useState("");
  const [sessionLabel, setSessionLabel] = useState("Check-in");
  const [customSession, setCustomSession] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const selectedEvent = events.find(e => e.id === eventId);

  useEffect(() => {
    if (defaultEventId) setEventId(defaultEventId);
  }, [defaultEventId]);

  useEffect(() => {
    if (selectedEvent && !date) {
      setDate(selectedEvent.startDate);
    }
  }, [selectedEvent, date]);

  const togglePerson = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label = customSession.trim() || sessionLabel;
    if (!eventId || !date || !label || selectedIds.length === 0) return;

    onRecord(eventId, date, label, selectedIds);
    setSelectedIds([]);
    setSearch("");
    onOpenChange(false);
  };

  const filtered = mockPeople.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.householdName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Record Event Attendance</DialogTitle>
          <DialogDescription className="text-xs">
            Track who attended a session within an event
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Event</Label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {events.map(ev => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Session Date</Label>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={selectedEvent?.startDate}
                max={selectedEvent?.endDate}
                required
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Session</Label>
              <Select value={sessionLabel} onValueChange={setSessionLabel}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sessionPresets.map(s => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Custom session name (optional)</Label>
            <Input
              value={customSession}
              onChange={e => setCustomSession(e.target.value)}
              placeholder="Override or add a custom label..."
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5 border-t pt-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">
                Attendees ({selectedIds.length})
              </Label>
              {selectedIds.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setSelectedIds([])}
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search people..."
                className="h-8 pl-8 text-sm"
              />
            </div>
            <ScrollArea className="h-48 border rounded-lg p-2">
              {filtered.map(person => {
                const selected = selectedIds.includes(person.id);
                return (
                  <div
                    key={person.id}
                    onClick={() => togglePerson(person.id)}
                    className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer text-sm ${
                      selected ? "bg-primary/10" : "hover:bg-muted/60"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-xs">{person.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {person.householdName}
                      </p>
                    </div>
                    {selected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 border rounded" />
                    )}
                  </div>
                );
              })}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!eventId || selectedIds.length === 0}
            >
              Save Attendance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
