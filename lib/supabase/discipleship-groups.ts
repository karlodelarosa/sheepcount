import type { SupabaseClient } from "@supabase/supabase-js";

export type DiscipleshipGroupRole = "Leader" | "Member";

export type DiscipleshipGroup = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  isActive: boolean;
};

export type DiscipleshipGroupMember = {
  id: string;
  groupId: string;
  personId: string;
  role: DiscipleshipGroupRole;
  joinedDate: string;
};

export type DiscipleshipGroupMeeting = {
  id: string;
  groupId: string;
  meetingDate: string;
  topic: string;
  notes: string;
};

type DbDiscipleshipGroup = {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  is_active: boolean;
};

type DbDiscipleshipGroupMember = {
  id: string;
  group_id: string;
  person_id: string;
  role: DiscipleshipGroupRole;
  joined_date: string;
};

type DbDiscipleshipGroupMeeting = {
  id: string;
  group_id: string;
  meeting_date: string;
  topic: string;
  notes: string;
};

function toGroup(row: DbDiscipleshipGroup): DiscipleshipGroup {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
  };
}

function toGroupMember(row: DbDiscipleshipGroupMember): DiscipleshipGroupMember {
  return {
    id: row.id,
    groupId: row.group_id,
    personId: row.person_id,
    role: row.role,
    joinedDate: row.joined_date,
  };
}

function toGroupMeeting(row: DbDiscipleshipGroupMeeting): DiscipleshipGroupMeeting {
  return {
    id: row.id,
    groupId: row.group_id,
    meetingDate: row.meeting_date,
    topic: row.topic,
    notes: row.notes,
  };
}

export async function fetchDiscipleshipGroups(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DiscipleshipGroup[]> {
  const { data, error } = await supabase
    .from("discipleship_groups")
    .select("id, organization_id, name, description, is_active")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return (data as DbDiscipleshipGroup[]).map(toGroup);
}

export async function fetchDiscipleshipGroupMembers(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DiscipleshipGroupMember[]> {
  const { data, error } = await supabase
    .from("discipleship_group_members")
    .select(
      "id, group_id, person_id, role, joined_date, discipleship_groups!inner(organization_id, is_active)",
    )
    .eq("discipleship_groups.organization_id", organizationId)
    .eq("discipleship_groups.is_active", true);

  if (error) throw error;
  return (data as DbDiscipleshipGroupMember[]).map(toGroupMember);
}

export async function fetchDiscipleshipGroupMeetings(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DiscipleshipGroupMeeting[]> {
  const { data, error } = await supabase
    .from("discipleship_group_meetings")
    .select(
      "id, group_id, meeting_date, topic, notes, discipleship_groups!inner(organization_id, is_active)",
    )
    .eq("discipleship_groups.organization_id", organizationId)
    .eq("discipleship_groups.is_active", true)
    .order("meeting_date", { ascending: false });

  if (error) throw error;
  return (data as DbDiscipleshipGroupMeeting[]).map(toGroupMeeting);
}

export type CreateDiscipleshipGroupInput = {
  name: string;
  description?: string;
};

export async function createDiscipleshipGroup(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateDiscipleshipGroupInput,
): Promise<DiscipleshipGroup> {
  const { data, error } = await supabase
    .from("discipleship_groups")
    .insert({
      organization_id: organizationId,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
    })
    .select("id, organization_id, name, description, is_active")
    .single();

  if (error) throw error;
  return toGroup(data as DbDiscipleshipGroup);
}

export async function deleteDiscipleshipGroup(
  supabase: SupabaseClient,
  groupId: string,
): Promise<void> {
  const { error } = await supabase
    .from("discipleship_groups")
    .update({ is_active: false })
    .eq("id", groupId);

  if (error) throw error;
}

export type AddDiscipleshipGroupMemberInput = {
  groupId: string;
  personId: string;
  role?: DiscipleshipGroupRole;
};

export async function addDiscipleshipGroupMember(
  supabase: SupabaseClient,
  input: AddDiscipleshipGroupMemberInput,
): Promise<DiscipleshipGroupMember> {
  const { data, error } = await supabase
    .from("discipleship_group_members")
    .insert({
      group_id: input.groupId,
      person_id: input.personId,
      role: input.role ?? "Member",
    })
    .select("id, group_id, person_id, role, joined_date")
    .single();

  if (error) throw error;
  return toGroupMember(data as DbDiscipleshipGroupMember);
}

export async function removeDiscipleshipGroupMember(
  supabase: SupabaseClient,
  membershipId: string,
): Promise<void> {
  const { error } = await supabase
    .from("discipleship_group_members")
    .delete()
    .eq("id", membershipId);

  if (error) throw error;
}

export type CreateDiscipleshipGroupMeetingInput = {
  groupId: string;
  meetingDate: string;
  topic: string;
  notes?: string;
};

export async function createDiscipleshipGroupMeeting(
  supabase: SupabaseClient,
  input: CreateDiscipleshipGroupMeetingInput,
): Promise<DiscipleshipGroupMeeting> {
  const { data, error } = await supabase
    .from("discipleship_group_meetings")
    .insert({
      group_id: input.groupId,
      meeting_date: input.meetingDate,
      topic: input.topic.trim(),
      notes: input.notes?.trim() ?? "",
    })
    .select("id, group_id, meeting_date, topic, notes")
    .single();

  if (error) throw error;
  return toGroupMeeting(data as DbDiscipleshipGroupMeeting);
}

export async function deleteDiscipleshipGroupMeeting(
  supabase: SupabaseClient,
  meetingId: string,
): Promise<void> {
  const { error } = await supabase
    .from("discipleship_group_meetings")
    .delete()
    .eq("id", meetingId);

  if (error) throw error;
}
