"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEventAttendance } from "@/lib/event-attendance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  CalendarDays,
  MapPin,
  Users,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { CreateEventDialog } from "./_components/create-event-dialog";
import { RecordEventAttendanceDialog } from "./_components/record-event-attendance-dialog";

const statusColors: Record<string, string> = {
  Upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Ongoing: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Completed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const typeColors: Record<string, string> = {
  Retreat: "border-purple-300 text-purple-700",
  "Youth Camp": "border-green-300 text-green-700",
  Conference: "border-blue-300 text-blue-700",
  Outreach: "border-orange-300 text-orange-700",
  Workshop: "border-indigo-300 text-indigo-700",
  Other: "border-slate-300 text-slate-600",
};

export function EventAttendanceView() {
  const router = useRouter();
  const {
    events,
    hydrated,
    createEvent,
    recordAttendance,
    getEventSessions,
    getUniqueAttendees,
  } = useEventAttendance();

  const [createOpen, setCreateOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);

  if (!hydrated) return null;

  const upcoming = events.filter(e => e.status === "Upcoming").length;
  const totalSessions = events.reduce(
    (sum, e) => sum + getEventSessions(e.id).length,
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Event Attendance</h1>
          <p className="text-xs text-muted-foreground">
            Track attendance for retreats, camps, conferences, and special events
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setRecordOpen(true)}
          >
            <ClipboardList className="w-3.5 h-3.5 mr-1" />
            Record
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total Events", value: events.length },
          { label: "Upcoming", value: upcoming },
          { label: "Sessions Recorded", value: totalSessions },
        ].map(stat => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-2">
        {events.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No events yet. Create a retreat, youth camp, or conference to start
              tracking attendance.
            </CardContent>
          </Card>
        ) : (
          events.map(event => {
            const sessions = getEventSessions(event.id);
            const attendees = getUniqueAttendees(event.id);

            return (
              <Card
                key={event.id}
                className="border-border/60 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => router.push(`/event-attendance/${event.id}`)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-sm">{event.name}</h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${typeColors[event.type] ?? ""}`}
                        >
                          {event.type}
                        </Badge>
                        <Badge
                          className={`text-[10px] h-5 ${statusColors[event.status]}`}
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(event.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {event.endDate !== event.startDate && (
                            <>
                              {" – "}
                              {new Date(event.endDate).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric", year: "numeric" },
                              )}
                            </>
                          )}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {attendees.length} attendees · {sessions.length}{" "}
                          sessions
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
        onCreate={input => {
          const event = createEvent(input);
          router.push(`/event-attendance/${event.id}`);
        }}
      />

      <RecordEventAttendanceDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        events={events}
        onRecord={recordAttendance}
      />
    </div>
  );
}
