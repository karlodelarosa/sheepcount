import type { SupabaseClient } from "@supabase/supabase-js";

export type ChurchEventType = "VBS" | "Camp" | "Retreat" | "Conference";

export type ChurchEventStatus = "draft" | "published" | "completed" | "cancelled";

export type EventRole = "Attendee" | "Volunteer" | "Core_Leader";

export type AttendanceStatus =
  | "registered"
  | "checked_in"
  | "attended"
  | "no_show"
  | "cancelled";

export type ChurchEvent = {
  id: string;
  title: string;
  description: string;
  type: ChurchEventType;
  startDate: string;
  endDate: string;
  status: ChurchEventStatus;
};

export type ChurchEventRegistration = {
  id: string;
  eventId: string;
  personId: string;
  parentPersonId: string | null;
  roleInEvent: EventRole;
  attendanceStatus: AttendanceStatus;
  medicalNotes: string;
  dietaryRestrictions: string;
  registeredDate: string;
};

type DbChurchEvent = {
  id: string;
  title: string;
  description: string;
  type: ChurchEventType;
  start_date: string;
  end_date: string;
  status: ChurchEventStatus;
};

type DbChurchEventRegistration = {
  id: string;
  event_id: string;
  person_id: string;
  parent_person_id: string | null;
  role_in_event: EventRole;
  attendance_status: AttendanceStatus;
  medical_notes: string;
  dietary_restrictions: string;
  registered_date: string;
};

function toEvent(row: DbChurchEvent): ChurchEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
  };
}

function toRegistration(row: DbChurchEventRegistration): ChurchEventRegistration {
  return {
    id: row.id,
    eventId: row.event_id,
    personId: row.person_id,
    parentPersonId: row.parent_person_id,
    roleInEvent: row.role_in_event,
    attendanceStatus: row.attendance_status,
    medicalNotes: row.medical_notes,
    dietaryRestrictions: row.dietary_restrictions,
    registeredDate: row.registered_date,
  };
}

export async function fetchChurchEvents(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ChurchEvent[]> {
  const { data, error } = await supabase
    .from("church_events")
    .select("id, title, description, type, start_date, end_date, status")
    .eq("organization_id", organizationId)
    .order("start_date", { ascending: false });

  if (error) throw error;
  return (data as DbChurchEvent[]).map(toEvent);
}

export async function fetchEventRegistrations(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ChurchEventRegistration[]> {
  const { data, error } = await supabase
    .from("church_event_registrations")
    .select(
      "id, event_id, person_id, parent_person_id, role_in_event, attendance_status, medical_notes, dietary_restrictions, registered_date, church_events!inner(organization_id)",
    )
    .eq("church_events.organization_id", organizationId);

  if (error) throw error;
  return (data as DbChurchEventRegistration[]).map(toRegistration);
}

export type CreateChurchEventInput = {
  title: string;
  description?: string;
  type: ChurchEventType;
  startDate: string;
  endDate: string;
  status?: ChurchEventStatus;
};

export async function createChurchEvent(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateChurchEventInput,
): Promise<ChurchEvent> {
  const { data, error } = await supabase
    .from("church_events")
    .insert({
      organization_id: organizationId,
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      type: input.type,
      start_date: input.startDate,
      end_date: input.endDate,
      status: input.status ?? "draft",
    })
    .select("id, title, description, type, start_date, end_date, status")
    .single();

  if (error) throw error;
  return toEvent(data as DbChurchEvent);
}

export type UpdateChurchEventInput = {
  eventId: string;
  title?: string;
  description?: string;
  type?: ChurchEventType;
  startDate?: string;
  endDate?: string;
  status?: ChurchEventStatus;
};

export async function updateChurchEvent(
  supabase: SupabaseClient,
  input: UpdateChurchEventInput,
): Promise<ChurchEvent> {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.description !== undefined) payload.description = input.description.trim();
  if (input.type !== undefined) payload.type = input.type;
  if (input.startDate !== undefined) payload.start_date = input.startDate;
  if (input.endDate !== undefined) payload.end_date = input.endDate;
  if (input.status !== undefined) payload.status = input.status;

  const { data, error } = await supabase
    .from("church_events")
    .update(payload)
    .eq("id", input.eventId)
    .select("id, title, description, type, start_date, end_date, status")
    .single();

  if (error) throw error;
  return toEvent(data as DbChurchEvent);
}

export type RegisterForEventInput = {
  eventId: string;
  personId: string;
  parentPersonId?: string;
  roleInEvent: EventRole;
  medicalNotes?: string;
  dietaryRestrictions?: string;
};

export async function registerForEvent(
  supabase: SupabaseClient,
  input: RegisterForEventInput,
): Promise<ChurchEventRegistration> {
  const { data, error } = await supabase
    .from("church_event_registrations")
    .insert({
      event_id: input.eventId,
      person_id: input.personId,
      parent_person_id: input.parentPersonId ?? null,
      role_in_event: input.roleInEvent,
      medical_notes: input.medicalNotes?.trim() ?? "",
      dietary_restrictions: input.dietaryRestrictions?.trim() ?? "",
    })
    .select(
      "id, event_id, person_id, parent_person_id, role_in_event, attendance_status, medical_notes, dietary_restrictions, registered_date",
    )
    .single();

  if (error) throw error;
  return toRegistration(data as DbChurchEventRegistration);
}

export type UpdateEventRegistrationInput = {
  registrationId: string;
  attendanceStatus?: AttendanceStatus;
  medicalNotes?: string;
  dietaryRestrictions?: string;
  roleInEvent?: EventRole;
};

export async function updateEventRegistration(
  supabase: SupabaseClient,
  input: UpdateEventRegistrationInput,
): Promise<ChurchEventRegistration> {
  const payload: Record<string, unknown> = {};
  if (input.attendanceStatus !== undefined) {
    payload.attendance_status = input.attendanceStatus;
  }
  if (input.medicalNotes !== undefined) {
    payload.medical_notes = input.medicalNotes.trim();
  }
  if (input.dietaryRestrictions !== undefined) {
    payload.dietary_restrictions = input.dietaryRestrictions.trim();
  }
  if (input.roleInEvent !== undefined) {
    payload.role_in_event = input.roleInEvent;
  }

  const { data, error } = await supabase
    .from("church_event_registrations")
    .update(payload)
    .eq("id", input.registrationId)
    .select(
      "id, event_id, person_id, parent_person_id, role_in_event, attendance_status, medical_notes, dietary_restrictions, registered_date",
    )
    .single();

  if (error) throw error;
  return toRegistration(data as DbChurchEventRegistration);
}

export async function removeEventRegistration(
  supabase: SupabaseClient,
  registrationId: string,
): Promise<void> {
  const { error } = await supabase
    .from("church_event_registrations")
    .delete()
    .eq("id", registrationId);

  if (error) throw error;
}
