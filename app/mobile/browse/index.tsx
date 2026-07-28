"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Church,
  ChevronDown,
  Inbox,
  UsersRound,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePeople } from "@/lib/people";
import { useServiceAttendance } from "@/lib/service-attendance";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { useEvents } from "@/lib/events";
import { groupAttendanceBySession } from "@/app/(protected)/service-attendance/_lib/group-attendance";
import { MobileTabBar } from "../_components/mobile-tab-bar";
import { MobileTopBar } from "../_components/mobile-top-bar";

type BrowseType = "service" | "life-group" | "event";

interface BrowseSession {
  key: string;
  type: BrowseType;
  title: string;
  subtitle?: string;
  date: string;
  attendeeIds: string[];
}

const TYPE_META: Record<
  BrowseType,
  { label: string; icon: typeof Church; accent: string }
> = {
  service: {
    label: "Service",
    icon: Church,
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  "life-group": {
    label: "Life Group",
    icon: UsersRound,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  event: {
    label: "Event",
    icon: CalendarDays,
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
};

const FILTERS: { value: BrowseType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "service", label: "Service" },
  { value: "life-group", label: "Life Groups" },
  { value: "event", label: "Events" },
];

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MobileBrowse() {
  const { people, hydrated: peopleHydrated } = usePeople();
  const { attendanceRows, hydrated: serviceHydrated } = useServiceAttendance();
  const {
    lifeGroups,
    lifeGroupSessions,
    hydrated: groupsHydrated,
  } = useGroupsMinistry();
  const { events, attendanceRecords, hydrated: eventsHydrated } = useEvents();

  const [filter, setFilter] = useState<BrowseType | "all">("all");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const loading =
    !peopleHydrated || !serviceHydrated || !groupsHydrated || !eventsHydrated;

  const nameById = useMemo(
    () => new Map(people.map(person => [person.id, person.name])),
    [people],
  );

  const sessions = useMemo<BrowseSession[]>(() => {
    const serviceSessions: BrowseSession[] = groupAttendanceBySession(
      attendanceRows.map(row => ({
        id: row.id,
        serviceId: row.serviceId,
        date: row.date,
        personId: row.personId,
        serviceType: row.serviceType,
        serviceCategory: row.serviceCategory,
      })),
    ).map(session => ({
      key: `service-${session.serviceId}-${session.date}`,
      type: "service",
      title: session.serviceType,
      date: session.date,
      attendeeIds: session.attendees,
    }));

    const groupNameById = new Map(
      lifeGroups.map(group => [group.id, group.name]),
    );
    const lifeGroupSessionRows: BrowseSession[] = lifeGroupSessions.map(
      session => ({
        key: `life-group-${session.id}`,
        type: "life-group",
        title: groupNameById.get(session.lifeGroupId) ?? "Life group",
        date: session.sessionDate,
        attendeeIds: session.attendeePersonIds,
      }),
    );

    const eventTitleById = new Map(
      events.map(event => [event.id, event.title]),
    );
    const eventSessionMap = new Map<string, BrowseSession>();
    for (const record of attendanceRecords) {
      const key = `event-${record.eventId}-${record.date}-${record.sessionLabel}`;
      let session = eventSessionMap.get(key);
      if (!session) {
        session = {
          key,
          type: "event",
          title: eventTitleById.get(record.eventId) ?? "Event",
          subtitle: record.sessionLabel,
          date: record.date,
          attendeeIds: [],
        };
        eventSessionMap.set(key, session);
      }
      session.attendeeIds.push(record.personId);
    }

    return [
      ...serviceSessions,
      ...lifeGroupSessionRows,
      ...eventSessionMap.values(),
    ].sort((a, b) => b.date.localeCompare(a.date));
  }, [
    attendanceRows,
    lifeGroups,
    lifeGroupSessions,
    events,
    attendanceRecords,
  ]);

  const visibleSessions = useMemo(
    () =>
      filter === "all"
        ? sessions
        : sessions.filter(session => session.type === filter),
    [sessions, filter],
  );

  return (
    <>
      <MobileTopBar />

      <header className="border-b px-5 py-5">
        <h1 className="text-xl font-semibold">Browse Records</h1>
        <p className="text-sm text-muted-foreground">
          Double-check what&apos;s been recorded
        </p>
      </header>

      <div className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b bg-background/95 px-4 py-3 backdrop-blur">
        {FILTERS.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <main className="flex-1 px-4 py-4 pb-24">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : visibleSessions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
            <Inbox className="h-6 w-6" />
            No records yet
          </div>
        ) : (
          <ul className="space-y-2">
            {visibleSessions.map(session => {
              const meta = TYPE_META[session.type];
              const Icon = meta.icon;
              const isExpanded = expandedKey === session.key;
              return (
                <li
                  key={session.key}
                  className="overflow-hidden rounded-xl border bg-card"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedKey(isExpanded ? null : session.key)
                    }
                    className="flex w-full items-center gap-3 px-3 py-3 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        meta.accent,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {session.title}
                        {session.subtitle ? (
                          <span className="text-muted-foreground">
                            {" "}
                            · {session.subtitle}
                          </span>
                        ) : null}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {formatDate(session.date)} · {meta.label}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                      {session.attendeeIds.length}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </span>
                  </button>

                  {isExpanded ? (
                    <div className="border-t bg-muted/30 px-3 py-2">
                      {session.attendeeIds.length === 0 ? (
                        <p className="py-1 text-xs text-muted-foreground">
                          No attendees recorded
                        </p>
                      ) : (
                        <ul className="divide-y divide-border/60">
                          {session.attendeeIds.map((personId, index) => (
                            <li
                              key={`${session.key}-${personId}-${index}`}
                              className="py-1.5 text-sm"
                            >
                              {nameById.get(personId) ?? "Unknown"}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <MobileTabBar />
    </>
  );
}
