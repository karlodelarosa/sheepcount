import type { AddPersonInput, Person } from "@/lib/people";
import type { NewAttendanceAttendee } from "@/app/(protected)/service-attendance/_lib/attendance-workflow";

/**
 * Single choke point for persisting attendance from the mobile flows.
 *
 * Every mobile save routes through one of these wrappers rather than calling the
 * data hooks inline. Today they behave identically to an online write; if offline
 * recording is added later, a queue can intercept here without touching any of
 * the flow UI. Keep the flows calling these — do not call the hooks directly.
 */

interface AddPersonFn {
  (input: AddPersonInput, options: { quiet: boolean }): Promise<Person | null>;
}

export type NewCellGroupAttendee = {
  key: string;
  firstName: string;
  lastName: string;
  phone: string;
  socialContact: string;
  birthdate: string;
};

export function isValidNewCellGroupAttendee(
  attendee: Omit<NewCellGroupAttendee, "key">,
): boolean {
  return Boolean(
    attendee.firstName.trim() &&
      attendee.lastName.trim() &&
      (attendee.phone.trim() || attendee.socialContact.trim()),
  );
}

export interface SubmitCellGroupAttendanceParams {
  cellGroupId: string;
  date: string;
  leaderPersonId: string;
  leaderName: string;
  location: string;
  existingPersonIds: string[];
  enrollExistingPersonIds: string[];
  newAttendees: NewCellGroupAttendee[];
  addPerson: AddPersonFn;
  assignCellGroupMember: (
    cellGroupId: string,
    personId: string,
    role?: "Leader" | "Member",
  ) => Promise<unknown | null>;
  recordCellGroupAttendance: (input: {
    cellGroupId: string;
    date: string;
    leaderPersonId: string;
    leaderName: string;
    location: string;
    personIds: string[];
  }) => Promise<boolean>;
}

export async function submitCellGroupAttendance({
  cellGroupId,
  date,
  leaderPersonId,
  leaderName,
  location,
  existingPersonIds,
  enrollExistingPersonIds,
  newAttendees,
  addPerson,
  assignCellGroupMember,
  recordCellGroupAttendance,
}: SubmitCellGroupAttendanceParams): Promise<boolean> {
  if (
    !cellGroupId ||
    !date ||
    !leaderPersonId ||
    !leaderName.trim() ||
    !location.trim()
  ) {
    return false;
  }

  for (const personId of enrollExistingPersonIds) {
    const membership = await assignCellGroupMember(
      cellGroupId,
      personId,
      "Member",
    );
    if (!membership) return false;
  }

  const personIds = [...existingPersonIds];
  for (const attendee of newAttendees) {
    const person = await addPerson(
      {
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        phone: attendee.phone || undefined,
        socialContact: attendee.socialContact || undefined,
        birthdate: attendee.birthdate || undefined,
        firstAttendance: date,
        membershipType: "Prospect",
        evangelismStage: "Small Group",
      },
      { quiet: true },
    );
    if (!person) return false;

    const membership = await assignCellGroupMember(
      cellGroupId,
      person.id,
      "Member",
    );
    if (!membership) return false;
    personIds.push(person.id);
  }

  if (personIds.length === 0) return false;
  return recordCellGroupAttendance({
    cellGroupId,
    date,
    leaderPersonId,
    leaderName,
    location,
    personIds,
  });
}

interface RecordServiceAttendanceFn {
  (input: {
    serviceId: string;
    date: string;
    attendees: { personId: string; timeOfArrival: string | null }[];
  }): Promise<string | null>;
}

export interface SubmitServiceAttendanceParams {
  serviceId: string;
  date: string;
  attendees: NewAttendanceAttendee[];
  addPerson: AddPersonFn;
  recordAttendance: RecordServiceAttendanceFn;
}

/**
 * Resolves any newly-added guests into people, then records the session.
 * Returns the created session id, or null if nothing could be saved.
 */
export async function submitServiceAttendance({
  serviceId,
  date,
  attendees,
  addPerson,
  recordAttendance,
}: SubmitServiceAttendanceParams): Promise<string | null> {
  const resolved: { personId: string; timeOfArrival: string | null }[] = [];

  for (const attendee of attendees) {
    if (attendee.status === "new" && attendee.guestName) {
      const person = await addPerson(
        {
          firstName: attendee.guestName.firstName,
          lastName: attendee.guestName.lastName,
          membershipType: "Prospect",
        },
        { quiet: true },
      );
      if (!person) return null;

      resolved.push({
        personId: person.id,
        timeOfArrival: attendee.timeOfArrival,
      });
      continue;
    }

    if (attendee.personId) {
      resolved.push({
        personId: attendee.personId,
        timeOfArrival: attendee.timeOfArrival,
      });
    }
  }

  if (resolved.length === 0) return null;

  return recordAttendance({ serviceId, date, attendees: resolved });
}

export interface SubmitLifeGroupAttendanceParams {
  lifeGroupId: string;
  date: string;
  personIds: string[];
  recordLifeGroupAttendance: (input: {
    lifeGroupId: string;
    date: string;
    personIds: string[];
    notes?: string;
  }) => Promise<boolean>;
}

export async function submitLifeGroupAttendance({
  lifeGroupId,
  date,
  personIds,
  recordLifeGroupAttendance,
}: SubmitLifeGroupAttendanceParams): Promise<boolean> {
  if (!lifeGroupId || !date || personIds.length === 0) return false;
  return recordLifeGroupAttendance({ lifeGroupId, date, personIds });
}

export interface SubmitEventAttendanceParams {
  eventId: string;
  date: string;
  sessionLabel: string;
  personIds: string[];
  recordEventAttendance: (input: {
    eventId: string;
    date: string;
    sessionLabel: string;
    personIds: string[];
  }) => Promise<boolean>;
}

export async function submitEventAttendance({
  eventId,
  date,
  sessionLabel,
  personIds,
  recordEventAttendance,
}: SubmitEventAttendanceParams): Promise<boolean> {
  if (!eventId || !date || !sessionLabel || personIds.length === 0) {
    return false;
  }
  return recordEventAttendance({ eventId, date, sessionLabel, personIds });
}
