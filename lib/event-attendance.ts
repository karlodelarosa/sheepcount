"use client";

import { useCallback, useEffect, useState } from "react";
import { mockPeople } from "@/components/mock-data";

export type EventType =
  | "Retreat"
  | "Youth Camp"
  | "Conference"
  | "Outreach"
  | "Workshop"
  | "Other";

export type EventCategory =
  | "Youth"
  | "Children"
  | "Adults"
  | "All Ages"
  | "Outreach";

export type EventStatus = "Upcoming" | "Ongoing" | "Completed";

export interface ChurchEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location: string;
  status: EventStatus;
}

export interface EventAttendanceRecord {
  id: string;
  eventId: string;
  date: string;
  sessionLabel: string;
  personId: string;
}

export const seedEvents: ChurchEvent[] = [
  {
    id: "ev1",
    name: "Youth Camp 2024",
    description: "Three-day youth camp with worship, games, and discipleship",
    type: "Youth Camp",
    category: "Youth",
    startDate: "2024-07-12",
    endDate: "2024-07-14",
    location: "Camp Riverside",
    status: "Completed",
  },
  {
    id: "ev2",
    name: "Women's Retreat 2024",
    description: "Annual women's retreat for spiritual renewal and fellowship",
    type: "Retreat",
    category: "Adults",
    startDate: "2024-11-08",
    endDate: "2024-11-10",
    location: "Mountain View Retreat Center",
    status: "Upcoming",
  },
  {
    id: "ev3",
    name: "Youth Lock-In",
    description: "Overnight event with games, worship, and fellowship",
    type: "Workshop",
    category: "Youth",
    startDate: "2024-10-25",
    endDate: "2024-10-26",
    location: "Church Fellowship Hall",
    status: "Completed",
  },
  {
    id: "ev4",
    name: "Community Outreach Day",
    description: "Neighborhood service and evangelism outreach",
    type: "Outreach",
    category: "Outreach",
    startDate: "2024-09-14",
    endDate: "2024-09-14",
    location: "Downtown Springfield",
    status: "Completed",
  },
];

export const seedEventAttendance: EventAttendanceRecord[] = [
  { id: "ea1", eventId: "ev3", date: "2024-10-25", sessionLabel: "Check-in", personId: "3" },
  { id: "ea2", eventId: "ev3", date: "2024-10-25", sessionLabel: "Check-in", personId: "11" },
  { id: "ea3", eventId: "ev3", date: "2024-10-25", sessionLabel: "Check-in", personId: "12" },
  { id: "ea4", eventId: "ev3", date: "2024-10-25", sessionLabel: "Evening Worship", personId: "3" },
  { id: "ea5", eventId: "ev3", date: "2024-10-25", sessionLabel: "Evening Worship", personId: "11" },
  { id: "ea6", eventId: "ev3", date: "2024-10-26", sessionLabel: "Morning Session", personId: "3" },
  { id: "ea7", eventId: "ev3", date: "2024-10-26", sessionLabel: "Morning Session", personId: "11" },
  { id: "ea8", eventId: "ev3", date: "2024-10-26", sessionLabel: "Morning Session", personId: "12" },
  { id: "ea9", eventId: "ev1", date: "2024-07-12", sessionLabel: "Day 1 - Arrival", personId: "3" },
  { id: "ea10", eventId: "ev1", date: "2024-07-12", sessionLabel: "Day 1 - Arrival", personId: "11" },
  { id: "ea11", eventId: "ev1", date: "2024-07-13", sessionLabel: "Day 2 - Main Session", personId: "3" },
  { id: "ea12", eventId: "ev1", date: "2024-07-13", sessionLabel: "Day 2 - Main Session", personId: "11" },
  { id: "ea13", eventId: "ev4", date: "2024-09-14", sessionLabel: "Morning Outreach", personId: "4" },
  { id: "ea14", eventId: "ev4", date: "2024-09-14", sessionLabel: "Morning Outreach", personId: "5" },
  { id: "ea15", eventId: "ev4", date: "2024-09-14", sessionLabel: "Morning Outreach", personId: "6" },
];

const STORAGE_KEY = "church-event-attendance";

type StoredData = {
  events: ChurchEvent[];
  attendance: EventAttendanceRecord[];
};

function loadData(): StoredData {
  if (typeof window === "undefined") {
    return { events: seedEvents, attendance: seedEventAttendance };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return { events: seedEvents, attendance: seedEventAttendance };
}

function saveData(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function deriveStatus(startDate: string, endDate: string): EventStatus {
  const today = new Date().toISOString().split("T")[0];
  if (today < startDate) return "Upcoming";
  if (today > endDate) return "Completed";
  return "Ongoing";
}

export type CreateEventInput = {
  name: string;
  description: string;
  type: EventType;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location: string;
};

export function useEventAttendance() {
  const [events, setEvents] = useState<ChurchEvent[]>(seedEvents);
  const [attendance, setAttendance] =
    useState<EventAttendanceRecord[]>(seedEventAttendance);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const data = loadData();
    setEvents(data.events);
    setAttendance(data.attendance);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveData({ events, attendance });
  }, [events, attendance, hydrated]);

  const createEvent = useCallback((input: CreateEventInput) => {
    const event: ChurchEvent = {
      id: `ev-${Date.now()}`,
      ...input,
      status: deriveStatus(input.startDate, input.endDate),
    };
    setEvents(prev => [event, ...prev]);
    return event;
  }, []);

  const recordAttendance = useCallback(
    (
      eventId: string,
      date: string,
      sessionLabel: string,
      personIds: string[],
    ) => {
      const records: EventAttendanceRecord[] = personIds.map(pid => ({
        id: `ea-${eventId}-${date}-${sessionLabel}-${pid}`,
        eventId,
        date,
        sessionLabel,
        personId: pid,
      }));

      setAttendance(prev => {
        const filtered = prev.filter(
          r =>
            !(
              r.eventId === eventId &&
              r.date === date &&
              r.sessionLabel === sessionLabel
            ),
        );
        return [...records, ...filtered];
      });
    },
    [],
  );

  const getEventSessions = useCallback(
    (eventId: string) => {
      const records = attendance.filter(r => r.eventId === eventId);
      const sessions = records.reduce(
        (acc, r) => {
          const key = `${r.date}---${r.sessionLabel}`;
          if (!acc[key]) {
            acc[key] = {
              date: r.date,
              sessionLabel: r.sessionLabel,
              personIds: [],
            };
          }
          acc[key].personIds.push(r.personId);
          return acc;
        },
        {} as Record<
          string,
          { date: string; sessionLabel: string; personIds: string[] }
        >,
      );
      return Object.values(sessions).sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime() ||
          a.sessionLabel.localeCompare(b.sessionLabel),
      );
    },
    [attendance],
  );

  const getUniqueAttendees = useCallback(
    (eventId: string) => {
      const ids = new Set(
        attendance.filter(r => r.eventId === eventId).map(r => r.personId),
      );
      return mockPeople.filter(p => ids.has(p.id));
    },
    [attendance],
  );

  return {
    events,
    attendance,
    hydrated,
    createEvent,
    recordAttendance,
    getEventSessions,
    getUniqueAttendees,
  };
}
