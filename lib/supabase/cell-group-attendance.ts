import type { SupabaseClient } from "@supabase/supabase-js";

export type CellGroupSession = {
  id: string;
  cellGroupId: string;
  sessionDate: string;
  leaderPersonId: string | null;
  leaderName: string;
  location: string;
  attendeePersonIds: string[];
};

type DbCellGroupSession = {
  id: string;
  cell_group_id: string;
  session_date: string;
  leader_person_id: string | null;
  leader_name: string;
  location: string;
  cell_group_session_attendees: { person_id: string }[];
};

function toCellGroupSession(row: DbCellGroupSession): CellGroupSession {
  return {
    id: row.id,
    cellGroupId: row.cell_group_id,
    sessionDate: row.session_date,
    leaderPersonId: row.leader_person_id,
    leaderName: row.leader_name,
    location: row.location,
    attendeePersonIds: (row.cell_group_session_attendees ?? []).map(
      attendee => attendee.person_id,
    ),
  };
}

export async function fetchCellGroupSessions(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<CellGroupSession[]> {
  const { data, error } = await supabase
    .from("cell_group_sessions")
    .select(
      `
      id,
      cell_group_id,
      session_date,
      leader_person_id,
      leader_name,
      location,
      cell_group_session_attendees ( person_id )
    `,
    )
    .eq("organization_id", organizationId)
    .order("session_date", { ascending: false });

  if (error) throw error;
  return (data as DbCellGroupSession[]).map(toCellGroupSession);
}

export type RecordCellGroupAttendanceInput = {
  cellGroupId: string;
  date: string;
  leaderPersonId: string;
  leaderName: string;
  location: string;
  personIds: string[];
};

export async function recordCellGroupAttendance(
  supabase: SupabaseClient,
  organizationId: string,
  input: RecordCellGroupAttendanceInput,
): Promise<{ sessionId: string }> {
  const { data, error } = await supabase.rpc("record_cell_group_attendance", {
    p_organization_id: organizationId,
    p_cell_group_id: input.cellGroupId,
    p_session_date: input.date,
    p_leader_person_id: input.leaderPersonId,
    p_leader_name: input.leaderName.trim(),
    p_location: input.location.trim(),
    p_person_ids: [...new Set(input.personIds)],
  });

  if (error) throw error;
  return { sessionId: data as string };
}
