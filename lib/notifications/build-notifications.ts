import {
  ACTION_SECTIONS,
  getActionSectionCounts,
  type ActionHubSectionFilter,
} from "@/app/(protected)/growth-track/_lib/action-sections";
import type { GrowthTrackPerson } from "@/app/(protected)/growth-track/_lib/types";
import { isAttenderNewComer, getPersonVisitDate } from "@/lib/membership-path";
import type { Person } from "@/lib/people";
import type { ChurchEvent } from "@/lib/supabase/events";
import { deriveEventTiming } from "@/lib/supabase/events";
import type { ServiceAttendanceRow } from "@/lib/supabase/service-attendance";
import type { AppNotification } from "./types";

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMostRecentSunday(from = new Date()): string {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  date.setDate(date.getDate() - date.getDay());
  return formatLocalDate(date);
}

function growthTrackActionsUrl(section?: ActionHubSectionFilter): string {
  const params = new URLSearchParams();
  params.set("tab", "actions");
  if (section && section !== "all") {
    params.set("section", section);
  }
  return `/growth-track?${params.toString()}`;
}

function formatShortDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatEventDateRange(event: ChurchEvent): string {
  if (event.startDate === event.endDate) {
    return formatShortDate(event.startDate);
  }
  return `${formatShortDate(event.startDate)} – ${formatShortDate(event.endDate)}`;
}

export function buildActionNotifications(
  growthPeople: GrowthTrackPerson[],
): AppNotification[] {
  const counts = getActionSectionCounts(growthPeople);
  const notifications: AppNotification[] = [];

  for (const section of ACTION_SECTIONS) {
    if (section.key === "all") continue;

    const count = counts[section.key];
    if (count === 0) continue;

    notifications.push({
      id: `action:${section.key}:${count}`,
      tab: "actions",
      title: section.shortLabel,
      message: `${count} ${count === 1 ? "person needs" : "people need"} ${section.label.toLowerCase()}`,
      href: growthTrackActionsUrl(section.key),
      sortKey: `0-${section.key}`,
    });
  }

  return notifications;
}

export function buildNewcomerNotifications(people: Person[]): AppNotification[] {
  const newcomers = people
    .filter(
      person =>
        person.status === "Active" &&
        person.membershipType === "Attender" &&
        isAttenderNewComer(getPersonVisitDate(person)),
    )
    .sort(
      (a, b) =>
        new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
    );

  if (newcomers.length === 0) return [];

  if (newcomers.length === 1) {
    const person = newcomers[0];
    return [
      {
        id: `newcomer:${person.id}`,
        tab: "actions",
        title: "New comer",
        message: `${person.name} joined on ${formatShortDate(person.joinDate)}`,
        href: `/people/${person.id}`,
        sortKey: `1-${person.joinDate}-${person.id}`,
      },
    ];
  }

  return [
    {
      id: `newcomers:summary:${newcomers.length}`,
      tab: "actions",
      title: "New comers",
      message: `${newcomers.length} attenders joined in the last 30 days`,
      href: "/workers",
      sortKey: `1-summary-${newcomers[0]?.joinDate ?? ""}`,
    },
  ];
}

export function buildAttendanceNotifications(
  attendanceRows: ServiceAttendanceRow[],
  primarySundayServiceId: string | undefined,
  mostRecentSunday = getMostRecentSunday(),
): AppNotification[] {
  if (!primarySundayServiceId) return [];

  const hasRecord = attendanceRows.some(
    row =>
      row.serviceCategory === "sunday" &&
      row.serviceId === primarySundayServiceId &&
      row.date === mostRecentSunday,
  );

  if (hasRecord) return [];

  return [
    {
      id: `attendance:missing:${mostRecentSunday}`,
      tab: "actions",
      title: "Record Sunday attendance",
      message: `No attendance recorded for ${formatShortDate(mostRecentSunday)}`,
      href: "/service-attendance",
      sortKey: `2-${mostRecentSunday}`,
    },
  ];
}

export function buildUpcomingNotifications(events: ChurchEvent[]): AppNotification[] {
  return events
    .filter(
      event =>
        event.status !== "cancelled" &&
        event.status !== "draft" &&
        deriveEventTiming(event) !== "completed",
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 8)
    .map(event => {
      const timing = deriveEventTiming(event);
      return {
        id: `event:${timing}:${event.id}:${event.startDate}`,
        tab: "upcoming" as const,
        title: event.title,
        message:
          timing === "ongoing"
            ? `Happening now · ${formatEventDateRange(event)}`
            : `Starts ${formatShortDate(event.startDate)} · ${event.type}`,
        href: `/event-attendance/${event.id}`,
        sortKey: `${event.startDate}-${event.id}`,
      };
    });
}

export type BuildNotificationsInput = {
  growthPeople: GrowthTrackPerson[];
  people: Person[];
  attendanceRows: ServiceAttendanceRow[];
  primarySundayServiceId: string | undefined;
  events: ChurchEvent[];
};

export function buildNotifications(input: BuildNotificationsInput): AppNotification[] {
  return [
    ...buildActionNotifications(input.growthPeople),
    ...buildNewcomerNotifications(input.people),
    ...buildAttendanceNotifications(
      input.attendanceRows,
      input.primarySundayServiceId,
    ),
    ...buildUpcomingNotifications(input.events),
  ].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}
