import type { SupabaseClient } from "@supabase/supabase-js";
import type { EvangelismStage } from "@/lib/people";

export type GrowthTrackActivityType =
  | "follow_up_message"
  | "follow_up_call"
  | "contact"
  | "visitation"
  | "stage_advance"
  | "group_placement"
  | "outreach";

export type GrowthTrackActivity = {
  id: string;
  personId: string;
  activityType: GrowthTrackActivityType;
  notes: string;
  fromStage: EvangelismStage | null;
  toStage: EvangelismStage | null;
  cellGroupId: string | null;
  lifeGroupId: string | null;
  performedAt: string;
};

type DbGrowthTrackActivity = {
  id: string;
  person_id: string;
  activity_type: GrowthTrackActivityType;
  notes: string | null;
  from_stage: string | null;
  to_stage: string | null;
  cell_group_id: string | null;
  life_group_id: string | null;
  performed_at: string;
};

function toActivity(row: DbGrowthTrackActivity): GrowthTrackActivity {
  return {
    id: row.id,
    personId: row.person_id,
    activityType: row.activity_type,
    notes: row.notes ?? "",
    fromStage: (row.from_stage as EvangelismStage | null) ?? null,
    toStage: (row.to_stage as EvangelismStage | null) ?? null,
    cellGroupId: row.cell_group_id,
    lifeGroupId: row.life_group_id,
    performedAt: row.performed_at,
  };
}

export async function fetchGrowthTrackActivities(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<GrowthTrackActivity[]> {
  const { data, error } = await supabase
    .from("growth_track_activities")
    .select(
      "id, person_id, activity_type, notes, from_stage, to_stage, cell_group_id, life_group_id, performed_at",
    )
    .eq("organization_id", organizationId)
    .order("performed_at", { ascending: false });

  if (error) throw error;
  return (data as DbGrowthTrackActivity[]).map(toActivity);
}

export type LogGrowthTrackActivityInput = {
  personId: string;
  activityType: GrowthTrackActivityType;
  notes?: string;
  fromStage?: EvangelismStage | null;
  toStage?: EvangelismStage | null;
  cellGroupId?: string | null;
  lifeGroupId?: string | null;
};

export async function logGrowthTrackActivity(
  supabase: SupabaseClient,
  organizationId: string,
  input: LogGrowthTrackActivityInput,
): Promise<GrowthTrackActivity> {
  const { data, error } = await supabase
    .from("growth_track_activities")
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      activity_type: input.activityType,
      notes: input.notes?.trim() ?? "",
      from_stage: input.fromStage ?? null,
      to_stage: input.toStage ?? null,
      cell_group_id: input.cellGroupId ?? null,
      life_group_id: input.lifeGroupId ?? null,
    })
    .select(
      "id, person_id, activity_type, notes, from_stage, to_stage, cell_group_id, life_group_id, performed_at",
    )
    .single();

  if (error) throw error;
  return toActivity(data as DbGrowthTrackActivity);
}

export async function updatePersonEvangelismStage(
  supabase: SupabaseClient,
  organizationId: string,
  personId: string,
  stage: EvangelismStage,
): Promise<void> {
  const { error } = await supabase
    .from("people")
    .update({
      evangelism_stage: stage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", personId)
    .eq("organization_id", organizationId);

  if (error) throw error;
}

export async function getPriorSundayAttendanceCounts(
  supabase: SupabaseClient,
  organizationId: string,
  personIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (personIds.length === 0) return counts;

  for (const personId of personIds) {
    counts.set(personId, 0);
  }

  const { data, error } = await supabase
    .from("service_session_attendees")
    .select(
      `
      person_id,
      service_sessions!inner (
        organization_id,
        service_types!inner ( category )
      )
    `,
    )
    .eq("service_sessions.organization_id", organizationId)
    .in("person_id", personIds);

  if (error) throw error;

  type Row = {
    person_id: string;
    service_sessions:
      | { service_types: { category: string } | { category: string }[] }
      | { service_types: { category: string } | { category: string }[] }[];
  };

  for (const row of (data ?? []) as unknown as Row[]) {
    const session = Array.isArray(row.service_sessions)
      ? row.service_sessions[0]
      : row.service_sessions;
    const serviceType = Array.isArray(session?.service_types)
      ? session.service_types[0]
      : session?.service_types;

    if (serviceType?.category === "sunday") {
      counts.set(row.person_id, (counts.get(row.person_id) ?? 0) + 1);
    }
  }

  return counts;
}

export async function promoteFirstTimeSundayAttendees(
  supabase: SupabaseClient,
  organizationId: string,
  personIds: string[],
): Promise<void> {
  if (personIds.length === 0) return;

  const priorCounts = await getPriorSundayAttendanceCounts(
    supabase,
    organizationId,
    personIds,
  );

  const firstTimeIds = personIds.filter(id => (priorCounts.get(id) ?? 0) === 0);
  if (firstTimeIds.length === 0) return;

  const { data: people, error: fetchError } = await supabase
    .from("people")
    .select("id, membership_type, evangelism_stage")
    .eq("organization_id", organizationId)
    .in("id", firstTimeIds);

  if (fetchError) throw fetchError;

  for (const person of people ?? []) {
    const shouldPromote =
      person.evangelism_stage === "First-time Attendee" ||
      person.membership_type === "For Evangelism" ||
      person.membership_type === "Prospect";

    if (!shouldPromote) {
      continue;
    }

    const updates: Record<string, unknown> = {
      evangelism_stage: "First-time Attendee",
      updated_at: new Date().toISOString(),
    };

    if (
      person.membership_type === "Attender" ||
      person.membership_type === "Prospect"
    ) {
      updates.membership_type = "For Evangelism";
    }

    const { error: updateError } = await supabase
      .from("people")
      .update(updates)
      .eq("id", person.id)
      .eq("organization_id", organizationId);

    if (updateError) throw updateError;

    await logGrowthTrackActivity(supabase, organizationId, {
      personId: person.id,
      activityType: "stage_advance",
      notes: "First Sunday attendance recorded",
      fromStage: person.evangelism_stage as EvangelismStage,
      toStage: "First-time Attendee",
    });
  }
}
