export const DEFAULT_SERVICE_START_TIME = "09:00";
export const ON_TIME_GRACE_MINUTES = 5;
export const EARLY_TOGGLE_OFFSET_MINUTES = 15;
export const LATE_TOGGLE_OFFSET_MINUTES = 15;

export type AttendeeSelectionStatus = "member" | "new";
export type ArrivalStatus = "early" | "on-time" | "late";
export type WorkflowStep = 1 | 2 | 3;

export type GuestName = {
  firstName: string;
  lastName: string;
};

export type SelectedAttendee = {
  key: string;
  name: string;
  householdName: string;
  status: AttendeeSelectionStatus;
  personId?: string;
  guestName?: GuestName;
  timeOfArrival: string;
};

export type NewAttendanceAttendee = {
  personId?: string;
  guestName?: GuestName;
  status: AttendeeSelectionStatus;
  timeOfArrival: string | null;
};

export type AttendanceOverviewStats = {
  total: number;
  members: number;
  newGuests: number;
  early: number;
  onTime: number;
  late: number;
};

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesToTime(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function addMinutesToTime(time: string, offsetMinutes: number): string {
  return formatMinutesToTime(parseTimeToMinutes(time) + offsetMinutes);
}

export function classifyArrival(
  arrivalTime: string | null | undefined,
  serviceStartTime: string,
): ArrivalStatus | null {
  if (!arrivalTime) return null;

  const diffMinutes =
    parseTimeToMinutes(arrivalTime) - parseTimeToMinutes(serviceStartTime);

  if (diffMinutes < 0) return "early";
  if (diffMinutes <= ON_TIME_GRACE_MINUTES) return "on-time";
  return "late";
}

export function getToggleTime(
  serviceStartTime: string,
  toggle: ArrivalStatus,
): string {
  switch (toggle) {
    case "early":
      return addMinutesToTime(serviceStartTime, -EARLY_TOGGLE_OFFSET_MINUTES);
    case "on-time":
      return serviceStartTime;
    case "late":
      return addMinutesToTime(serviceStartTime, LATE_TOGGLE_OFFSET_MINUTES);
  }
}

export function parseGuestName(
  input: string,
): { firstName: string; lastName: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "Guest" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function formatGuestName(guest: GuestName): string {
  return [guest.firstName, guest.lastName].filter(Boolean).join(" ");
}

export function createGuestKey(): string {
  return `guest-${crypto.randomUUID()}`;
}

export function buildSelectedAttendeesFromSelection(
  selectedKeys: string[],
  peopleById: Map<
    string,
    { id: string; name: string; householdName: string }
  >,
  guestsByKey: Map<string, GuestName>,
  serviceStartTime: string,
): SelectedAttendee[] {
  return selectedKeys.map((key) => {
    if (key.startsWith("guest-")) {
      const guestName = guestsByKey.get(key);
      return {
        key,
        name: guestName ? formatGuestName(guestName) : "Guest",
        householdName: "Visitor",
        status: "new" as const,
        guestName,
        timeOfArrival: serviceStartTime,
      };
    }

    const person = peopleById.get(key);
    return {
      key,
      name: person?.name ?? "Unknown",
      householdName: person?.householdName ?? "",
      status: "member" as const,
      personId: key,
      timeOfArrival: serviceStartTime,
    };
  });
}

export function computeOverviewStats(
  attendees: SelectedAttendee[],
  serviceStartTime: string,
): AttendanceOverviewStats {
  const stats: AttendanceOverviewStats = {
    total: attendees.length,
    members: 0,
    newGuests: 0,
    early: 0,
    onTime: 0,
    late: 0,
  };

  for (const attendee of attendees) {
    if (attendee.status === "new") {
      stats.newGuests += 1;
    } else {
      stats.members += 1;
    }

    const arrivalStatus = classifyArrival(
      attendee.timeOfArrival,
      serviceStartTime,
    );
    if (arrivalStatus === "early") stats.early += 1;
    else if (arrivalStatus === "on-time") stats.onTime += 1;
    else if (arrivalStatus === "late") stats.late += 1;
  }

  return stats;
}

export function toNewAttendanceAttendees(
  attendees: SelectedAttendee[],
): NewAttendanceAttendee[] {
  return attendees.map((attendee) => ({
    personId: attendee.personId,
    guestName: attendee.guestName,
    status: attendee.status,
    timeOfArrival: attendee.timeOfArrival || null,
  }));
}

export function formatArrivalStatusLabel(status: ArrivalStatus): string {
  switch (status) {
    case "early":
      return "Early";
    case "on-time":
      return "On-Time";
    case "late":
      return "Late";
  }
}
