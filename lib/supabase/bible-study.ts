import type { SupabaseClient } from "@supabase/supabase-js";

export type BibleStudyStatus = "active" | "completed" | "paused" | "cancelled";

export type BibleStudyMemberRole = "Leader" | "Member" | "Guest";

export type BibleStudyGroup = {
  id: string;
  householdId: string;
  leaderPersonId: string;
  meetingDay: string;
  meetingTime: string;
  status: BibleStudyStatus;
  startDate: string;
  completedAt: string | null;
  statusNotes: string;
};

export type BibleStudyMember = {
  id: string;
  bibleStudyGroupId: string;
  personId: string;
  role: BibleStudyMemberRole;
  joinedDate: string;
};

type DbBibleStudyGroup = {
  id: string;
  household_id: string;
  leader_person_id: string;
  meeting_day: string;
  meeting_time: string;
  status: BibleStudyStatus;
  start_date: string;
  completed_at: string | null;
  status_notes: string;
};

type DbBibleStudyMember = {
  id: string;
  bible_study_group_id: string;
  person_id: string;
  role: BibleStudyMemberRole;
  joined_date: string;
};

function toGroup(row: DbBibleStudyGroup): BibleStudyGroup {
  return {
    id: row.id,
    householdId: row.household_id,
    leaderPersonId: row.leader_person_id,
    meetingDay: row.meeting_day,
    meetingTime: row.meeting_time,
    status: row.status,
    startDate: row.start_date,
    completedAt: row.completed_at,
    statusNotes: row.status_notes,
  };
}

function toMember(row: DbBibleStudyMember): BibleStudyMember {
  return {
    id: row.id,
    bibleStudyGroupId: row.bible_study_group_id,
    personId: row.person_id,
    role: row.role,
    joinedDate: row.joined_date,
  };
}

export async function fetchBibleStudyGroups(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<BibleStudyGroup[]> {
  const { data, error } = await supabase
    .from("bible_study_groups")
    .select(
      "id, household_id, leader_person_id, meeting_day, meeting_time, status, start_date, completed_at, status_notes",
    )
    .eq("organization_id", organizationId)
    .order("start_date", { ascending: false });

  if (error) throw error;
  return (data as DbBibleStudyGroup[]).map(toGroup);
}

export async function fetchBibleStudyMembers(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<BibleStudyMember[]> {
  const { data, error } = await supabase
    .from("bible_study_group_members")
    .select(
      "id, bible_study_group_id, person_id, role, joined_date, bible_study_groups!inner(organization_id)",
    )
    .eq("bible_study_groups.organization_id", organizationId);

  if (error) throw error;
  return (data as DbBibleStudyMember[]).map(toMember);
}

export type CreateBibleStudyGroupInput = {
  householdId: string;
  leaderPersonId: string;
  meetingDay: string;
  meetingTime: string;
  startDate?: string;
};

export async function createBibleStudyGroup(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateBibleStudyGroupInput,
): Promise<BibleStudyGroup> {
  const { data, error } = await supabase
    .from("bible_study_groups")
    .insert({
      organization_id: organizationId,
      household_id: input.householdId,
      leader_person_id: input.leaderPersonId,
      meeting_day: input.meetingDay.trim(),
      meeting_time: input.meetingTime.trim(),
      start_date: input.startDate ?? new Date().toISOString().split("T")[0],
      status: "active",
    })
    .select(
      "id, household_id, leader_person_id, meeting_day, meeting_time, status, start_date, completed_at, status_notes",
    )
    .single();

  if (error) throw error;

  const group = toGroup(data as DbBibleStudyGroup);

  await addBibleStudyMember(supabase, group.id, input.leaderPersonId, "Leader");

  return group;
}

export type UpdateBibleStudyStatusInput = {
  groupId: string;
  status: BibleStudyStatus;
  statusNotes?: string;
};

export async function updateBibleStudyStatus(
  supabase: SupabaseClient,
  organizationId: string,
  input: UpdateBibleStudyStatusInput,
): Promise<BibleStudyGroup> {
  const updates: Record<string, unknown> = {
    status: input.status,
    updated_at: new Date().toISOString(),
  };

  if (input.statusNotes !== undefined) {
    updates.status_notes = input.statusNotes.trim();
  }

  if (input.status === "completed") {
    updates.completed_at = new Date().toISOString();
  } else if (input.status === "active") {
    updates.completed_at = null;
  }

  const { data, error } = await supabase
    .from("bible_study_groups")
    .update(updates)
    .eq("id", input.groupId)
    .eq("organization_id", organizationId)
    .select(
      "id, household_id, leader_person_id, meeting_day, meeting_time, status, start_date, completed_at, status_notes",
    )
    .single();

  if (error) throw error;
  return toGroup(data as DbBibleStudyGroup);
}

function memberRoleForPerson(
  personId: string,
  leaderPersonId: string,
  hostHouseholdId: string,
  personHouseholdId: string,
): BibleStudyMemberRole {
  if (personId === leaderPersonId) return "Leader";
  if (personHouseholdId === hostHouseholdId) return "Member";
  return "Guest";
}

export async function addBibleStudyMember(
  supabase: SupabaseClient,
  groupId: string,
  personId: string,
  role?: BibleStudyMemberRole,
  options?: {
    leaderPersonId?: string;
    hostHouseholdId?: string;
    personHouseholdId?: string;
  },
): Promise<BibleStudyMember> {
  let resolvedRole = role;

  if (!resolvedRole && options?.leaderPersonId && options?.hostHouseholdId && options?.personHouseholdId) {
    resolvedRole = memberRoleForPerson(
      personId,
      options.leaderPersonId,
      options.hostHouseholdId,
      options.personHouseholdId,
    );
  }

  const { data, error } = await supabase
    .from("bible_study_group_members")
    .insert({
      bible_study_group_id: groupId,
      person_id: personId,
      role: resolvedRole ?? "Member",
    })
    .select("id, bible_study_group_id, person_id, role, joined_date")
    .single();

  if (error) throw error;
  return toMember(data as DbBibleStudyMember);
}

export async function removeBibleStudyMember(
  supabase: SupabaseClient,
  membershipId: string,
): Promise<void> {
  const { error } = await supabase
    .from("bible_study_group_members")
    .delete()
    .eq("id", membershipId);

  if (error) throw error;
}

export async function updateBibleStudyMemberRole(
  supabase: SupabaseClient,
  membershipId: string,
  role: BibleStudyMemberRole,
): Promise<BibleStudyMember> {
  const { data, error } = await supabase
    .from("bible_study_group_members")
    .update({ role })
    .eq("id", membershipId)
    .select("id, bible_study_group_id, person_id, role, joined_date")
    .single();

  if (error) throw error;
  return toMember(data as DbBibleStudyMember);
}

export async function replaceBibleStudyLeader(
  supabase: SupabaseClient,
  organizationId: string,
  group: BibleStudyGroup,
  newLeaderPersonId: string,
  personHouseholdById: Map<string, string | null>,
): Promise<{ group: BibleStudyGroup; members: BibleStudyMember[] }> {
  if (group.leaderPersonId === newLeaderPersonId) {
    const { data, error } = await supabase
      .from("bible_study_group_members")
      .select("id, bible_study_group_id, person_id, role, joined_date")
      .eq("bible_study_group_id", group.id);

    if (error) throw error;
    return {
      group,
      members: (data as DbBibleStudyMember[]).map(toMember),
    };
  }

  const { data: updatedGroupRow, error: groupError } = await supabase
    .from("bible_study_groups")
    .update({
      leader_person_id: newLeaderPersonId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", group.id)
    .eq("organization_id", organizationId)
    .select(
      "id, household_id, leader_person_id, meeting_day, meeting_time, status, start_date, completed_at, status_notes",
    )
    .single();

  if (groupError) throw groupError;

  const updatedGroup = toGroup(updatedGroupRow as DbBibleStudyGroup);
  const oldLeaderId = group.leaderPersonId;

  const { data: memberships, error: membersError } = await supabase
    .from("bible_study_group_members")
    .select("id, bible_study_group_id, person_id, role, joined_date")
    .eq("bible_study_group_id", group.id);

  if (membersError) throw membersError;

  const membershipRows = (memberships ?? []) as DbBibleStudyMember[];
  const oldLeaderMembership = membershipRows.find(m => m.person_id === oldLeaderId);
  const newLeaderMembership = membershipRows.find(m => m.person_id === newLeaderPersonId);

  if (oldLeaderMembership) {
    const demotedRole = memberRoleForPerson(
      oldLeaderId,
      newLeaderPersonId,
      group.householdId,
      personHouseholdById.get(oldLeaderId) ?? "",
    );
    await updateBibleStudyMemberRole(supabase, oldLeaderMembership.id, demotedRole);
  }

  if (newLeaderMembership) {
    await updateBibleStudyMemberRole(supabase, newLeaderMembership.id, "Leader");
  } else {
    await addBibleStudyMember(supabase, group.id, newLeaderPersonId, "Leader");
  }

  const { data: refreshedMembers, error: refreshError } = await supabase
    .from("bible_study_group_members")
    .select("id, bible_study_group_id, person_id, role, joined_date")
    .eq("bible_study_group_id", group.id);

  if (refreshError) throw refreshError;

  return {
    group: updatedGroup,
    members: (refreshedMembers as DbBibleStudyMember[]).map(toMember),
  };
}

export async function setBibleStudyGroupMembers(
  supabase: SupabaseClient,
  group: BibleStudyGroup,
  personIds: string[],
  personHouseholdById: Map<string, string | null>,
): Promise<BibleStudyMember[]> {
  const leaderId = group.leaderPersonId;
  const allPersonIds = Array.from(new Set([leaderId, ...personIds]));

  const { data: existing, error: fetchError } = await supabase
    .from("bible_study_group_members")
    .select("id, person_id")
    .eq("bible_study_group_id", group.id);

  if (fetchError) throw fetchError;

  const existingByPersonId = new Map(
    (existing ?? []).map(row => [row.person_id as string, row.id as string]),
  );

  const toRemove = (existing ?? [])
    .filter(row => !allPersonIds.includes(row.person_id as string))
    .map(row => row.id as string);

  for (const membershipId of toRemove) {
    await removeBibleStudyMember(supabase, membershipId);
  }

  for (const personId of allPersonIds) {
    if (existingByPersonId.has(personId)) continue;

    await addBibleStudyMember(supabase, group.id, personId, undefined, {
      leaderPersonId: leaderId,
      hostHouseholdId: group.householdId,
      personHouseholdId: personHouseholdById.get(personId) ?? "",
    });
  }

  const { data, error } = await supabase
    .from("bible_study_group_members")
    .select("id, bible_study_group_id, person_id, role, joined_date")
    .eq("bible_study_group_id", group.id);

  if (error) throw error;
  return (data as DbBibleStudyMember[]).map(toMember);
}
