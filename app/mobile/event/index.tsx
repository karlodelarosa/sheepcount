"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays, Check, ChevronRight } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { usePeople } from "@/lib/people";
import { useEvents } from "@/lib/events";
import { MobileShell } from "../_components/mobile-shell";
import { MobileActionBar } from "../_components/mobile-action-bar";
import { MobilePersonList } from "../_components/mobile-person-list";
import { submitEventAttendance } from "../_lib/submit-attendance";

const SESSION_PRESETS = [
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

const CUSTOM_SESSION = "__custom__";

export function MobileEventAttendance() {
  const router = useRouter();
  const { people, hydrated: peopleHydrated } = usePeople();
  const { events, hydrated, isSaving, recordEventAttendance } = useEvents();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [sessionChoice, setSessionChoice] = useState("Check-in");
  const [customSession, setCustomSession] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const submitInFlight = useRef(false);

  const loading = !hydrated || !peopleHydrated;

  const activeEvents = useMemo(
    () => events.filter(event => event.status !== "cancelled"),
    [events],
  );

  const selectedEvent = useMemo(
    () => activeEvents.find(event => event.id === selectedEventId) ?? null,
    [activeEvents, selectedEventId],
  );

  const sessionLabel =
    sessionChoice === CUSTOM_SESSION ? customSession.trim() : sessionChoice;

  const openEvent = (eventId: string) => {
    const event = activeEvents.find(candidate => candidate.id === eventId);
    setSelectedEventId(eventId);
    setDate(event?.startDate ?? new Date().toISOString().split("T")[0]);
    setSessionChoice("Check-in");
    setCustomSession("");
    setSelectedIds([]);
  };

  const closeEvent = () => {
    setSelectedEventId(null);
    setSelectedIds([]);
  };

  const toggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (
      !selectedEventId ||
      !date ||
      !sessionLabel ||
      selectedIds.length === 0 ||
      submitInFlight.current
    ) {
      return;
    }

    submitInFlight.current = true;
    try {
      const ok = await submitEventAttendance({
        eventId: selectedEventId,
        date,
        sessionLabel,
        personIds: selectedIds,
        recordEventAttendance,
      });

      if (!ok) {
        toast.error("Could not save attendance", {
          description: "Please try again.",
        });
        return;
      }

      toast.success("Attendance recorded", {
        description: `${selectedIds.length} at ${selectedEvent?.title ?? "event"}`,
      });
      router.push("/mobile");
    } finally {
      submitInFlight.current = false;
    }
  };

  if (loading) {
    return (
      <MobileShell title="Event Attendance" backHref="/mobile">
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </MobileShell>
    );
  }

  if (!selectedEvent) {
    return (
      <MobileShell
        title="Event Attendance"
        subtitle="Pick an event"
        backHref="/mobile"
      >
        {activeEvents.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[20px] bg-card py-14 text-center text-[15px] text-muted-foreground">
            <CalendarDays className="size-6" strokeWidth={1.8} />
            No active events
          </div>
        ) : (
          <ul className="overflow-hidden rounded-[20px] bg-card ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
            {activeEvents.map(event => (
              <li key={event.id} className="border-b last:border-b-0">
                <button
                  type="button"
                  onClick={() => openEvent(event.id)}
                  className="flex min-h-[72px] w-full items-center gap-3.5 px-4 text-left transition-colors duration-200 hover:bg-muted/50 active:bg-muted motion-reduce:transition-none"
                >
                  <span className="flex w-7 shrink-0 items-center justify-center text-foreground">
                    <CalendarDays className="size-6" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-medium">
                      {event.title}
                    </span>
                    <span className="mt-1 block truncate text-[13px] text-muted-foreground">
                      {event.startDate}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-5 shrink-0 text-muted-foreground/70"
                    strokeWidth={1.8}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </MobileShell>
    );
  }

  return (
    <MobileShell
      title={selectedEvent.title}
      subtitle="Event attendance"
      onBack={closeEvent}
      withActionBarSpacing
      action={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 rounded-xl px-3 text-[13px]"
          onClick={closeEvent}
        >
          Change
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={event => setDate(event.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Session</Label>
            <Select value={sessionChoice} onValueChange={setSessionChoice}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent>
                {SESSION_PRESETS.map(preset => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_SESSION}>Custom…</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {sessionChoice === CUSTOM_SESSION && (
          <div className="space-y-1.5">
            <Label>Custom session name</Label>
            <Input
              value={customSession}
              onChange={event => setCustomSession(event.target.value)}
              placeholder="e.g. Evening Rally"
              className="h-11"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Attendees</Label>
          <MobilePersonList
            people={people.map(person => ({
              id: person.id,
              name: person.name,
              householdName: person.householdName,
            }))}
            selectedIds={selectedIds}
            onToggle={toggle}
            onClear={() => setSelectedIds([])}
            emptyLabel="No people match your search"
          />
        </div>
      </div>

      <MobileActionBar
        hint={`${selectedIds.length} selected${sessionLabel ? ` · ${sessionLabel}` : ""}`}
      >
        <Button
          type="button"
          className="h-12 w-full gap-1.5"
          disabled={selectedIds.length === 0 || !sessionLabel || isSaving}
          onClick={() => void handleSubmit()}
        >
          {isSaving ? (
            "Saving…"
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save attendance
            </>
          )}
        </Button>
      </MobileActionBar>
    </MobileShell>
  );
}
