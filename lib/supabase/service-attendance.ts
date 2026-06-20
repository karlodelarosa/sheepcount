import type { SupabaseClient } from "@supabase/supabase-js";
import type { MembershipType } from "@/lib/people";
import {
  promoteFirstTimeSundayAttendees,
} from "@/lib/supabase/growth-track";

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
    const { error: peopleError } = await supabase
      .from("people")
      .update({
        last_attendance: input.date,
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId)
      .in("id", personIds);

    if (peopleError) throw peopleError;
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
