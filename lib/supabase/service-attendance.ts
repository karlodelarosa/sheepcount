import type { SupabaseClient } from "@supabase/supabase-js";
import type { MembershipType } from "@/lib/people";
import {
  promoteFirstTimeSundayAttendees,
} from "@/lib/supabase/growth-track";

const DEFAULT_SERVICE_START_TIME = "09:00";

export type ServiceCategory = "sunday" | "life_group";

export type ServiceType = {
  id: string;
  name: string;
  category: ServiceCategory;
  sortOrder: number;
};

export type ServiceAttendanceRow = {
  id: string;
  sessionId: string;
  serviceId: string;
  serviceType: string;
  serviceCategory: ServiceCategory;
  date: string;
  personId: string;
};

export type AttendanceSearchRow = {
  attendanceId: string;
  sessionId: string;
  serviceId: string;
  serviceType: string;
  date: string;
  personId: string;
  personName: string;
  personStatus: MembershipType | string;
};

export type SessionAttendee = {
  attendanceId: string;
  personId: string;
  name: string;
  householdName: string;
  membershipType: MembershipType | string;
  timeOfArrival: string | null;
};

export type SessionDetail = {
  sessionId: string;
  serviceId: string;
  serviceType: string;
  serviceCategory: ServiceCategory;
  date: string;
  serviceStartTime: string;
  attendees: SessionAttendee[];
};

type DbServiceType = {
  id: string;
  name: string;
  category: ServiceCategory;
  sort_order: number;
};

type DbSessionWithAttendees = {
  id: string;
  session_date: string;
  service_types: {
    id: string;
    name: string;
    category: ServiceCategory;
  };
  service_session_attendees: {
    id: string;
    person_id: string;
    time_of_arrival: string | null;
  }[];
};

function normalizeTimeValue(time: string | null | undefined): string {
  if (!time) return DEFAULT_SERVICE_START_TIME;
  return time.slice(0, 5);
}

function toDbTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutesToTime(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function shiftTimeOfArrival(
  timeOfArrival: string | null,
  deltaMinutes: number,
): string | null {
  if (!timeOfArrival || deltaMinutes === 0) return timeOfArrival;
  return formatMinutesToTime(parseTimeToMinutes(timeOfArrival) + deltaMinutes);
}

function toServiceType(row: DbServiceType): ServiceType {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    sortOrder: row.sort_order,
  };
}

function flattenSessionRows(
  sessions: DbSessionWithAttendees[],
): ServiceAttendanceRow[] {
  const rows: ServiceAttendanceRow[] = [];

  for (const session of sessions) {
    const serviceType = Array.isArray(session.service_types)
      ? session.service_types[0]
      : session.service_types;

    for (const attendee of session.service_session_attendees ?? []) {
      rows.push({
        id: attendee.id,
        sessionId: session.id,
        serviceId: serviceType.id,
        serviceType: serviceType.name,
        serviceCategory: serviceType.category,
        date: session.session_date,
        personId: attendee.person_id,
      });
    }
  }

  return rows;
}

export async function ensureDefaultServiceTypes(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<void> {
  const { error } = await supabase.rpc("seed_default_service_types", {
    org_id: organizationId,
  });
  if (error) throw error;
}

export async function fetchServiceTypes(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ServiceType[]> {
  await ensureDefaultServiceTypes(supabase, organizationId);

  const { data, error } = await supabase
    .from("service_types")
    .select("id, name, category, sort_order")
    .eq("organization_id", organizationId)
    .order("sort_order")
    .order("name");

  if (error) throw error;
  return (data as DbServiceType[]).map(toServiceType);
}

export async function fetchAttendanceRows(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ServiceAttendanceRow[]> {
  const { data, error } = await supabase
    .from("service_sessions")
    .select(
      `
      id,
      session_date,
      service_types!inner ( id, name, category ),
      service_session_attendees ( id, person_id, time_of_arrival )
    `,
    )
    .eq("organization_id", organizationId)
    .order("session_date", { ascending: false });

  if (error) throw error;
  return flattenSessionRows((data ?? []) as unknown as DbSessionWithAttendees[]);
}

export type AttendanceEntry = {
  personId: string;
  timeOfArrival?: string | null;
};

export async function recordAttendance(
  supabase: SupabaseClient,
  organizationId: string,
  input: {
    serviceId: string;
    date: string;
    attendees: AttendanceEntry[];
    serviceCategory: ServiceCategory;
  },
): Promise<{ sessionId: string }> {
  const { data: session, error: sessionError } = await supabase
    .from("service_sessions")
    .upsert(
      {
        organization_id: organizationId,
        service_type_id: input.serviceId,
        session_date: input.date,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,service_type_id,session_date" },
    )
    .select("id")
    .single();

  if (sessionError) throw sessionError;

  const personIds = input.attendees.map((attendee) => attendee.personId);

  if (input.serviceCategory === "sunday" && personIds.length > 0) {
    await promoteFirstTimeSundayAttendees(
      supabase,
      organizationId,
      personIds,
    );
  }

  const attendeeRows = input.attendees.map((attendee) => ({
    session_id: session.id,
    person_id: attendee.personId,
    time_of_arrival: attendee.timeOfArrival ?? null,
  }));

  const { error: attendeeError } = await supabase
    .from("service_session_attendees")
    .upsert(attendeeRows, {
      onConflict: "session_id,person_id",
      ignoreDuplicates: false,
    });

  if (attendeeError) throw attendeeError;

  if (input.serviceCategory === "sunday" && personIds.length > 0) {
    await updatePeopleAttendanceDates(
      supabase,
      organizationId,
      personIds,
      input.date,
    );
  }

  return { sessionId: session.id };
}

export async function fetchSessionDetail(
  supabase: SupabaseClient,
  organizationId: string,
  serviceId: string,
  date: string,
): Promise<SessionDetail | null> {
  const { data: session, error: sessionError } = await supabase
    .from("service_sessions")
    .select(
      `
      id,
      session_date,
      service_start_time,
      service_types!inner ( id, name, category )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("service_type_id", serviceId)
    .eq("session_date", date)
    .maybeSingle();

  if (sessionError) throw sessionError;
  if (!session) return null;

  const serviceType = Array.isArray(session.service_types)
    ? session.service_types[0]
    : session.service_types;

  const { data: attendees, error: attendeesError } = await supabase
    .from("service_session_attendees")
    .select(
      `
      id,
      person_id,
      time_of_arrival,
      people!inner (
        first_name,
        middle_name,
        last_name,
        membership_type,
        households ( name )
      )
    `,
    )
    .eq("session_id", session.id);

  if (attendeesError) throw attendeesError;

  type DbAttendee = {
    id: string;
    person_id: string;
    time_of_arrival: string | null;
    people:
      | {
          first_name: string;
          middle_name: string | null;
          last_name: string;
          membership_type: string;
          households: { name: string } | { name: string }[] | null;
        }
      | {
          first_name: string;
          middle_name: string | null;
          last_name: string;
          membership_type: string;
          households: { name: string } | { name: string }[] | null;
        }[];
  };

  const mappedAttendees: SessionAttendee[] = (
    (attendees ?? []) as unknown as DbAttendee[]
  ).map((row) => {
    const person = Array.isArray(row.people) ? row.people[0] : row.people;
    const household = person.households
      ? Array.isArray(person.households)
        ? person.households[0]
        : person.households
      : null;
    const name = [person.first_name, person.middle_name, person.last_name]
      .filter(Boolean)
      .join(" ");

    return {
      attendanceId: row.id,
      personId: row.person_id,
      name,
      householdName: household?.name ?? "",
      membershipType: person.membership_type,
      timeOfArrival: row.time_of_arrival,
    };
  });

  return {
    sessionId: session.id,
    serviceId: serviceType.id,
    serviceType: serviceType.name,
    serviceCategory: serviceType.category,
    date: session.session_date,
    serviceStartTime: normalizeTimeValue(
      (session as { service_start_time?: string | null }).service_start_time,
    ),
    attendees: mappedAttendees,
  };
}

export async function removeSessionAttendee(
  supabase: SupabaseClient,
  attendanceId: string,
): Promise<void> {
  const { error } = await supabase
    .from("service_session_attendees")
    .delete()
    .eq("id", attendanceId);

  if (error) throw error;
}

async function updatePeopleAttendanceDates(
  supabase: SupabaseClient,
  organizationId: string,
  personIds: string[],
  sessionDate: string,
): Promise<void> {
  if (personIds.length === 0) return;

  const { error: peopleError } = await supabase
    .from("people")
    .update({
      last_attendance: sessionDate,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .in("id", personIds);

  if (peopleError) throw peopleError;

  const { error: firstAttendanceError } = await supabase
    .from("people")
    .update({
      first_attendance: sessionDate,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .in("id", personIds)
    .is("first_attendance", null);

  if (firstAttendanceError) throw firstAttendanceError;
}

export async function updateSessionDetails(
  supabase: SupabaseClient,
  organizationId: string,
  input: {
    sessionId: string;
    serviceId: string;
    serviceCategory: ServiceCategory;
    date: string;
    serviceStartTime: string;
  },
): Promise<{
  serviceId: string;
  sessionId: string;
  date: string;
  merged: boolean;
}> {
  if (input.serviceId.trim() === "" || input.date.trim() === "") {
    throw new Error("Service type and date are required");
  }

  const { data: current, error: fetchError } = await supabase
    .from("service_sessions")
    .select(
      `
      id,
      service_type_id,
      session_date,
      service_start_time,
      service_types!inner ( category ),
      service_session_attendees ( id, person_id, time_of_arrival )
    `,
    )
    .eq("id", input.sessionId)
    .eq("organization_id", organizationId)
    .single();

  if (fetchError) throw fetchError;

  const currentCategory = (
    Array.isArray(current.service_types)
      ? current.service_types[0]
      : current.service_types
  ).category as ServiceCategory;
  const currentStartTime = normalizeTimeValue(current.service_start_time);
  const identityChanged =
    current.service_type_id !== input.serviceId ||
    current.session_date !== input.date;
  const startTimeChanged = currentStartTime !== input.serviceStartTime;

  if (!identityChanged && !startTimeChanged) {
    return {
      serviceId: input.serviceId,
      sessionId: input.sessionId,
      date: input.date,
      merged: false,
    };
  }

  type DbAttendee = {
    id: string;
    person_id: string;
    time_of_arrival: string | null;
  };
  const attendeeRows = (current.service_session_attendees ?? []) as DbAttendee[];
  const personIds = attendeeRows.map((attendee) => attendee.person_id);
  const timeDelta = startTimeChanged
    ? parseTimeToMinutes(input.serviceStartTime) -
      parseTimeToMinutes(currentStartTime)
    : 0;

  const buildAttendeeRows = (targetSessionId: string) =>
    attendeeRows.map((attendee) => ({
      session_id: targetSessionId,
      person_id: attendee.person_id,
      time_of_arrival: shiftTimeOfArrival(
        attendee.time_of_arrival,
        timeDelta,
      ),
    }));

  if (
    input.serviceCategory === "sunday" &&
    currentCategory !== "sunday" &&
    personIds.length > 0
  ) {
    await promoteFirstTimeSundayAttendees(
      supabase,
      organizationId,
      personIds,
    );
  }

  let resultSessionId = input.sessionId;
  let merged = false;

  if (identityChanged) {
    const { data: existing, error: existingError } = await supabase
      .from("service_sessions")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("service_type_id", input.serviceId)
      .eq("session_date", input.date)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing && existing.id !== input.sessionId) {
      if (attendeeRows.length > 0) {
        const { error: upsertError } = await supabase
          .from("service_session_attendees")
          .upsert(buildAttendeeRows(existing.id), {
            onConflict: "session_id,person_id",
          });

        if (upsertError) throw upsertError;
      }

      const { error: targetUpdateError } = await supabase
        .from("service_sessions")
        .update({
          service_start_time: toDbTime(input.serviceStartTime),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (targetUpdateError) throw targetUpdateError;

      const { error: deleteError } = await supabase
        .from("service_sessions")
        .delete()
        .eq("id", input.sessionId);

      if (deleteError) throw deleteError;

      resultSessionId = existing.id;
      merged = true;
    } else {
      const { error: updateError } = await supabase
        .from("service_sessions")
        .update({
          service_type_id: input.serviceId,
          session_date: input.date,
          service_start_time: toDbTime(input.serviceStartTime),
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.sessionId);

      if (updateError) throw updateError;

      if (startTimeChanged && attendeeRows.length > 0) {
        const { error: attendeeUpdateError } = await supabase
          .from("service_session_attendees")
          .upsert(buildAttendeeRows(input.sessionId), {
            onConflict: "session_id,person_id",
          });

        if (attendeeUpdateError) throw attendeeUpdateError;
      }
    }
  } else {
    const { error: updateError } = await supabase
      .from("service_sessions")
      .update({
        service_start_time: toDbTime(input.serviceStartTime),
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.sessionId);

    if (updateError) throw updateError;

    if (startTimeChanged && attendeeRows.length > 0) {
      const updates = attendeeRows.map((attendee) => ({
        id: attendee.id,
        session_id: input.sessionId,
        person_id: attendee.person_id,
        time_of_arrival: shiftTimeOfArrival(
          attendee.time_of_arrival,
          timeDelta,
        ),
      }));

      const { error: attendeeUpdateError } = await supabase
        .from("service_session_attendees")
        .upsert(updates, { onConflict: "id" });

      if (attendeeUpdateError) throw attendeeUpdateError;
    }
  }

  if (input.serviceCategory === "sunday" && personIds.length > 0) {
    await updatePeopleAttendanceDates(
      supabase,
      organizationId,
      personIds,
      input.date,
    );
  }

  return {
    serviceId: input.serviceId,
    sessionId: resultSessionId,
    date: input.date,
    merged,
  };
}

export async function updateSessionServiceType(
  supabase: SupabaseClient,
  organizationId: string,
  input: {
    sessionId: string;
    newServiceId: string;
    newServiceCategory: ServiceCategory;
  },
): Promise<{ serviceId: string; sessionId: string; merged: boolean }> {
  const { data: current, error: fetchError } = await supabase
    .from("service_sessions")
    .select("session_date, service_start_time")
    .eq("id", input.sessionId)
    .eq("organization_id", organizationId)
    .single();

  if (fetchError) throw fetchError;

  const result = await updateSessionDetails(supabase, organizationId, {
    sessionId: input.sessionId,
    serviceId: input.newServiceId,
    serviceCategory: input.newServiceCategory,
    date: current.session_date,
    serviceStartTime: normalizeTimeValue(current.service_start_time),
  });

  return {
    serviceId: result.serviceId,
    sessionId: result.sessionId,
    merged: result.merged,
  };
}

export async function deleteSession(
  supabase: SupabaseClient,
  organizationId: string,
  sessionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("service_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("organization_id", organizationId);

  if (error) throw error;
}

export function buildSessionPath(serviceId: string, date: string) {
  return `${serviceId}---${date}`;
}

export function parseSessionPath(path: string): {
  serviceId: string;
  date: string;
} | null {
  const separator = "---";
  const index = path.indexOf(separator);
  if (index === -1) return null;

  return {
    serviceId: path.slice(0, index),
    date: path.slice(index + separator.length),
  };
}
