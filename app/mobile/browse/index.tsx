"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Church,
  ChevronDown,
  Inbox,
  Sprout,
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
import { MobilePageHeader } from "../_components/mobile-page-header";

type BrowseType = "service" | "life-group" | "cell-group" | "event";

interface BrowseSession {
  key: string;
  type: BrowseType;
  title: string;
  subtitle?: string;
  date: string;
  attendeeIds: string[];
}

const TYPE_META: Record<BrowseType, { label: string; icon: typeof Church }> = {
  service: {
    label: "Service",
    icon: Church,
  },
  "life-group": {
    label: "Life Group",
    icon: UsersRound,
  },
  "cell-group": {
    label: "Cell Group",
    icon: Sprout,
  },
  event: {
    label: "Event",
    icon: CalendarDays,
  },
};

const FILTERS: { value: BrowseType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "service", label: "Service" },
  { value: "life-group", label: "Life Groups" },
  { value: "cell-group", label: "Cell Groups" },
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
    cellGroups,
    cellGroupSessions,
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

    const cellGroupNameById = new Map(
      cellGroups.map(group => [group.id, group.name]),
    );
    const cellGroupSessionRows: BrowseSession[] = cellGroupSessions.map(
      session => ({
        key: `cell-group-${session.id}`,
        type: "cell-group",
        title: cellGroupNameById.get(session.cellGroupId) ?? "Cell Group",
        subtitle: [session.leaderName, session.location]
          .filter(Boolean)
          .join(" · "),
        date: session.sessionDate,
        attendeeIds: session.attendeePersonIds,
      }),
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
      ...cellGroupSessionRows,
      ...eventSessionMap.values(),
    ].sort((a, b) => b.date.localeCompare(a.date));
  }, [
    attendanceRows,
    lifeGroups,
    lifeGroupSessions,
    cellGroups,
    cellGroupSessions,
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

      <MobilePageHeader
        title="Browse records"
        subtitle="Double-check what’s been recorded"
      />

      <div className="sticky top-0 z-10 flex gap-1.5 overflow-x-auto bg-background/88 px-4 py-2 backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
        {FILTERS.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={cn(
              "min-h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-200 motion-reduce:transition-none",
              filter === option.value
                ? "bg-foreground text-background"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <main className="flex-1 px-4 pb-28 pt-3">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-[72px] w-full rounded-[18px]"
              />
            ))}
          </div>
        ) : visibleSessions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[20px] bg-card py-16 text-center text-[15px] text-muted-foreground">
            <Inbox className="size-6" strokeWidth={1.8} />
            <div>
              <p className="font-medium text-foreground">No records yet</p>
              <p className="mt-1 text-[13px]">
                New attendance records appear here.
              </p>
            </div>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-[20px] bg-card ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
            {visibleSessions.map(session => {
              const meta = TYPE_META[session.type];
              const Icon = meta.icon;
              const isExpanded = expandedKey === session.key;
              return (
                <li key={session.key} className="border-b last:border-b-0">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedKey(isExpanded ? null : session.key)
                    }
                    className="flex min-h-[72px] w-full items-center gap-3.5 px-4 text-left transition-colors duration-200 hover:bg-muted/50 active:bg-muted motion-reduce:transition-none"
                  >
                    <span className="flex w-7 shrink-0 items-center justify-center text-foreground">
                      <Icon className="size-6" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] font-medium leading-5">
                        {session.title}
                        {session.subtitle ? (
                          <span className="text-muted-foreground">
                            {" "}
                            · {session.subtitle}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block truncate text-[13px] leading-4 text-muted-foreground">
                        {formatDate(session.date)} · {meta.label}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground">
                      {session.attendeeIds.length}
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200 motion-reduce:transition-none",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </span>
                  </button>

                  {isExpanded ? (
                    <div className="border-t bg-muted/45 px-4 py-2.5">
                      {session.attendeeIds.length === 0 ? (
                        <p className="py-2 text-[13px] text-muted-foreground">
                          No attendees recorded
                        </p>
                      ) : (
                        <ul className="divide-y divide-border/70">
                          {session.attendeeIds.map((personId, index) => (
                            <li
                              key={`${session.key}-${personId}-${index}`}
                              className="py-2.5 text-[15px]"
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
