import type { SupabaseClient } from "@supabase/supabase-js";

export type LifeGroupSession = {
  id: string;
  lifeGroupId: string;
  sessionDate: string;
  notes: string | null;
  attendeePersonIds: string[];
};

type DbLifeGroupSession = {
  id: string;
  life_group_id: string;
  session_date: string;
  notes: string | null;
  life_group_session_attendees: { person_id: string }[];
};

function toLifeGroupSession(row: DbLifeGroupSession): LifeGroupSession {
  return {
    id: row.id,
    lifeGroupId: row.life_group_id,
    sessionDate: row.session_date,
    notes: row.notes,
    attendeePersonIds: (row.life_group_session_attendees ?? []).map(
      a => a.person_id,
    ),
  };
}

export async function fetchLifeGroupSessions(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<LifeGroupSession[]> {
  const { data, error } = await supabase
    .from("life_group_sessions")
    .select(
      `
      id,
      life_group_id,
      session_date,
      notes,
      life_group_session_attendees ( person_id )
    `,
    )
    .eq("organization_id", organizationId)
    .order("session_date", { ascending: false });

  if (error) throw error;
  return (data as DbLifeGroupSession[]).map(toLifeGroupSession);
}

export async function recordLifeGroupAttendance(
  supabase: SupabaseClient,
  organizationId: string,
  input: {
    lifeGroupId: string;
    date: string;
    personIds: string[];
    notes?: string;
  },
): Promise<{ sessionId: string }> {
  const { data: session, error: sessionError } = await supabase
    .from("life_group_sessions")
    .upsert(
      {
        organization_id: organizationId,
        life_group_id: input.lifeGroupId,
        session_date: input.date,
        notes: input.notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "life_group_id,session_date" },
    )
    .select("id")
    .single();

  if (sessionError) throw sessionError;

  if (input.personIds.length > 0) {
    const attendeeRows = input.personIds.map(personId => ({
      session_id: session.id,
      person_id: personId,
    }));

    const { error: attendeeError } = await supabase
      .from("life_group_session_attendees")
      .upsert(attendeeRows, { onConflict: "session_id,person_id" });

    if (attendeeError) throw attendeeError;
  }

  return { sessionId: session.id };
}
