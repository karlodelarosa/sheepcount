"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/lib/events";
import { usePeople } from "@/lib/people";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  CalendarDays,
  Users,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { CreateEventDialog } from "./_components/create-event-dialog";
import { RecordEventAttendanceDialog } from "./_components/record-event-attendance-dialog";

const timingColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  ongoing: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  completed:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const typeColors: Record<string, string> = {
  VBS: "border-blue-300 text-blue-700",
  Camp: "border-green-300 text-green-700",
  Retreat: "border-purple-300 text-purple-700",
  Conference: "border-indigo-300 text-indigo-700",
};

const timingLabels: Record<string, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
};

import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import {
  CollectionToolbar,
  CollectionLoading,
} from "@/components/ui/directory-page-header/collection-toolbar";
import { DashboardMetricCard } from "@/components/dashboard-metric-card";
export function EventAttendanceView() {
  const router = useRouter();
  const { people } = usePeople();
  const {
    events,
    hydrated,
    isSaving,
    addEvent,
    recordEventAttendance,
    getEventSessions,
    getUniqueAttendeeIds,
    getEventTiming,
  } = useEvents();

  const [createOpen, setCreateOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [timingFilter, setTimingFilter] = useState("all");
  const [view, setView] = useState<"cards" | "list">("cards");
  if (!hydrated) return <CollectionLoading />;

  const activeEvents = events.filter(e => e.status !== "cancelled");
  const filteredEvents = activeEvents.filter(
    event =>
      (timingFilter === "all" || getEventTiming(event) === timingFilter) &&
      `${event.title} ${event.description} ${event.type}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const upcoming = activeEvents.filter(
    e => getEventTiming(e) === "upcoming",
  ).length;
  const totalSessions = activeEvents.reduce(
    (sum, e) => sum + getEventSessions(e.id).length,
    0,
  );

  return (
    <div className="space-y-4">
      <DirectoryTitleCard
        title="Event Attendance"
        description="Track attendance for VBS, camps, retreats, and conferences"
        icon={CalendarDays}
        action={{
          label: "New Event",
          icon: Plus,
          onClick: () => setCreateOpen(true),
          disabled: isSaving,
        }}
        secondaryAction={{
          label: "Record Attendance",
          icon: ClipboardList,
          onClick: () => setRecordOpen(true),
          disabled: isSaving || activeEvents.length === 0,
        }}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Events", value: activeEvents.length },
          { label: "Upcoming", value: upcoming },
          { label: "Sessions Recorded", value: totalSessions },
        ].map(stat => (
          <DashboardMetricCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={
              stat.label === "Sessions Recorded" ? ClipboardList : CalendarDays
            }
          />
        ))}
      </div>

      <CollectionToolbar
        label="events"
        search={search}
        onSearch={setSearch}
        filter={timingFilter}
        onFilter={setTimingFilter}
        options={[
          { value: "all", label: "All events" },
          ...Object.entries(timingLabels).map(([value, label]) => ({
            value,
            label,
          })),
        ]}
        count={filteredEvents.length}
        view={view}
        onView={setView}
      />
      <div
        className={
          view === "cards"
            ? "grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3"
            : "grid grid-cols-1 gap-5"
        }
      >
        {filteredEvents.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              {activeEvents.length
                ? "No events match your filters."
                : "No events yet. Create a VBS, camp, retreat, or conference to start tracking attendance."}
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map(event => {
            const sessions = getEventSessions(event.id);
            const attendeeCount = getUniqueAttendeeIds(event.id).length;
            const timing = getEventTiming(event);

            return (
              <Card
                key={event.id}
                className="min-w-0 rounded-2xl border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold">
                          <button
                            className="text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
                            onClick={() =>
                              router.push(`/event-attendance/${event.id}`)
                            }
                          >
                            {event.title}
                          </button>
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${typeColors[event.type] ?? ""}`}
                        >
                          {event.type}
                        </Badge>
                        <Badge
                          className={`text-[10px] h-5 ${timingColors[timing]}`}
                        >
                          {timingLabels[timing]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(event.startDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                          {event.endDate !== event.startDate && (
                            <>
                              {" – "}
                              {new Date(event.endDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {attendeeCount} attendees · {sessions.length} sessions
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <CreateEventDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isSaving={isSaving}
        onCreate={async input => {
          const event = await addEvent(input);
          if (event) {
            router.push(`/event-attendance/${event.id}`);
          }
        }}
      />

      <RecordEventAttendanceDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        events={activeEvents}
        people={people}
        isSaving={isSaving}
        onRecord={async (eventId, date, sessionLabel, personIds) => {
          await recordEventAttendance({
            eventId,
            date,
            sessionLabel,
            personIds,
          });
        }}
      />
    </div>
  );
}
