"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEvents } from "@/lib/events";
import { usePeople } from "@/lib/people";
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
  ArrowLeft,
  CalendarDays,
  Users,
  ClipboardList,
  Plus,
} from "lucide-react";
import { RecordEventAttendanceDialog } from "../_components/record-event-attendance-dialog";

interface EventDetailViewProps {
  eventId: string;
}

const timingLabels = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
} as const;

export function EventDetailView({ eventId }: EventDetailViewProps) {
  const router = useRouter();
  const { people } = usePeople();
  const {
    events,
    hydrated,
    isSaving,
    recordEventAttendance,
    getEventSessions,
    getUniqueAttendeeIds,
    getEventTiming,
  } = useEvents();

  const [recordOpen, setRecordOpen] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const event = events.find(e => e.id === eventId);
  const sessions = getEventSessions(eventId);
  const uniqueAttendeeIds = getUniqueAttendeeIds(eventId);

  const uniqueAttendees = useMemo(
    () =>
      uniqueAttendeeIds
        .map(id => people.find(p => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [uniqueAttendeeIds, people],
  );

  if (!hydrated) return null;

  if (!event) {
    return (
      <div className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => router.push("/event-attendance")}
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Event not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const timing = getEventTiming(event);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => router.push("/event-attendance")}
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          All Events
        </Button>
        <Button
          size="sm"
          className="h-8 text-xs"
          onClick={() => setRecordOpen(true)}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Record Session
        </Button>
      </div>

      <Card className="border-border/60">
        <CardHeader className="py-3 px-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">{event.title}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {event.description}
              </CardDescription>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Badge variant="outline" className="text-[10px] h-5">
                {event.type}
              </Badge>
              <Badge variant="secondary" className="text-[10px] h-5">
                {event.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {new Date(event.startDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {event.endDate !== event.startDate &&
                ` – ${new Date(event.endDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}`}
            </span>
            <Badge className="text-[10px] h-5">{timingLabels[timing]}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Unique Attendees", value: uniqueAttendees.length, icon: Users },
          { label: "Sessions", value: sessions.length, icon: ClipboardList },
          {
            label: "Total Check-ins",
            value: sessions.reduce((s, sess) => s + sess.personIds.length, 0),
            icon: CalendarDays,
          },
        ].map(stat => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <stat.icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">Attendance Sessions</CardTitle>
            <CardDescription className="text-xs">
              Per-day or per-session headcount
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-1.5">
            {sessions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No sessions recorded yet.{" "}
                <button
                  className="underline text-foreground"
                  onClick={() => setRecordOpen(true)}
                >
                  Record the first session
                </button>
              </p>
            ) : (
              sessions.map(session => {
                const key = `${session.date}---${session.sessionLabel}`;
                const isExpanded = expandedSession === key;
                const sessionPeople = session.personIds
                  .map(id => people.find(p => p.id === id))
                  .filter((p): p is NonNullable<typeof p> => Boolean(p));

                return (
                  <div key={key} className="border rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-2.5 hover:bg-muted/50 text-left text-xs"
                      onClick={() =>
                        setExpandedSession(isExpanded ? null : key)
                      }
                    >
                      <div>
                        <p className="font-medium">{session.sessionLabel}</p>
                        <p className="text-muted-foreground">
                          {new Date(session.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs h-5">
                        {session.personIds.length}
                      </Badge>
                    </button>
                    {isExpanded && (
                      <div className="border-t px-2.5 py-2 space-y-1 bg-muted/20">
                        {sessionPeople.map(person => (
                          <Link
                            key={person.id}
                            href={`/people/${person.id}`}
                            className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-muted/60 text-xs"
                          >
                            <span>{person.name}</span>
                            <span className="text-muted-foreground">
                              {person.householdName}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">All Attendees</CardTitle>
            <CardDescription className="text-xs">
              Unique people across all sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-1">
            {uniqueAttendees.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No attendees yet
              </p>
            ) : (
              uniqueAttendees.map(person => (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/60 text-xs"
                >
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-muted-foreground">
                      {person.membershipType}
                    </p>
                  </div>
                  <span className="text-muted-foreground">
                    {sessions.filter(s =>
                      s.personIds.includes(person.id),
                    ).length}{" "}
                    sessions
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <RecordEventAttendanceDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        events={[event]}
        people={people}
        defaultEventId={eventId}
        isSaving={isSaving}
        onRecord={async (id, date, sessionLabel, personIds) => {
          await recordEventAttendance({
            eventId: id,
            date,
            sessionLabel,
            personIds,
          });
        }}
      />
    </div>
  );
}
